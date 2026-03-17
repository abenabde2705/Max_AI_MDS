import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logoImg from '../assets/img/logomax.png';
import { setToken } from '../utils/token';

const EyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

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
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
        setToken(data.token, true); // premier accès → persistant
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
                <div className="set-pwd__input-wrap">
                  <input
                    id="pwd"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={!token}
                  />
                  <button type="button" className="set-pwd__eye" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                    {showPwd ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
              </div>

              <div className="set-pwd__field">
                <label htmlFor="confirm">Confirmer le mot de passe</label>
                <div className="set-pwd__input-wrap">
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Répétez votre mot de passe"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    disabled={!token}
                  />
                  <button type="button" className="set-pwd__eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
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
