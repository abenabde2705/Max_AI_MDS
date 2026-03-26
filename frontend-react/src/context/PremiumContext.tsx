import { getToken } from '../utils/token';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentSubscription } from '../services/chat.api';

type Plan = 'free' | 'premium' | 'student';

interface PremiumContextValue {
  isPremium: boolean;
  plan: Plan;
  loading: boolean;
}

const PremiumContext = createContext<PremiumContextValue>({
  isPremium: false,
  plan: 'free',
  loading: true,
});

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentSubscription()
      .then(({ data }) => {
        const currentPlan: Plan = data?.data?.plan ?? 'free';
        setPlan(currentPlan);
        setIsPremium(currentPlan !== 'free');
      })
      .catch(() => { setPlan('free'); setIsPremium(false); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, plan, loading }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
