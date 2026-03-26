import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCurrentSubscription } from '../services/chat.api';
import { usePremium } from '../context/PremiumContext';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refresh } = usePremium();

  const [plan, setPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError(true);
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    const INTERVAL_MS = 1500;
    let timerId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const { data } = await fetchCurrentSubscription();
        if (data.success && data.data?.plan) {
          setPlan(data.data.plan);
          setLoading(false);
          await refresh();
          return;
        }
      } catch {
        // continue polling
      }

      attempts += 1;
      if (attempts < MAX_ATTEMPTS) {
        timerId = setTimeout(poll, INTERVAL_MS);
      } else {
        // Webhook lent — afficher le message de confirmation générique
        setError(true);
        setLoading(false);
      }
    };

    // Premier essai après 1.5s pour laisser le temps au webhook
    timerId = setTimeout(poll, INTERVAL_MS);
    return () => clearTimeout(timerId);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="success-page">
        <div className="success-page__container">
          <div className="profile-loading__spinner" />
          <p>Confirmation de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="success-page">
        <div className="success-page__container">
          <p className="success-page__icon">⚠️</p>
          <h1>Paiement reçu</h1>
          <p>Votre paiement a été traité. L'activation peut prendre quelques minutes.</p>
          <button className="profile-btn profile-btn--primary" onClick={() => navigate('/profile')}>
            Voir mon profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="success-page__container">
        <p className="success-page__icon">✓</p>
        <h1>Abonnement activé !</h1>
        <p>
          Votre plan <strong>{plan === 'student' ? 'Campus' : 'Premium'}</strong> est maintenant actif.
          Profitez de toutes les fonctionnalités de Max AI.
        </p>
        <div className="success-page__actions">
          <button className="profile-btn profile-btn--primary" onClick={() => navigate('/chatbot')}>
            Commencer à chatter
          </button>
          <button className="profile-btn profile-btn--outline" onClick={() => navigate('/profile')}>
            Mon profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
