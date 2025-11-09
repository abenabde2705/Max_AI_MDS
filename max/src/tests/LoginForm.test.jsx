                        import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../components/Authentication/LoginForm.jsx';

// Mock du store Zustand
const mockSetUser = vi.fn();
const mockSetToken = vi.fn();

vi.mock('../store/authStore', () => ({
  default: () => ({
    setUser: mockSetUser,
    setToken: mockSetToken,
    user: null,
    token: null
  })
}));

// Mock d'axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

const LoginFormWrapper = () => (
  <BrowserRouter>
    <LoginForm />
  </BrowserRouter>
);

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form elements', () => {
    render(<LoginFormWrapper />);
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<LoginFormWrapper />);
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email est requis/i)).toBeInTheDocument();
      expect(screen.getByText(/mot de passe est requis/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const axios = await import('axios');
    axios.default.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', firstName: 'Test' }
      }
    });

    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.default.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        {
          email: 'test@example.com',
          password: 'password123'
        }
      );
    });
  });

  it('handles login error', async () => {
    const axios = await import('axios');
    axios.default.post.mockRejectedValue({
      response: { data: { message: 'Identifiants incorrects' } }
    });

    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const axios = await import('axios');
    axios.default.post.mockImplementation(() => new Promise(resolve => 
      setTimeout(resolve, 100)
    ));

    render(<LoginFormWrapper />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
  });
});