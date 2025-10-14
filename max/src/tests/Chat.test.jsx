import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chat from '../components/Chat.jsx';

// Mock du store
const mockUser = { id: '1', firstName: 'Test', email: 'test@example.com' };
const mockToken = 'test-token';

vi.mock('../store/authStore', () => ({
  default: () => ({
    user: mockUser,
    token: mockToken
  })
}));

// Mock d'axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome screen for new user', async () => {
    const axios = await import('axios');
    axios.default.get.mockResolvedValue({ data: [] }); // Pas de conversations

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText(/bienvenue dans max/i)).toBeInTheDocument();
      expect(screen.getByText(/nouvelle conversation/i)).toBeInTheDocument();
    });
  });

  it('loads existing conversations', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Conversation 1', started_at: new Date() },
      { id: '2', title: 'Conversation 2', started_at: new Date() }
    ];
    
    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: [] });
      }
    });

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('Conversation 1')).toBeInTheDocument();
      expect(screen.getByText('Conversation 2')).toBeInTheDocument();
    });
  });

  it('creates new conversation', async () => {
    const axios = await import('axios');
    const newConversation = { 
      id: '3', 
      title: 'Nouvelle conversation', 
      started_at: new Date() 
    };

    axios.default.get.mockResolvedValue({ data: [] });
    axios.default.post.mockResolvedValue({ data: newConversation });

    render(<Chat />);

    await waitFor(() => {
      const newChatButton = screen.getByText(/nouvelle conversation/i);
      fireEvent.click(newChatButton);
    });

    await waitFor(() => {
      expect(axios.default.post).toHaveBeenCalledWith(
        expect.stringContaining('/conversations'),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  it('sends and receives messages', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Test Conversation', started_at: new Date() }
    ];
    const mockMessage = {
      id: '1',
      content: 'Test message',
      sender: 'user',
      sent_at: new Date()
    };

    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: [] });
      }
    });
    
    axios.default.post.mockResolvedValue({ data: mockMessage });

    render(<Chat />);

    await waitFor(() => {
      const messageInput = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      
      const sendButton = screen.getByRole('button', { name: /envoyer/i });
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(axios.default.post).toHaveBeenCalledWith(
        expect.stringContaining('/messages'),
        expect.objectContaining({
          content: 'Test message',
          sender: 'user'
        }),
        expect.any(Object)
      );
    });
  });

  it('deletes conversation', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Test Conversation', started_at: new Date() }
    ];

    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      return Promise.resolve({ data: [] });
    });
    
    axios.default.delete.mockResolvedValue({ data: { message: 'Conversation supprimée' } });

    render(<Chat />);

    await waitFor(() => {
      const deleteButton = screen.getByTitle(/supprimer la conversation/i);
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(axios.default.delete).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/1'),
        expect.any(Object)
      );
    });
  });

  it('handles loading states', async () => {
    const axios = await import('axios');
    axios.default.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<Chat />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('handles error states', async () => {
    const axios = await import('axios');
    axios.default.get.mockRejectedValue(new Error('Network error'));

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument();
    });
  });

  it('validates message input', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Test Conversation', started_at: new Date() }
    ];

    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      return Promise.resolve({ data: [] });
    });

    render(<Chat />);

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /envoyer/i });
      fireEvent.click(sendButton); // Envoyer sans message
    });

    // Ne doit pas envoyer de requête
    expect(axios.default.post).not.toHaveBeenCalled();
  });
});