import React, { useState, useEffect } from 'react';

interface Message {
  from: 'max' | 'user';
  text: string;
}

const conversation: Message[] = [
  { from: 'max', text: 'Bonjour 👋 Comment tu vas aujourd\'hui ?' },
  { from: 'user', text: 'Pas terrible... du mal à dormir en ce moment.' },
  { from: 'max', text: 'Je t\'écoute. Qu\'est-ce qui te tient éveillé ?' },
  { from: 'user', text: 'Trop de pensées, je me sens débordé.' },
  { from: 'max', text: 'C\'est épuisant. Essayons une respiration ensemble 🌿' },
];

const PhoneMockup: React.FC = () => {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let index = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const showNext = () => {
      if (index >= conversation.length) {
        const t = setTimeout(() => {
          setVisibleMessages([]);
          setIsTyping(false);
          index = 0;
          const t2 = setTimeout(showNext, 800);
          timeouts.push(t2);
        }, 3000);
        timeouts.push(t);
        return;
      }

      setIsTyping(true);
      const currentMsg = conversation[index];
      const delay = currentMsg.from === 'max' ? 1200 : 800;

      const t = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(prev => [...prev, currentMsg]);
        index++;
        const t2 = setTimeout(showNext, 500);
        timeouts.push(t2);
      }, delay);
      timeouts.push(t);
    };

    const t0 = setTimeout(showNext, 500);
    timeouts.push(t0);

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="phone-mockup-wrapper">
      <div className="phone-mockup">
        <div className="phone-notch" />

        <div className="phone-chat-header">
          <div className="phone-avatar">M</div>
          <div>
            <div className="phone-chat-name">Max</div>
            <div className="phone-chat-status">En ligne</div>
          </div>
        </div>

        <div className="phone-messages">
          {visibleMessages.map((msg, i) => (
            <div key={i} className={`phone-bubble phone-bubble--${msg.from}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="phone-bubble phone-bubble--max phone-typing">
              <span /><span /><span />
            </div>
          )}
        </div>

        <div className="phone-input-bar">
          <div className="phone-input-field">Écrire un message…</div>
          <div className="phone-send-btn">➤</div>
        </div>

        <div className="phone-home-bar" />
      </div>
    </div>
  );
};

export default PhoneMockup;
