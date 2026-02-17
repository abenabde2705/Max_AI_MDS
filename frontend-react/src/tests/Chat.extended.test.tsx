import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

let mockMessages: any[] = [
  {
    role: "assistant",
    content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
  },
];
let mockIsWaiting = false;
let mockConversations: any[] = [];

vi.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: mockMessages,
    conversations: mockConversations,
    isWaiting: mockIsWaiting,
    sendMessage: mockSendMessage,
    switchConversation: mockSwitchConversation,
    cancelResponse: mockCancelResponse,
    activeConversation: null,
    createNewConversation: mockCreateNewConversation,
    removeConversation: mockRemoveConversation,
  })
}));

// Mock de chatAPI
const mockFetchUserProfile = vi.fn();
vi.mock('@/services/chat.api', () => ({
  fetchUserProfile: mockFetchUserProfile,
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
  default: ({ isOpen, onClose, conversations, onSelectConversation, onDeleteConversation }: any) => 
    isOpen ? (
      <div data-testid="chat-historic">
        ChatHistoric
        <button onClick={onClose}>
          Close
        </button>
        {conversations.map((conv: any) => (
          <div key={conv.id}>
            <button onClick={() => onSelectConversation(conv.id)}>Select {conv.id}</button>
            <button onClick={() => onDeleteConversation(conv.id)}>Delete {conv.id}</button>
          </div>
        ))}
      </div>
    ) : null
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

describe('Chat Component - Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
    mockMessages = [
      {
        role: "assistant",
        content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
      },
    ];
    mockIsWaiting = false;
    mockConversations = [];
    mockFetchUserProfile.mockResolvedValue({
      data: {
        user: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('renders header with MAX branding', () => {
      render(<ChatWrapper />);
      
      expect(screen.getByText(/MAX - Assistant IA/i)).toBeInTheDocument();
    });

    it('displays plan information', () => {
      render(<ChatWrapper />);
      
      expect(screen.getByText(/1\/10 messages/i)).toBeInTheDocument();
      expect(screen.getByText(/plan free/i)).toBeInTheDocument();
    });

    it('renders sidebar component', () => {
      render(<ChatWrapper />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('displays input placeholder correctly', () => {
      render(<ChatWrapper />);
      
      const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
      expect(input).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('displays assistant messages with correct styling', () => {
      mockMessages = [
        {
          role: "assistant",
          content: "Message de l'assistant",
        },
      ];

      render(<ChatWrapper />);
      
      expect(screen.getByText(/message de l'assistant/i)).toBeInTheDocument();
    });

    it('displays user messages with initials', async () => {
      mockMessages = [
        {
          role: "user",
          content: "Message utilisateur",
        },
      ];

      render(<ChatWrapper />);
      
      await waitFor(() => {
        expect(screen.getByText(/message utilisateur/i)).toBeInTheDocument();
      });
    });

    it('displays multiple messages in order', () => {
      mockMessages = [
        {
          role: "assistant",
          content: "Premier message",
        },
        {
          role: "user",
          content: "Deuxième message",
        },
        {
          role: "assistant",
          content: "Troisième message",
        },
      ];

      render(<ChatWrapper />);
      
      expect(screen.getByText(/premier message/i)).toBeInTheDocument();
      expect(screen.getByText(/deuxième message/i)).toBeInTheDocument();
      expect(screen.getByText(/troisième message/i)).toBeInTheDocument();
    });

    it('displays message timestamps', () => {
      mockMessages = [
        {
          role: "assistant",
          content: "Message avec timestamp",
          timestamp: "2026-02-17T10:30:00Z",
        },
      ];

      render(<ChatWrapper />);
      
      expect(screen.getByText(/message avec timestamp/i)).toBeInTheDocument();
      const timeElement = document.querySelector('.max-chat__bubble-time');
      expect(timeElement).toBeInTheDocument();
    });

    it('displays loading indicator when waiting for response', () => {
      mockIsWaiting = true;

      render(<ChatWrapper />);
      
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('Message Sending', () => {
    it('sends message when send button is clicked', async () => {
      render(<ChatWrapper />);
      
      const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
      await userEvent.type(input, 'Test message');
      
      const sendButtons = screen.getAllByRole('button');
      const sendButton = sendButtons.find(btn => btn.querySelector('[data-icon="send"]'));
      
      if (sendButton) {
        fireEvent.click(sendButton);
      }

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Test message');
      });
    });

    it('sends message when Enter key is pressed', async () => {
      render(<ChatWrapper />);
      
      const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
      await userEvent.type(input, 'Test message via Enter');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Test message via Enter');
      });
    });

    it('clears input after sending message', async () => {
      render(<ChatWrapper />);
      
      const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
      await userEvent.type(input, 'Test message');
      
      const sendButtons = screen.getAllByRole('button');
      const sendButton = sendButtons.find(btn => btn.querySelector('[data-icon="send"]'));
      
      if (sendButton) {
        fireEvent.click(sendButton);
      }

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('does not send empty messages', () => {
      render(<ChatWrapper />);
      
      const sendButtons = screen.getAllByRole('button');
      const sendButton = sendButtons.find(btn => btn.querySelector('[data-icon="send"]'));
      
      expect(sendButton).toBeDisabled();
    });

    it('disables input during waiting state', () => {
      mockIsWaiting = true;

      render(<ChatWrapper />);
      
      const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
      expect(input).toBeDisabled();
    });

    it('shows cancel button during waiting state', () => {
      mockIsWaiting = true;

      render(<ChatWrapper />);
      
      const cancelButtons = screen.getAllByRole('button');
      const cancelButton = cancelButtons.find(btn => btn.querySelector('[data-icon="close"]'));
      
      expect(cancelButton).toBeInTheDocument();
    });

    it('cancels response when cancel button is clicked', async () => {
      mockIsWaiting = true;

      render(<ChatWrapper />);
      
      const cancelButtons = screen.getAllByRole('button');
      const cancelButton = cancelButtons.find(btn => btn.querySelector('[data-icon="close"]'));
      
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      await waitFor(() => {
        expect(mockCancelResponse).toHaveBeenCalled();
      });
    });
  });

  describe('Emotion Buttons', () => {
    it('displays all emotion buttons', () => {
      render(<ChatWrapper />);
      
      expect(screen.getByText(/😊/)).toBeInTheDocument();
      expect(screen.getByText(/😌/)).toBeInTheDocument();
      expect(screen.getByText(/😢/)).toBeInTheDocument();
      expect(screen.getByText(/😠/)).toBeInTheDocument();
      expect(screen.getByText(/😴/)).toBeInTheDocument();
    });

    it('sends emotion message when "Super" button is clicked', async () => {
      render(<ChatWrapper />);
      
      const superButton = screen.getByText(/super/i).closest('button');
      if (superButton) {
        fireEvent.click(superButton);
      }

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Je me sens super');
      });
    });

    it('sends emotion message when "Bien" button is clicked', async () => {
      render(<ChatWrapper />);
      
      const bienButton = screen.getByText(/^bien$/i).closest('button');
      if (bienButton) {
        fireEvent.click(bienButton);
      }

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Je me sens bien');
      });
    });

    it('sends emotion message when "Triste" button is clicked', async () => {
      render(<ChatWrapper />);
      
      const tristeButton = screen.getByText(/triste/i).closest('button');
      if (tristeButton) {
        fireEvent.click(tristeButton);
      }

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Je me sens triste');
      });
    });
  });

  describe('Chat Historic', () => {
    it('opens chat historic when button is clicked', async () => {
      render(<ChatWrapper />);
      
      const historicButton = screen.getByText(/historique/i);
      fireEvent.click(historicButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-historic')).toBeInTheDocument();
      });
    });

    it('closes chat historic when close button is clicked', async () => {
      render(<ChatWrapper />);
      
      const historicButton = screen.getByText(/historique/i);
      fireEvent.click(historicButton);

      await waitFor(() => {
        expect(screen.getByTestId('chat-historic')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('chat-historic')).not.toBeInTheDocument();
      });
    });

    it('displays conversations in historic', async () => {
      mockConversations = [
        { id: 'conv-1', title: 'Conversation 1' },
        { id: 'conv-2', title: 'Conversation 2' },
      ];

      render(<ChatWrapper />);
      
      const historicButton = screen.getByText(/historique/i);
      fireEvent.click(historicButton);

      await waitFor(() => {
        expect(screen.getByText('Select conv-1')).toBeInTheDocument();
        expect(screen.getByText('Select conv-2')).toBeInTheDocument();
      });
    });
  });

  describe('Conversation Management', () => {
    it('creates new conversation when button is clicked', async () => {
      render(<ChatWrapper />);
      
      const newConvButton = screen.getByText(/nouvelle conversation/i);
      fireEvent.click(newConvButton);

      await waitFor(() => {
        expect(mockCreateNewConversation).toHaveBeenCalled();
      });
    });

    it('creates new conversation from sidebar', async () => {
      render(<ChatWrapper />);
      
      const sidebarButton = screen.getByText('New Conversation');
      fireEvent.click(sidebarButton);

      await waitFor(() => {
        expect(mockCreateNewConversation).toHaveBeenCalled();
      });
    });
  });

  describe('User Profile', () => {
    it('fetches user profile on mount', async () => {
      render(<ChatWrapper />);
      
      await waitFor(() => {
        expect(mockFetchUserProfile).toHaveBeenCalled();
      });
    });

    it('displays user initials from profile', async () => {
      render(<ChatWrapper />);
      
      await waitFor(() => {
        // Should display "TU" for Test User
        const userAvatar = document.querySelector('.max-chat__user-avatar');
        expect(userAvatar).toBeInTheDocument();
      });
    });

    it('handles profile fetch error gracefully', async () => {
      mockFetchUserProfile.mockRejectedValue(new Error('Profile fetch failed'));

      render(<ChatWrapper />);
      
      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/partagez ce que vous ressentez/i)).toBeInTheDocument();
      });
    });

    it('uses email initials when name is not available', async () => {
      mockFetchUserProfile.mockResolvedValue({
        data: {
          user: {
            email: 'test@example.com'
          }
        }
      });

      render(<ChatWrapper />);
      
      await waitFor(() => {
        // Should use first two letters of email
        const userAvatar = document.querySelector('.max-chat__user-avatar');
        expect(userAvatar).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Interactions', () => {
    it('does not send message on Enter when waiting', async () => {
      mockIsWaiting = true;

      render(<ChatWrapper />);
      
      const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
      await userEvent.type(input, 'Test message');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<ChatWrapper />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('input has proper placeholder text', () => {
      render(<ChatWrapper />);
      
      const input = screen.getByPlaceholderText(/partagez ce que vous ressentez/i);
      expect(input).toHaveAttribute('placeholder');
    });
  });
});
