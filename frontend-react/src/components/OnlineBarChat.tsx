import React from 'react';
import { useNavigate } from 'react-router-dom';
import MaxLogo from '../assets/LOGO_rose_pale300x.png';

const OnlineBarChat: React.FC = () => {
  const navigate = useNavigate();

  const handlePremiumClick = () => {
    navigate('/#abonnement');
  };

  return (
    <div className="BarChat">
      <div className="bar-container">
        <div className="logo-section">
          <div className="LogoContainer">
            <img src={MaxLogo} alt="MAX" className="avatar-img" />
            <div className="online-indicator">
              <div className="online-dot"></div>
            </div>
          </div>
        </div>
        
        <div className="premium-section">
          <button className="premium-button" onClick={handlePremiumClick}>
            Passe à MAX Premium ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineBarChat;