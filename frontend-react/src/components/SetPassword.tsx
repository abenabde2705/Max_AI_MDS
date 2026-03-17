import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logoImg from '../assets/img/logomax.png';

const API_URL = import.meta.env.VITE_API_URL;

const SetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien invalide. Contactez votre administrateur.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? 'Erreur lors de la définition du mot de passe.');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setDone(true);
      setTimeout(() => navigate('/chatbot'), 2500);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-pwd__root">
      <div className="set-pwd__card">
        <img src={logoImg} alt="Max" className="set-pwd__logo" />

        {done ? (
          <div className="set-pwd__success">
            <div className="set-pwd__check">✓</div>
            <h2>Mot de passe défini !</h2>
            <p>Redirection vers votre espace…</p>
          </div>
        ) : (
          <>
            <h1 className="set-pwd__title">Créer votre mot de passe</h1>
            <p className="set-pwd__subtitle">Choisissez un mot de passe sécurisé pour accéder à votre compte Max.</p>

            <form className="set-pwd__form" onSubmit={handleSubmit}>
              <div className="set-pwd__field">
                <label htmlFor="pwd">Mot de passe</label>
                <input
                  id="pwd"
                  type="password"
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={!token}
                />
              </div>

              <div className="set-pwd__field">
                <label htmlFor="confirm">Confirmer le mot de passe</label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="Répétez votre mot de passe"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  disabled={!token}
                />
              </div>

              {error && <p className="set-pwd__error">{error}</p>}

              <button
                type="submit"
                className="set-pwd__btn"
                disabled={loading || !token}
              >
                {loading ? 'Enregistrement…' : 'Définir mon mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
