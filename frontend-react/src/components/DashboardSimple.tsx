import { getToken, removeToken } from '../utils/token';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  createdAt?: string;
}

const DashboardSimple: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();
      
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            ...userData.user,
            name: `${userData.user.firstName} ${userData.user.lastName}`
          });
        } else {
          removeToken();
          navigate('/auth');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        removeToken();
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    navigate('/');
    window.location.reload();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Bienvenue, {user.name} !</h1>
            <p>Gérez votre compte et vos préférences depuis votre tableau de bord.</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
             Déconnexion
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
           
            <div className="stat-info">
              <h3>Profil</h3>
              <p>Compte actif</p>
            </div>
          </div>
     
          
          <div className="stat-card">
          
            <div className="stat-info">
              <h3>Membre depuis</h3>
              <p>{formatDate(user.createdAt || '')}</p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="user-info-section">
          <h2>Informations du compte</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-header">
                <h3>Email</h3>
              </div>
              <p className="info-value">{user.email}</p>
            </div>
            
            <div className="info-card">
              <div className="info-header">
                <h3>Nom complet</h3>
              </div>
              <p className="info-value">{user.name}</p>
            </div>
            
            <div className="info-card">
              <div className="info-header">
                <h3>Date d'inscription</h3>
              </div>
              <p className="info-value">{formatDate(user.createdAt || '')}</p>
            </div>
            
            <div className="info-card">
              <div className="info-header">
                <h3>Statut du compte</h3>
              </div>
              <p className="info-value status-active">Actif</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Actions rapides</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate('/chatbot')}>
               Parler à Max
            </button>
            <button className="action-btn" onClick={() => navigate('/')}>
              Accueil
            </button>
            <button className="action-btn" onClick={() => window.location.href = '#about'}>
               À propos
            </button>
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;