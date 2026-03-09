import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../layout/NavBar';
import logoImg from '../../assets/img/hero/logomax.png';

interface FormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  rememberMe: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

const AuthUser: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    rememberMe: false
  });

  const toggleMode = (): void => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    setError('');
    
    if (mode === 'register') {
      if (!form.firstName.trim()) {
        setError('Le prénom est requis');
        return false;
      }
      if (!form.lastName.trim()) {
        setError('Le nom est requis');
        return false;
      }
      if (!form.birthDate) {
        setError('La date de naissance est requise');
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return false;
      }
      if (!form.acceptTerms) {
        setError('Veuillez accepter les termes de confidentialité');
        return false;
      }
    }
    
    if (!form.email.trim()) {
      setError('L\'email est requis');
      return false;
    }
    if (!form.password) {
      setError('Le mot de passe est requis');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Erreur lors de la connexion.');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.user.firstName + ' ' + data.user.lastName);
        localStorage.setItem('userId', data.user.id);
      
        navigate('/profile');
      } else {
        // Calculer l'âge à partir de la date de naissance
        const birthDate = new Date(form.birthDate);
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            age: age,
            email: form.email,
            password: form.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Erreur lors de l\'inscription.');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.user.firstName + ' ' + data.user.lastName);
        localStorage.setItem('userId', data.user.id);

        navigate('/profile');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirection vers l'endpoint OAuth Google du backend
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleFacebookLogin = () => {
    // Redirection vers l'endpoint OAuth Facebook du backend
    window.location.href = `${API_URL}/api/auth/facebook`;
  };

  return (
    <div className="login-container">
      <NavBar />
      
      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-header">
            <img src={logoImg} alt="MAX" className="login-logo-auth" />
            <h2 className="login-welcome">Bienvenue</h2>
            <p className="login-subtitle">Découvrez une nouvelle façon d'être accompagné au quotidien.</p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {mode === 'register' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Prénom</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleInputChange}
                    placeholder="Votre prénom"
                    className="login-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Nom</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    className="login-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="birthDate">Date de naissance</label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleInputChange}
                  className="login-input"
                  required
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="votre@email.com"
              className="login-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="Votre mot de passe"
              className="login-input"
              required
            />
          </div>
          
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez votre mot de passe"
                  className="login-input"
                  required
                />
              </div>
              
              <div className="checkbox-group">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={handleInputChange}
                  className="login-checkbox"
                  required
                />
                <label htmlFor="acceptTerms">
                  J'accepte les <a href="/politics/conditions-utilisation" target="_blank">conditions d'utilisation</a> et la <a href="/politics/politique-confidentialites" target="_blank">politique de confidentialité</a>
                </label>
              </div>
            </>
          )}
          
          {mode === 'login' && (
            <div className="checkbox-group" onClick={() => setForm(prev => ({ ...prev, rememberMe: !prev.rememberMe }))} style={{ cursor: 'pointer' }}>
              <div style={{
                width: '18px',
                height: '18px',
                border: '1px solid #F2F5FF',
                borderRadius: '4px',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '0.3rem'
              }}>
                {form.rememberMe && (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#DAE63D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <label style={{ cursor: 'pointer', userSelect: 'none' }}>
                Rester connecté(e)
              </label>
            </div>
          )}
              
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Chargement...' : (mode === 'login' ? 'Connexion' : 'Inscription')}
          </button>
          
          <div className="toggle-mode">
            <p>
              {mode === 'login' ? 'Vous n avez pas encore rejoint MAX ?' : 'Si vous êtes déjà inscrit ?'}
              <button type="button" onClick={toggleMode} className="toggle-link">
                {mode === 'login' ? 'Inscription ici' : 'Se connecter'}
              </button>
            </p>
          </div>

          <div className="social-divider">
            <span>Ou</span>
          </div>

          <div className="social-login-buttons">
            <button type="button" className="social-btn google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Connexion avec Google
            </button>

            <button type="button" className="social-btn facebook-btn" onClick={handleFacebookLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
              Connexion avec Facebook
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

export default AuthUser;