import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  MessageCircle, 
  Trash2, 
  Calendar, 
  Search,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import './ConversationHistory.css';

const ConversationHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const API_BASE = 'http://localhost:3000/api';

  const getToken = () => localStorage.getItem('token');
  
  const axiosConfig = {
    headers: { Authorization: `Bearer ${getToken()}` }
  };

  useEffect(() => {
    loadConversations();
    loadStats();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/conversations`, axiosConfig);
      setConversations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/conversations/stats/summary`, axiosConfig);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE}/messages/${conversationId}`, axiosConfig);
      setMessages(response.data);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await axios.delete(`${API_BASE}/conversations/${conversationId}`, axiosConfig);
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      setShowDeleteModal(false);
      setConversationToDelete(null);
      
      // Si c'était la conversation sélectionnée, la désélectionner
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la conversation');
    }
  };

  const handleDeleteAllHistory = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tout votre historique ? Cette action est irréversible.')) {
      try {
        await axios.delete(`${API_BASE}/conversations`, axiosConfig);
        setConversations([]);
        setSelectedConversation(null);
        setMessages([]);
        loadStats(); // Recharger les statistiques
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'historique:', error);
        alert('Erreur lors de la suppression de l\'historique');
      }
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    format(new Date(conv.started_at), 'dd/MM/yyyy', { locale: fr }).includes(searchQuery)
  );

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="conversation-history-loading">
        <div className="spinner"></div>
        <p>Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="conversation-history">
      <div className="history-header">
        <h2>
          <MessageCircle className="icon" />
          Historique des conversations
        </h2>
        
        {stats && (
          <div className="stats-summary">
            <div className="stat-item">
              <BarChart3 className="stat-icon" />
              <div>
                <span className="stat-number">{stats.totalConversations}</span>
                <span className="stat-label">conversations</span>
              </div>
            </div>
            <div className="stat-item">
              <MessageCircle className="stat-icon" />
              <div>
                <span className="stat-number">{stats.totalMessages}</span>
                <span className="stat-label">messages</span>
              </div>
            </div>
            <div className="stat-item">
              <Calendar className="stat-icon" />
              <div>
                <span className="stat-number">{stats.recentConversations}</span>
                <span className="stat-label">cette semaine</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="history-controls">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher dans l'historique..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          className="delete-all-btn"
          onClick={handleDeleteAllHistory}
          disabled={conversations.length === 0}
        >
          <Trash2 className="icon" />
          Supprimer tout
        </button>
      </div>

      <div className="history-content">
        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="empty-state">
              <MessageCircle className="empty-icon" />
              <p>
                {conversations.length === 0 
                  ? "Vous n'avez pas encore de conversations" 
                  : "Aucune conversation ne correspond à votre recherche"
                }
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className={`conversation-item ${selectedConversation === conversation.id ? 'selected' : ''}`}
                onClick={() => loadConversationMessages(conversation.id)}
              >
                <div className="conversation-info">
                  <div className="conversation-date">
                    <Calendar className="date-icon" />
                    {formatDate(conversation.started_at)}
                  </div>
                  
                  {conversation.lastMessage && (
                    <div className="last-message">
                      <span className="sender">{conversation.lastMessage.sender === 'user' ? 'Vous' : 'Max AI'}:</span>
                      <span className="content">
                        {conversation.lastMessage.content.length > 100 
                          ? `${conversation.lastMessage.content.substring(0, 100)}...`
                          : conversation.lastMessage.content
                        }
                      </span>
                    </div>
                  )}
                </div>
                
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConversationToDelete(conversation.id);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 className="icon" />
                </button>
              </div>
            ))
          )}
        </div>

        {selectedConversation && (
          <div className="conversation-messages">
            <h3>Messages de la conversation</h3>
            <div className="messages-container">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <div className="message-header">
                    <span className="sender">
                      {message.sender === 'user' ? 'Vous' : 'Max AI'}
                    </span>
                    <span className="timestamp">
                      {formatDate(message.sent_at)}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                  {message.emotion_detected && (
                    <div className="emotion-detected">
                      Émotion détectée: {message.emotion_detected}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <AlertTriangle className="warning-icon" />
              <h3>Supprimer la conversation</h3>
            </div>
            <p>Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConversationToDelete(null);
                }}
              >
                Annuler
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={() => handleDeleteConversation(conversationToDelete)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;