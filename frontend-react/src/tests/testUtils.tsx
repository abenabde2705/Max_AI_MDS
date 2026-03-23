import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock du navigate
export const mockNavigate = vi.fn();

// Mock du localStorage
export const mockLocalStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
};

// Mock du useChat hook
export const mockUseChat = {
  messages: [
    {
      role: "assistant",
      content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
    },
  ],
  conversations: [],
  isWaiting: false,
  sendMessage: vi.fn(),
  switchConversation: vi.fn(),
  cancelResponse: vi.fn(),
  activeConversation: null,
  createNewConversation: vi.fn(),
  removeConversation: vi.fn(),
};

// Mock de chatAPI
export const mockChatAPI = {
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
};

// Mock d'axios
export const mockAxios = {
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({
      data: {
        token: 'fake-token',
        user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' }
      }
    })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: [] })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    }))
  }
};

// Setup mocks pour react-router-dom
export const setupRouterMocks = () => {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate
    };
  });
};

// Setup mocks pour axios
export const setupAxiosMocks = () => {
  vi.mock('axios', () => mockAxios);
};

// Setup mocks pour localStorage
export const setupLocalStorageMocks = () => {
  Object.defineProperty(globalThis, 'localStorage', { 
    value: mockLocalStorage,
    writable: true
  });
};

// Setup mocks pour useChat
export const setupUseChatMocks = () => {
  vi.mock('@/hooks/useChat', () => ({
    useChat: () => mockUseChat
  }));
};

// Setup mocks pour chat.api
export const setupChatAPIMocks = () => {
  vi.mock('@/services/chat.api', () => mockChatAPI);
};

// Setup mocks pour les composants UI
export const setupUIComponentMocks = () => {
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
};

// Setup mocks pour les autres composants
export const setupComponentMocks = () => {
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

  vi.mock('../../layout/NavBar', () => ({
    default: () => <nav data-testid="navbar">NavBar</nav>
  }));

  vi.mock('../../layout/Footer', () => ({
    default: () => <footer data-testid="footer">Footer</footer>
  }));
};

// Wrapper personnalisé avec Router
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Custom render avec providers
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Reset tous les mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  mockLocalStorage.getItem.mockReturnValue(null);
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockUseChat.messages = [
    {
      role: "assistant",
      content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
    },
  ];
  mockUseChat.conversations = [];
  mockUseChat.isWaiting = false;
  mockUseChat.activeConversation = null;
  mockUseChat.sendMessage.mockClear();
  mockUseChat.switchConversation.mockClear();
  mockUseChat.cancelResponse.mockClear();
  mockUseChat.createNewConversation.mockClear();
  mockUseChat.removeConversation.mockClear();
};

// Export tout pour être réutilisé
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
