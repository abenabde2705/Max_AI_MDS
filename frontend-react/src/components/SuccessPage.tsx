import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCurrentSubscription } from '../services/chat.api';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [plan, setPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        const { data } = await fetchCurrentSubscription();
        if (data.success && data.data?.plan) {
          setPlan(data.data.plan);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      // Attendre un court instant pour que le webhook Stripe ait le temps de traiter
      const timer = setTimeout(confirmSubscription, 2000);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
      setError(true);
    }
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
