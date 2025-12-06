import React from 'react';
import ChatExampleImage from '../assets/img/valeurs/JOUR_2.webp';

const ChatExample: React.FC = () => {
  return (
    <div className="chat-example">
      <div className="chat-window">
        <img
          className="chat-image"
          src={ChatExampleImage}
          alt="Exemple de chat"
        />
      </div>
    </div>
  );
};

export default ChatExample;