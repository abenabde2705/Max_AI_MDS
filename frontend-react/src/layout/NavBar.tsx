import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface MenuItem {
  text: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { text: 'À Propos', href: '#about' },
  { text: 'Fonctionnalités', href: '#fonc' },
  { text: 'Témoignage', href: '#tem' },
  { text: 'Abonnement', href: '#title' },
  { text: 'Newsletter', href: '#news' }
];

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userName = localStorage.getItem('userName');
      const userEmailStored = localStorage.getItem('userEmail');
      setUserEmail(userName || userEmailStored || 'Utilisateur');
    }
  }, []);

  const getInitials = useMemo<string>(() => {
    const names = userEmail.split(' ');
    const firstInitial = names[0]?.charAt(0).toUpperCase() || '';
    const lastInitial = names[1]?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  }, [userEmail]);

  const scrollToSection = (href: string): void => {
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setIsMenuOpen(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    window.location.reload();
  };

  return (
    <div className="flex justify-center pt-8 fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-black/80 to-transparent pb-4">
      <nav className="flex gap-2 justify-between items-center px-8 py-3 backdrop-blur-[20px] bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-[50px] w-[90%] h-[55px] max-w-[1200px] relative z-10">
        <div className="flex items-center gap-[87px]">
          <div className="text-white text-2xl font-bold tracking-[2px] mr-4 flex items-center">
            <Link to="/" className="no-underline">
                <img src="/src/assets/img/hero/logomax.png" alt="MAX" className="h-[19px] w-auto object-contain" />
            </Link>
          </div>
          {/* Bouton hamburger pour mobile */}
          <button 
            className="flex flex-col gap-[0.3rem] bg-transparent border-none cursor-pointer z-[11] md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="w-[25px] h-[3px] bg-white rounded-[5px]"></span>
            <span className="w-[25px] h-[3px] bg-white rounded-[5px]"></span>
            <span className="w-[25px] h-[3px] bg-white rounded-[5px]"></span>
          </button>
          {/* Menu desktop */}
          <div 
            className={`transition-all duration-300 font-['Ubuntu',sans-serif] font-semibold ${
              isMenuOpen 
                ? 'flex flex-col bg-[#1c5372]/90 absolute top-[120%] left-0 right-0 p-4 rounded-3xl translate-y-0 opacity-100' 
                : 'hidden'
            } md:flex md:flex-row md:gap-10 md:static md:bg-transparent md:p-0 md:rounded-none md:opacity-100 md:translate-y-0`}
          >
            {menuItems.map((item) => (
              <a
                key={item.text}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="relative text-white no-underline inline-block py-2 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-1px] after:w-0 after:h-[2px] after:bg-white after:transition-[width] after:duration-300 hover:after:w-full"
              >
                {item.text}
              </a>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          {!isLoggedIn ? (
            <Link to="/auth" className="no-underline flex items-center gap-2 bg-transparent text-[#dae63d] border-none cursor-pointer text-[0.9rem] px-4 py-2 transition-opacity duration-200 hover:opacity-80 font-['Ubuntu',sans-serif] font-semibold">
              Connexion
            </Link>
          ) : (
            <div className="relative">
              <button 
                className="bg-transparent border-none text-2xl cursor-pointer text-white leading-inherit" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {getInitials}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 bg-white text-black border border-[#ddd] rounded-lg px-4 py-2 mt-2 min-w-[150px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] z-20">
                  <p className="m-0 text-[0.9rem]">{userEmail}</p>
                  <Link to="/dashboard" className="no-underline text-[#1c5372] px-4 py-2 block w-full">
                    Tableau de bord
                  </Link>
                  <button onClick={logout} className="bg-transparent border-none text-[#1c5372] cursor-pointer mt-2 text-[0.85rem] hover:underline">Déconnexion</button>
                </div>
              )}
            </div>
          )}
          <Link to="/chatbot" className="no-underline bg-transparent text-[#dae63d] px-6 py-2 border border-[#dae63d] rounded-full cursor-pointer text-[0.7rem] flex items-center gap-2 transition-opacity duration-200 hover:opacity-80 font-['Ubuntu',sans-serif] font-semibold">
            <span> Accéder au chat</span>
            <span className="text-[1.1em]">→</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;