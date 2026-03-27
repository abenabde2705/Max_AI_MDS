import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveBirthDate } from '../services/chat.api';
import { useBirthDate } from '../context/BirthDateContext';
import LogoYellow from '../assets/img/logo_yellow.png';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setBirthDate: setContextBirthDate } = useBirthDate();
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setError('Veuillez entrer votre date de naissance');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await saveBirthDate(birthDate);
      setContextBirthDate(birthDate);
      navigate('/chatbot');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur, veuillez réessayer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <img src={LogoYellow} alt="Max" className="onboarding__logo" />
        <h1 className="onboarding__title">Bienvenue sur Max</h1>
        <p className="onboarding__subtitle">
          Avant de commencer, nous avons besoin de votre date de naissance pour vous offrir une expérience adaptée.
        </p>

        <form onSubmit={handleSubmit} className="onboarding__form">
          <label className="onboarding__label" htmlFor="birthDate">
            Date de naissance
          </label>
          <input
            id="birthDate"
            type="date"
            className="onboarding__input"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            max={maxDateStr}
            required
          />
          {error && <p className="onboarding__error">{error}</p>}
          <button
            type="submit"
            className="onboarding__btn"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
