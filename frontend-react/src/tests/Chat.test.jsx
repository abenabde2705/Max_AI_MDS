import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../components/Chat.jsx';

// Mock simple du navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock simple d'axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ data: [] })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}));

// Mock du localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => 'test-token'),
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

  it('renders chat interface', () => {
    render(<ChatWrapper />);
    
    expect(screen.getByText('MAX')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/écrire un message/i)).toBeInTheDocument();
  });

  it('shows welcome message', () => {
    render(<ChatWrapper />);
    
    expect(screen.getByText(/bienvenue/i)).toBeInTheDocument();
  });

  it('displays navigation elements', () => {
    render(<ChatWrapper />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles authentication redirect', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    render(<ChatWrapper />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});