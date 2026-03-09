import { useNavigate, useLocation } from 'react-router-dom';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/ui/components/Button';
import { Icon } from '@/ui/icons';
import LogoMax from '@/assets/img/logomax.png';
import { usePremium } from '@/context/PremiumContext';

interface SidebarProps {
  onCreateNewConversation: () => void
}

const navItems = [
  { path: '/chatbot',    label: 'Chat IA',      premium: false },
  { path: '/journal',    label: 'Journal',      premium: true  },
  { path: '/statistics', label: 'Statistiques', premium: true  },
  { path: '/coaches',    label: 'Coachs',       premium: true  },
];

export default function Sidebar({ onCreateNewConversation: _onCreateNewConversation }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPremium, loading } = usePremium();

  const activeIndex = navItems.findIndex(item => item.path === location.pathname);

  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const activeBtn = buttonRefs.current[activeIndex];
    const nav = navRef.current;
    if (activeBtn && nav) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorTop(btnRect.top - navRect.top);
      setReady(true);
    }
  }, [activeIndex]);

  return (
    <aside className="max-chat__sidebar">
      <div className="max-chat__logo">
        <button
          className="max-chat__logo-icon"
          onClick={() => navigate('/')}
          title="Retour à l'accueil"
        >
          <Icon name="back" size="md" />
        </button>
        <img src={LogoMax} alt="MAX Logo" className="max-chat__logo-image" />
      </div>

      <nav className="max-chat__nav" ref={navRef}>
        <div
          className="max-chat__nav-indicator"
          style={{
            transform: `translateY(${indicatorTop}px)`,
            opacity: ready ? 1 : 0,
          }}
        />
        {navItems.map((item, i) => {
          const isLocked = !loading && !isPremium && item.premium;
          return (
            <button
              key={item.path}
              ref={(el) => { buttonRefs.current[i] = el; }}
              className={`max-chat__nav-button ${activeIndex === i ? 'max-chat__nav-button--active' : ''} ${isLocked ? 'max-chat__nav-button--locked' : ''}`}
              onClick={() => isLocked ? navigate('/#title') : navigate(item.path)}
              title={isLocked ? 'Fonctionnalité réservée aux membres Premium' : undefined}
            >
              {item.label}
              {isLocked && <span className="max-chat__nav-lock">Premium</span>}
            </button>
          );
        })}
      </nav>

      
      <div className="max-chat__premium">
        {!loading && !isPremium && (
          <Button fullWidth className="max-chat__premium-button" variant="primary" onClick={() => navigate('/#title')}>Passez Premium</Button>
        )}
        <p className="max-chat__premium-note">Vos échanges restent confidentiels et sécurisés</p>
      </div>
     
    </aside>
  );
}
