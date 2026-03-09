'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { Icon } from '@/ui/icons';
import { colors } from '@/ui/tokens/colors';
import { useChat } from '@/hooks/useChat';
import { fetchUserProfile } from '@/services/chat.api';
import ChatHistoric from './ChatHistoric';
import LogoPrincipal from '@/assets/img/Logo_principal.png';
import LogoYellow from '@/assets/img/logo_yellow.png';
const emotions = [
  { key: 'super', label: 'Super', icon: '😊' },
  { key: 'bien', label: 'Bien', icon: '😌' },
  { key: 'triste', label: 'Triste', icon: '😢' },
  { key: 'colere', label: 'En colère', icon: '😠' },
  { key: 'fatigue', label: 'Fatigué', icon: '😴' },
];

export default function MaxAIChat() {
  const [message, setMessage] = useState('');
  const [isHistoricOpen, setIsHistoricOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('U');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, conversations, isWaiting, sendMessage, switchConversation, cancelResponse, activeConversation, createNewConversation, removeConversation, messageLimitReached, messageCount } = useChat();

  const isApproachingLimit = !messageCount?.is_premium && messageCount?.limit !== null && messageCount !== null && messageCount.used >= 7 && !messageLimitReached;
  const planLabel = messageCount?.is_premium ? 'Plan Premium' : 'Plan Free';
  const usageText = messageCount
    ? messageCount.is_premium
      ? 'Messages illimités'
      : `${messageCount.used}/${messageCount.limit ?? 10} messages`
    : '— messages';
  const planClass = messageLimitReached
    ? 'max-chat__plan--danger'
    : isApproachingLimit
      ? 'max-chat__plan--warning'
      : '';

  // Récupérer les initiales de l'utilisateur au chargement
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await fetchUserProfile();
        const user = response.data.user || response.data;
        
        if (!user) {
          console.warn('Aucune donnée utilisateur reçue');
          return;
        }
        
        // Utiliser camelCase avec fallback
        const firstname = user.firstName || user.firstname || '';
        const lastname = user.lastName || user.lastname || '';
        
        if (firstname && lastname) {
          setUserInitials(`${firstname[0]}${lastname[0]}`.toUpperCase());
        } else if (firstname) {
          setUserInitials(firstname.substring(0, 2).toUpperCase());
        } else if (user.email) {
          setUserInitials(user.email.substring(0, 2).toUpperCase());
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };
    
    loadUserInfo();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaiting]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleEmotionClick = (emotion: string) => {
    sendMessage(`Je me sens ${emotion.toLowerCase()}`);
  };

  return (
    <>
      <main className="max-chat__main">
        <header className="max-chat__header">
          <div className="max-chat__header-left">
            <div className="max-chat__header-avatar">
              <img src={LogoYellow} alt="MAX Logo" />
            </div>

            <div className="max-chat__header-info">
              <h1 className="max-chat__title">MAX - Assistant IA</h1>
              <div className={`max-chat__plan ${planClass}`}>
                <p className="max-chat__plan-text">
                  <strong>{usageText}</strong> <span>{planLabel}</span>
                </p>
                {!messageCount?.is_premium && messageCount?.limit !== null && messageCount !== null && (
                  <div className="max-chat__plan-bar">
                    <div
                      className="max-chat__plan-bar-fill"
                      style={{ width: `${Math.min(100, (messageCount.used / (messageCount.limit ?? 10)) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-chat__header-actions">
            <Button className="max-chat__action-button" variant="primary" onClick={createNewConversation}>
              <Icon name="add" size="sm" />
      Nouvelle conversation
            </Button>

            <Button
              variant="outline"
              className="max-chat__action-button max-chat__action-button--ghost"
              onClick={() => setIsHistoricOpen(true)}
            >
              <Icon name="historic" size="sm" />
      Historique
            </Button>
          </div>
        </header>

        {isApproachingLimit && (
          <div className="max-chat__limit-warning">
            <span className="max-chat__limit-warning-icon">⚠️</span>
            <span>
              Il vous reste{' '}
              <strong>{(messageCount!.limit! - messageCount!.used)} message{messageCount!.limit! - messageCount!.used > 1 ? 's' : ''}</strong>{' '}
              sur votre plan gratuit.
            </span>
          </div>
        )}

        <div className="max-chat__messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-chat__message-row max-chat__message-row--animate ${msg.role === 'user' ? 'max-chat__message-row--user' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="max-chat__badge">
                  <img src={LogoPrincipal} alt="MAX" className="max-chat__badge-logo" />
                </div>
              )}
              <div className={`max-chat__bubble ${msg.role === 'assistant' ? 'max-chat__bubble--assistant' : 'max-chat__bubble--user'}`}>
                <p className="max-chat__bubble-text">{msg.content}</p>
                {msg.timestamp && (
                  <span className="max-chat__bubble-time">
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              {msg.role === 'user' && <div className="max-chat__user-avatar">{userInitials}</div>}
            </div>
          ))}
          {isWaiting && (
            <div className="max-chat__message-row max-chat__message-row--animate">
              <div className="max-chat__badge">
                <img src={LogoPrincipal} alt="MAX" className="max-chat__badge-logo" />
              </div>
              <div className="max-chat__bubble max-chat__bubble--assistant max-chat__bubble--typing">
                <span className="max-chat__typing-dot" />
                <span className="max-chat__typing-dot" />
                <span className="max-chat__typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="max-chat__input-area">
          {messageLimitReached ? (
            <div className="max-chat__limit-wall">
              <span className="max-chat__limit-wall-icon">🔒</span>
              <h3 className="max-chat__limit-wall-title">Limite de messages atteinte</h3>
              <p className="max-chat__limit-wall-text">
                Vous avez utilisé vos <strong>10 messages</strong> du plan gratuit.
                Passez au plan Premium pour continuer à discuter avec MAX sans limite.
              </p>
              <Button variant="primary" className="max-chat__limit-wall-button">
                ✨ Passer au Premium
              </Button>
            </div>
          ) : (
            <>
              <div className="max-chat__emotions">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.key}
                    onClick={() => handleEmotionClick(emotion.label)}
                    className={`max-chat__emotion-button max-chat__emotion-button--${emotion.key}`}
                  >
                    <span>{emotion.icon}</span>
                    <span>{emotion.label}</span>
                  </button>
                ))}
              </div>

              <div className="max-chat__input-wrapper">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isWaiting && handleSendMessage()}
                  placeholder="Partagez ce que vous ressentez..."
                  className="max-chat__input"
                  disabled={isWaiting}
                />
                {isWaiting ? (
                  <Button onClick={cancelResponse} size="icon" className="max-chat__send">
                    <Icon name="close" size="md" color={colors.semantic.error} />
                  </Button>
                ) : (
                  <Button onClick={handleSendMessage} size="icon" className="max-chat__send" disabled={!message.trim()} variant="secondary">
                    <Icon name="send" size="md" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <ChatHistoric
        isOpen={isHistoricOpen}
        onClose={() => setIsHistoricOpen(false)}
        conversations={conversations}
        onSelectConversation={switchConversation}
        onDeleteConversation={removeConversation}
        activeConversation={activeConversation}
        userInitials={userInitials}
      />
    </>
  );
}
