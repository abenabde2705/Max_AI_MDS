import { getToken } from '../utils/token';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentSubscription } from '../services/chat.api';

type Plan = 'free' | 'premium' | 'student';

interface PremiumContextValue {
  isPremium: boolean;
  loading: boolean;
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  loading: true,
});

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentSubscription()
      .then(({ data }) => {
        const plan: Plan = data?.data?.plan ?? 'free';
        setIsPremium(plan !== 'free');
      })
      .catch(() => setIsPremium(false))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, loading }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
