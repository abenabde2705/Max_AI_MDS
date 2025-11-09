import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../layout/NavBar.jsx';
import Footer from '../../layout/Footer.jsx';

const AuthUser = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await fetch('http://localhost:3000/api/auth/login', {
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
      
        navigate('/dashboard');
      } else {
        // Calculer l'âge à partir de la date de naissance
        const birthDate = new Date(form.birthDate);
        const ageDiffMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiffMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        const response = await fetch('http://localhost:3000/api/auth/register', {
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

        navigate('/dashboard');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <NavBar />
      
      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-header">
            <h1>MAX</h1>
            <p>{mode === 'login' ? 'Welcome Back' : 'Rejoignez Max'}</p>
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
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire')}
          </button>
          
          <div className="toggle-mode">
            <p>
              {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
              <button type="button" onClick={toggleMode} className="toggle-link">
                {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </p>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthUser;