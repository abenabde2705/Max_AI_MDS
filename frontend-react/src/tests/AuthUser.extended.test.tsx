import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

describe('AuthUser Component - Extended Tests', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render', () => {
    it('renders navbar and footer', () => {
      render(<AuthWrapper />);

      expect(screen.getByAltText(/MAX/i)).toBeInTheDocument();
    });

    it('displays logo and welcome text', () => {
      render(<AuthWrapper />);

      expect(screen.getByText(/bienvenue/i)).toBeInTheDocument();
      expect(screen.getByText(/découvrez une nouvelle façon/i)).toBeInTheDocument();
    });

    it('renders all required form labels', () => {
      render(<AuthWrapper />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });
  });

  describe('Login Mode', () => {
    it('submits login with valid credentials', async () => {
      render(<AuthWrapper />);

      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(passwordInput, 'SecurePass123');
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'john@example.com',
              password: 'SecurePass123'
            })
          })
        );
      });
    });

    it('shows error for empty email', async () => {
      render(<AuthWrapper />);

      const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
      });
    });

    it('shows error for empty password', async () => {
      render(<AuthWrapper />);

      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le mot de passe est requis/i)).toBeInTheDocument();
      });
    });

    it('stores token and user data in localStorage after successful login', async () => {
      render(<AuthWrapper />);

      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('name', 'Test User');
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userId', '1');
      });
    });

    it('redirects to dashboard after successful login', async () => {
      render(<AuthWrapper />);

      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Register Mode', () => {
    it('switches to register mode and displays additional fields', async () => {
      render(<AuthWrapper />);

      const toggleButton = screen.getByText(/inscription ici/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/votre prénom/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/votre nom/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date de naissance/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/confirmez votre mot de passe/i)).toBeInTheDocument();
      });
    });

    it('validates all required fields in register mode', async () => {
      render(<AuthWrapper />);

      const toggleButton = screen.getByText(/inscription ici/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/^inscription$/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/^inscription$/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le prénom est requis/i)).toBeInTheDocument();
      });
    });

    it('validates first name is required', async () => {
      render(<AuthWrapper />);

      const toggleButton = screen.getByText(/inscription ici/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/votre nom/i)).toBeInTheDocument();
      });

      const lastNameInput = screen.getByPlaceholderText(/votre nom/i);
      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const submitButton = screen.getByText(/^inscription$/i);

      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le prénom est requis/i)).toBeInTheDocument();
      });
    });

    it('validates last name is required', async () => {
      render(<AuthWrapper />);

      const toggleButton = screen.getByText(/inscription ici/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/votre prénom/i)).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText(/votre prénom/i);
      const submitButton = screen.getByText(/^inscription$/i);

      await userEvent.type(firstNameInput, 'John');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/le nom est requis/i)).toBeInTheDocument();
      });
    });

    it('validates birth date is required', async () => {
      render(<AuthWrapper />);

      const toggleButton = screen.getByText(/inscription ici/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/votre prénom/i)).toBeInTheDocument();
      });

      const firstNameInput = screen.getByPlaceholderText(/votre prénom/i);
      const lastNameInput = screen.getByPlaceholderText(/votre nom/i);
      const submitButton = screen.getByText(/^inscription$/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/la date de naissance est requise/i)).toBeInTheDocument();
      });
    });

    it('validates password confirmation matches', async () => {
      render(<AuthWrapper />);

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
      const submitButton = screen.getByText(/^inscription$/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(birthDateInput, '1990-01-01');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'differentpassword');
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/les mots de passe ne correspondent pas/i)).toBeInTheDocument();
      });
    });

    it('requires acceptance of terms and conditions', async () => {
      render(<AuthWrapper />);

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
      const submitButton = screen.getByText(/^inscription$/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(birthDateInput, '1990-01-01');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/veuillez accepter les termes/i)).toBeInTheDocument();
      });
    });

    it('submits registration with all valid data', async () => {
      render(<AuthWrapper />);

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
      const acceptTermsCheckbox = screen.getByLabelText(/j'accepte les/i);
      const submitButton = screen.getByText(/^inscription$/i);

      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(emailInput, 'john@example.com');
      await userEvent.type(birthDateInput, '1990-01-01');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      fireEvent.click(acceptTermsCheckbox);
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/register',
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });
  });

  describe('Social Login', () => {
    it('redirects to Google OAuth on Google button click', () => {
      // Mock globalThis.location.href
      delete (globalThis as any).location;
      (globalThis as any).location = { href: '' };

      render(<AuthWrapper />);

      const googleButton = screen.getByText(/connexion avec google/i);
      fireEvent.click(googleButton);

      expect(globalThis.location.href).toBe('http://localhost:3000/api/auth/google');
    });

    it('redirects to Facebook OAuth on Facebook button click', () => {
      // Mock globalThis.location.href
      delete (globalThis as any).location;
      (globalThis as any).location = { href: '' };

      render(<AuthWrapper />);

      const facebookButton = screen.getByText(/connexion avec facebook/i);
      fireEvent.click(facebookButton);

      expect(globalThis.location.href).toBe('http://localhost:3000/api/auth/facebook');
    });
  });

  describe('Error Handling', () => {
    it('displays API error message on login failure', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({
          message: 'Identifiants invalides'
        })
      });

      render(<AuthWrapper />);

      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(emailInput, 'wrong@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/identifiants invalides/i)).toBeInTheDocument();
      });
    });

    it('displays generic error on network failure', async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));

      render(<AuthWrapper />);

      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
      });
    });

    it('clears error message when switching modes', async () => {
      render(<AuthWrapper />);

      // Trigger an error
      const submitButton = screen.getByText(/^connexion$/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
      });

      // Switch mode
      const toggleButton = screen.getByText(/inscription ici/i);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.queryByText(/l'email est requis/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('UI State', () => {
    it('disables submit button during loading', async () => {
      (globalThis.fetch as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ token: 'fake-token', user: { id: '1' } })
        }), 200))
      );

      render(<AuthWrapper />);

      const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
      const passwordInput = screen.getByPlaceholderText(/votre mot de passe/i);
      const submitButton = screen.getByText(/^connexion$/i);

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        const loadingButton = screen.getByText(/chargement/i);
        expect(loadingButton).toBeDisabled();
      });
    });

    it('toggles remember me checkbox', async () => {
      render(<AuthWrapper />);

      const rememberMeLabel = screen.getByText(/rester connecté/i);
      
      // Click to check
      fireEvent.click(rememberMeLabel);

      await waitFor(() => {
        const svg = document.querySelector('svg path[stroke="#DAE63D"]');
        expect(svg).toBeInTheDocument();
      });

      // Click to uncheck
      fireEvent.click(rememberMeLabel);

      await waitFor(() => {
        const svg = document.querySelector('svg path[stroke="#DAE63D"]');
        expect(svg).not.toBeInTheDocument();
      });
    });
  });
});
