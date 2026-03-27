import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAuthProfile } from '../services/chat.api';
import { getToken } from '../utils/token';

interface BirthDateContextValue {
  birthDate: string | null;
  setBirthDate: (d: string) => void;
}

const BirthDateContext = createContext<BirthDateContextValue>({
  birthDate: null,
  setBirthDate: () => {},
});

const SKIP_PATHS = ['/auth', '/auth/callback', '/onboarding', '/set-password', '/forgot-password', '/reset-password'];

export const BirthDateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = getToken();
    if (!token || SKIP_PATHS.some(p => location.pathname.startsWith(p))) return;

    fetchAuthProfile()
      .then(({ data }) => {
        const bd: string | null = data?.user?.birthDate ?? null;
        setBirthDate(bd);
        if (!bd) navigate('/onboarding', { replace: true });
      })
      .catch(() => { /* ne pas bloquer si le profil échoue */ });
  }, []);

  return (
    <BirthDateContext.Provider value={{ birthDate, setBirthDate }}>
      {children}
    </BirthDateContext.Provider>
  );
};

export const useBirthDate = () => useContext(BirthDateContext);
