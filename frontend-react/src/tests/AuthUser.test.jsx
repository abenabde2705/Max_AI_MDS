import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthUser from '../components/Authentication/AuthUser.jsx';

// Mock d'axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

// Mock du navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const AuthUserWrapper = () => (
  <BrowserRouter>
    <AuthUser />
  </BrowserRouter>
);

describe('AuthUser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<AuthUserWrapper />);
    
    expect(screen.getByPlaceholderText(/votre email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('switches to register mode', () => {
    render(<AuthUserWrapper />);
    
    const switchButton = screen.getByText(/créer un compte/i);
    fireEvent.click(switchButton);

    expect(screen.getByPlaceholderText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nom/i)).toBeInTheDocument();
    expect(screen.getByText(/date de naissance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer mon compte/i })).toBeInTheDocument();
  });

  it('validates login form fields', async () => {
    render(<AuthUserWrapper />);
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email est requis/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<AuthUserWrapper />);
    
    const emailInput = screen.getByPlaceholderText(/votre email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
    });
  });

  it('validates register form fields', async () => {
    render(<AuthUserWrapper />);
    
    // Passer en mode register
    const switchButton = screen.getByText(/créer un compte/i);
    fireEvent.click(switchButton);

    const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/prénom est requis/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(<AuthUserWrapper />);
    
    // Passer en mode register
    const switchButton = screen.getByText(/créer un compte/i);
    fireEvent.click(switchButton);

    // Remplir les champs
    fireEvent.change(screen.getByPlaceholderText(/prénom/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/nom/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '1990-01-01' } });
    fireEvent.change(screen.getByPlaceholderText(/votre email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/votre mot de passe/i)[0], { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmez votre mot de passe/i), { target: { value: 'different' } });

    const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  it('submits login form successfully', async () => {
    const axios = await import('axios');
    axios.default.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', firstName: 'Test' }
      }
    });

    render(<AuthUserWrapper />);
    
    fireEvent.change(screen.getByPlaceholderText(/votre email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
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

  it('submits register form successfully', async () => {
    const axios = await import('axios');
    axios.default.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '1', email: 'john@example.com', firstName: 'John' }
      }
    });

    render(<AuthUserWrapper />);
    
    // Passer en mode register
    const switchButton = screen.getByText(/créer un compte/i);
    fireEvent.click(switchButton);

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText(/prénom/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/nom/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '1990-01-01' } });
    fireEvent.change(screen.getByPlaceholderText(/votre email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/votre mot de passe/i)[0], { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmez votre mot de passe/i), { target: { value: 'password123' } });
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitButton = screen.getByRole('button', { name: /créer mon compte/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.default.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        })
      );
    });
  });

  it('handles authentication error', async () => {
    const axios = await import('axios');
    axios.default.post.mockRejectedValue({
      response: { data: { message: 'Identifiants incorrects' } }
    });

    render(<AuthUserWrapper />);
    
    fireEvent.change(screen.getByPlaceholderText(/votre email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), { target: { value: 'wrongpassword' } });
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
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

    render(<AuthUserWrapper />);
    
    fireEvent.change(screen.getByPlaceholderText(/votre email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), { target: { value: 'password123' } });
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
  });
});