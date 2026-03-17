import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/img/logomax.png';

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? 'Erreur lors de la demande.');
        return;
      }

      setDone(true);
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
            <h2>Email envoyé !</h2>
            <p>Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.</p>
            <Link to="/auth" className="set-pwd__btn" style={{ display: 'inline-block', marginTop: '1.5rem', textAlign: 'center' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h1 className="set-pwd__title">Mot de passe oublié</h1>
            <p className="set-pwd__subtitle">Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

            <form className="set-pwd__form" onSubmit={handleSubmit}>
              <div className="set-pwd__field">
                <label htmlFor="email">Adresse email</label>
                <div className="set-pwd__input-wrap">
                  <input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p className="set-pwd__error">{error}</p>}

              <button type="submit" className="set-pwd__btn" disabled={loading}>
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/auth" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textDecoration: 'none' }}>
                ← Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
