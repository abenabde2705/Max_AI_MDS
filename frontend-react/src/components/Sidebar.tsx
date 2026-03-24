import { useNavigate, useLocation } from 'react-router-dom';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/ui/components/Button';
import { Icon } from '@/ui/icons';
import LogoMax from '@/assets/img/logomax.png';
import { usePremium } from '@/context/PremiumContext';
import { useChatContext } from '@/context/ChatContext';

interface SidebarProps {
  onCreateNewConversation: () => void
  onOpenHistoric: () => void
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { path: '/chatbot',    label: 'Chat IA',      premium: false },
  { path: '/journal',    label: 'Journal',      premium: true  },
  { path: '/statistics', label: 'Statistiques', premium: true  },
  { path: '/coaches',    label: 'Coachs',       premium: true  },
];

export default function Sidebar({ onCreateNewConversation, onOpenHistoric, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPremium, loading } = usePremium();
  const { createNewConversation, setIsHistoricOpen } = useChatContext();

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
    <>
      {isOpen && <div className="max-chat__sidebar-overlay" onClick={onClose} />}
      <aside className={`max-chat__sidebar${isOpen ? ' max-chat__sidebar--open' : ''}`}>
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
              onClick={() => {
                if (isLocked) {
                  navigate('/#title');
                } else {
                  navigate(item.path);
                }
                onClose();
              }}
              title={isLocked ? 'Fonctionnalité réservée aux membres Premium' : undefined}
            >
              {item.label}
              {isLocked && <span className="max-chat__nav-lock">Premium</span>}
            </button>
          );
        })}
      </nav>

      <div className="max-chat__sidebar-actions">
        <Button fullWidth className="max-chat__sidebar-action-button" variant="primary" onClick={() => { createNewConversation(); onClose(); }}>
          <Icon name="add" size="sm" />
          Nouvelle conversation
        </Button>
        <Button fullWidth className="max-chat__sidebar-action-button" variant="outline" onClick={() => { setIsHistoricOpen(true); onClose(); }}>
          <Icon name="historic" size="sm" />
          Historique
        </Button>
      </div>

      <div className="max-chat__premium">
        {!loading && !isPremium && (
          <Button fullWidth className="max-chat__premium-button" variant="primary" onClick={() => navigate('/#title')}>Passez Premium</Button>
        )}
        <p className="max-chat__premium-note">Vos échanges restent confidentiels et sécurisés</p>
      </div>
     
      </aside>
    </>
  );
}
