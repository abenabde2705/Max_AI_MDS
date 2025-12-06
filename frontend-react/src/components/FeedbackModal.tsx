import React, { useState } from 'react';
import './FeedbackModal.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'ui_ux' | 'performance' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userEmail: string;
}

interface SubmitStatus {
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'improvement',
    severity: 'medium',
    userEmail: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Récupérer le token JWT du localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Vous devez être connecté pour envoyer un feedback');
      }

      const response = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi');
      }

      const result = await response.json();

      // Succès
      setSubmitStatus({
        type: 'success',
        title: 'Feedback envoyé !',
        message: 'Votre feedback a été transmis avec succès.',
        details: `ID: ${result.feedbackId}`
      });

      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          type: 'improvement',
          severity: 'medium',
          userEmail: ''
        });
        setSubmitStatus(null);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setSubmitStatus({
        type: 'error',
        title: 'Erreur d\'envoi',
        message: errorMessage,
        details: 'Veuillez réessayer ou contacter le support'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        type: 'improvement',
        severity: 'medium',
        userEmail: ''
      });
      setSubmitStatus(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-overlay" onClick={handleClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <h2>Envoyer un Feedback</h2>
          <button className="close-btn" onClick={handleClose} disabled={isSubmitting}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label htmlFor="title">Titre du feedback *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Décrivez brièvement le problème ou suggestion"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description détaillée *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Expliquez en détail votre feedback..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type de feedback</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="bug">Bug / Problème</option>
                <option value="feature">Nouvelle fonctionnalité</option>
                <option value="improvement">Amélioration</option>
                <option value="ui_ux">Interface utilisateur</option>
                <option value="performance">Performance</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Niveau d'importance</label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="critical">Critique</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="userEmail">Votre email (optionnel)</label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              placeholder="pour@suivre-votre-feedback.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="feedback-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>

        {submitStatus && (
          <div className={`status-message ${submitStatus.type}`}>
            <h3>{submitStatus.title}</h3>
            <p>{submitStatus.message}</p>
            {submitStatus.details && (
              <div className="status-details">
                <small>{submitStatus.details}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;