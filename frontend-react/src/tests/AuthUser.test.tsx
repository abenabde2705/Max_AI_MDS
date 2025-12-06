import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthUser from '../components/Authentication/AuthUser.tsx';

// Mock du navigate
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
    post: vi.fn(() => Promise.resolve({
      data: {
        token: 'fake-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      }
    }))
  }
}));

// Mock du localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

const AuthWrapper: React.FC = () => (
  <BrowserRouter>
    <AuthUser />
  </BrowserRouter>
);

describe('AuthUser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('renders login form by default', () => {
    render(<AuthWrapper />);

    expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
  });

  it('displays form elements', () => {
    render(<AuthWrapper />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const loginButton = screen.getByText(/se connecter/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it('renders without errors', () => {
    const { container } = render(<AuthWrapper />);

    expect(container.firstChild).toBeInTheDocument();
  });
});