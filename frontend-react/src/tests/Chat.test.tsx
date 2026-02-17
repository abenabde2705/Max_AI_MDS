import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../components/Chat.tsx';
import userEvent from '@testing-library/user-event';

// Mock du navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock du useChat hook
const mockSendMessage = vi.fn();
const mockSwitchConversation = vi.fn();
const mockCancelResponse = vi.fn();
const mockCreateNewConversation = vi.fn();
const mockRemoveConversation = vi.fn();

vi.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [
      {
        role: "assistant",
        content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
      },
    ],
    conversations: [],
    isWaiting: false,
    sendMessage: mockSendMessage,
    switchConversation: mockSwitchConversation,
    cancelResponse: mockCancelResponse,
    activeConversation: null,
    createNewConversation: mockCreateNewConversation,
    removeConversation: mockRemoveConversation,
  })
}));

// Mock de chatAPI
vi.mock('@/services/chat.api', () => ({
  fetchUserProfile: vi.fn(() => Promise.resolve({
    data: {
      user: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      }
    }
  })),
  fetchConversations: vi.fn(() => Promise.resolve({ data: [] })),
  fetchMessages: vi.fn(() => Promise.resolve({ data: { messages: [] } })),
  createConversation: vi.fn(() => Promise.resolve({ data: { id: '1' } })),
  sendUserMessage: vi.fn(() => Promise.resolve({ data: {} })),
  sendAIMessage: vi.fn(() => Promise.resolve({ data: {} })),
  askAI: vi.fn(() => Promise.resolve({ data: {} })),
  deleteConversation: vi.fn(() => Promise.resolve({ data: {} })),
}));

// Mock des composants UI
vi.mock('@/ui/components/Button', () => ({
  Button: ({ children, onClick, className, disabled, variant, size, type }: any) => (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      type={type || 'button'}
    >
      {children}
    </button>
  )
}));

vi.mock('@/ui/components/Input', () => ({
  Input: ({ value, onChange, onKeyDown, placeholder, className, disabled, type }: any) => (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      type={type || 'text'}
    />
  )
}));

vi.mock('@/ui/icons', () => ({
  Icon: ({ name, size, color }: any) => (
    <span data-icon={name} data-size={size} data-color={color}>
      Icon-{name}
    </span>
  )
}));

// Mock des autres composants
vi.mock('../components/ChatHistoric', () => ({
  default: ({ isOpen, onClose }: any) => 
    isOpen ? <div data-testid="chat-historic">ChatHistoric<button onClick={onClose}>Close</button></div> : null
}));

vi.mock('../components/Sidebar', () => ({
  default: ({ onCreateNewConversation }: any) => (
    <div data-testid="sidebar">
      <button onClick={onCreateNewConversation}>New Conversation</button>
    </div>
  )
}));

// Mock du localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'test-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};
Object.defineProperty(globalThis, 'localStorage', { 
  value: mockLocalStorage,
  writable: true 
});

const ChatWrapper: React.FC = () => (
  <BrowserRouter>
    <Chat />
  </BrowserRouter>
);

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  it('renders chat interface', () => {
    render(<ChatWrapper />);
    
    expect(screen.getByText(/MAX - Assistant IA/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/partagez ce que vous ressentez/i)).toBeInTheDocument();
  });

  it('shows welcome message', () => {
    render(<ChatWrapper />);
    
    expect(screen.getByText(/bonjour, je suis là pour vous écouter/i)).toBeInTheDocument();
  });

  it('displays navigation elements', () => {
    render(<ChatWrapper />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays emotion buttons', () => {
    render(<ChatWrapper />);
    
    expect(screen.getByText(/super/i)).toBeInTheDocument();
    expect(screen.getByText(/bien/i)).toBeInTheDocument();
    expect(screen.getByText(/triste/i)).toBeInTheDocument();
    expect(screen.getByText(/en colère/i)).toBeInTheDocument();
    expect(screen.getByText(/fatigué/i)).toBeInTheDocument();
  });

  it('sends message when user types and clicks send', async () => {
    render(<ChatWrapper />);
    
    const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(btn => btn.querySelector('[data-icon="send"]'));

    await userEvent.type(input, 'Bonjour MAX');
    
    if (sendButton) {
      fireEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Bonjour MAX');
    });
  });

  it('sends emotion when emotion button is clicked', async () => {
    render(<ChatWrapper />);
    
    const superButton = screen.getByText(/super/i);
    fireEvent.click(superButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Je me sens super');
    });
  });

  it('opens chat historic when historic button is clicked', async () => {
    render(<ChatWrapper />);
    
    const historicButton = screen.getByText(/historique/i);
    fireEvent.click(historicButton);

    await waitFor(() => {
      expect(screen.getByTestId('chat-historic')).toBeInTheDocument();
    });
  });

  it('creates new conversation when button is clicked', async () => {
    render(<ChatWrapper />);
    
    const newConvButton = screen.getByText(/nouvelle conversation/i);
    fireEvent.click(newConvButton);

    await waitFor(() => {
      expect(mockCreateNewConversation).toHaveBeenCalled();
    });
  });

  it('sends message on Enter key press', async () => {
    render(<ChatWrapper />);
    
    const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);

    await userEvent.type(input, 'Test message');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  it('disables send button when message is empty', () => {
    render(<ChatWrapper />);
    
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(btn => btn.querySelector('[data-icon="send"]'));

    expect(sendButton).toHaveAttribute('disabled');
  });

  it('displays user initials', async () => {
    render(<ChatWrapper />);
    
    await waitFor(() => {
      // Should display user initials from mocked profile (T and U from Test User)
      const initialsElement = document.querySelector('.max-chat__user-avatar');
      expect(initialsElement).toBeInTheDocument();
    });
  });

  it('displays assistant messages with logo', () => {
    render(<ChatWrapper />);
    
    const assistantMessage = screen.getByText(/bonjour, je suis là pour vous écouter/i);
    expect(assistantMessage).toBeInTheDocument();
    
    // Check for assistant badge/logo
    const badges = document.querySelectorAll('.max-chat__badge');
    expect(badges.length).toBeGreaterThan(0);
  });
});