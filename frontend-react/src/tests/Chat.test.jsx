import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../components/Chat.jsx';

// Mock du navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock d'axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock du localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const ChatWrapper = () => (
  <BrowserRouter>
    <Chat />
  </BrowserRouter>
);

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  it('renders welcome screen for new user', async () => {
    const axios = await import('axios');
    axios.default.get.mockResolvedValue({ data: [] }); // Pas de conversations

    render(<ChatWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/bienvenue dans max/i)).toBeInTheDocument();
      expect(screen.getByText(/nouvelle conversation/i)).toBeInTheDocument();
    });
  });

  it('loads existing conversations', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Conversation 1', started_at: new Date().toISOString() },
      { id: '2', title: 'Conversation 2', started_at: new Date().toISOString() }
    ];
    
    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: [] });
      }
    });

    render(<ChatWrapper />);

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
      started_at: new Date().toISOString() 
    };

    axios.default.get.mockResolvedValue({ data: [] });
    axios.default.post.mockResolvedValue({ data: newConversation });

    render(<ChatWrapper />);

    await waitFor(() => {
      const newChatButton = screen.getByRole('button', { name: /nouvelle conversation/i });
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

  it('sends message to conversation', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Test Conversation', started_at: new Date().toISOString() }
    ];
    const mockMessage = {
      id: '1',
      content: 'Test message',
      sender: 'user',
      sent_at: new Date().toISOString()
    };

    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      if (url.includes('/messages')) {
        return Promise.resolve({ data: [] });
      }
    });
    
    axios.default.post.mockImplementation((url) => {
      if (url.includes('/messages')) {
        return Promise.resolve({ data: mockMessage });
      }
      return Promise.resolve({ data: {} });
    });

    render(<ChatWrapper />);

    // Attendre que la conversation se charge
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    // Trouver et remplir l'input de message
    const messageInput = screen.getByPlaceholderText(/tapez votre message/i);
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    // Envoyer le message
    const sendButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(sendButton);

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
      { id: '1', title: 'Test Conversation', started_at: new Date().toISOString() }
    ];

    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      return Promise.resolve({ data: [] });
    });
    
    axios.default.delete.mockResolvedValue({ data: { message: 'Conversation supprimée' } });

    render(<ChatWrapper />);

    await waitFor(() => {
      const deleteButton = screen.getByTitle(/supprimer/i);
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
      new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
    );

    render(<ChatWrapper />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('handles connection error', async () => {
    const axios = await import('axios');
    axios.default.get.mockRejectedValue(new Error('Network error'));

    render(<ChatWrapper />);

    await waitFor(() => {
      expect(screen.getByText(/erreur de connexion/i)).toBeInTheDocument();
    });
  });

  it('redirects when no token', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(<ChatWrapper />);

    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('validates message input', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Test Conversation', started_at: new Date().toISOString() }
    ];

    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      return Promise.resolve({ data: [] });
    });

    render(<ChatWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });

    // Essayer d'envoyer un message vide
    const sendButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(sendButton);

    // Ne doit pas envoyer de requête POST pour les messages
    expect(axios.default.post).not.toHaveBeenCalledWith(
      expect.stringContaining('/messages'),
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('switches between conversations', async () => {
    const axios = await import('axios');
    const mockConversations = [
      { id: '1', title: 'Conversation 1', started_at: new Date().toISOString() },
      { id: '2', title: 'Conversation 2', started_at: new Date().toISOString() }
    ];

    axios.default.get.mockImplementation((url) => {
      if (url.includes('/conversations')) {
        return Promise.resolve({ data: mockConversations });
      }
      return Promise.resolve({ data: [] });
    });

    render(<ChatWrapper />);

    await waitFor(() => {
      expect(screen.getByText('Conversation 1')).toBeInTheDocument();
      expect(screen.getByText('Conversation 2')).toBeInTheDocument();
    });

    // Cliquer sur la deuxième conversation
    const conversation2 = screen.getByText('Conversation 2');
    fireEvent.click(conversation2);

    // Vérifier que les messages de la conversation 2 sont demandés
    await waitFor(() => {
      expect(axios.default.get).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/2/messages'),
        expect.any(Object)
      );
    });
  });
});