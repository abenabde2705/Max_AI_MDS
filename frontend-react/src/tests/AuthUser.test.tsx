import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthUser from '../components/Authentication/AuthUser.tsx';
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

// Mock du localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => null),
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

// Mock de fetch
globalThis.fetch = vi.fn();

const AuthWrapper: React.FC = () => (
  <BrowserRouter>
    <AuthUser />
  </BrowserRouter>
);

describe('AuthUser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'fake-token',
        user: { 
          id: '1', 
          email: 'test@example.com', 
          firstName: 'Test', 
          lastName: 'User' 
        }
      })
    });
  });

  it('renders login form by default', () => {
    render(<AuthWrapper />);

    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre mot de passe/i)).toBeInTheDocument();
  });

  it('displays form elements', () => {
    render(<AuthWrapper />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
    const loginButton = screen.getByText(/connexion/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it('renders without errors', () => {
    const { container } = render(<AuthWrapper />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('toggles between login and register modes', async () => {
    render(<AuthWrapper />);

    // Initially in login mode
    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
    
    // Click on "Inscription ici" button
    const toggleButton = screen.getByText(/inscription ici/i);
    fireEvent.click(toggleButton);

    // Should now be in register mode
    await waitFor(() => {
      expect(screen.getByText(/inscription/i)).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText(/votre prénom/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre nom/i)).toBeInTheDocument();
  });

  it('displays error message when form validation fails', async () => {
    render(<AuthWrapper />);

    // Submit form without filling fields
    const submitButton = screen.getByText(/connexion/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    render(<AuthWrapper />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
    const submitButton = screen.getByText(/connexion/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          })
        })
      );
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays Google and Facebook login buttons', () => {
    render(<AuthWrapper />);

    const googleButton = screen.getByText(/connexion avec google/i);
    const facebookButton = screen.getByText(/connexion avec facebook/i);

    expect(googleButton).toBeInTheDocument();
    expect(facebookButton).toBeInTheDocument();
  });

  it('handles remember me checkbox', async () => {
    render(<AuthWrapper />);

    const rememberMeLabel = screen.getByText(/rester connecté/i);
    fireEvent.click(rememberMeLabel);

    // Checkbox should be checked (visual indicator with SVG)
    await waitFor(() => {
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    (globalThis.fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ token: 'fake-token', user: { id: '1' } })
      }), 100))
    );

    render(<AuthWrapper />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
    const submitButton = screen.getByText(/connexion/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/chargement/i)).toBeInTheDocument();
    });
  });

  it('validates password match in register mode', async () => {
    render(<AuthWrapper />);

    // Switch to register mode
    const toggleButton = screen.getByText(/inscription ici/i);
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/votre prénom/i)).toBeInTheDocument();
    });

    const firstNameInput = screen.getByPlaceholderText(/votre prénom/i);
    const lastNameInput = screen.getByPlaceholderText(/votre nom/i);
    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirmez votre mot de passe/i);
    const birthDateInput = screen.getByLabelText(/date de naissance/i);
    
    await userEvent.type(firstNameInput, 'John');
    await userEvent.type(lastNameInput, 'Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(birthDateInput, '1990-01-01');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'differentpassword');

    const submitButton = screen.getByText(/inscription/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  it('handles API error responses', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Email ou mot de passe incorrect'
      })
    });

    render(<AuthWrapper />);

    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
    const submitButton = screen.getByText(/connexion/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
    });
  });
});