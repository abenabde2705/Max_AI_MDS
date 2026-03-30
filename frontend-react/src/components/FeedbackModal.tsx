import { getToken, removeToken } from '../utils/token';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './FeedbackModal.css';
import { AlertTriangle, Plus, ArrowUp, Layout, Zap, MoreHorizontal, Check, X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'ui_ux' | 'performance' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SubmitStatus {
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bug:         <AlertTriangle size={14} />,
  feature:     <Plus size={14} />,
  improvement: <ArrowUp size={14} />,
  ui_ux:       <Layout size={14} />,
  performance: <Zap size={14} />,
  other:       <MoreHorizontal size={14} />,
};

const TYPE_OPTIONS: { value: FormData['type']; label: string }[] = [
  { value: 'bug',         label: 'Bug'           },
  { value: 'feature',     label: 'Fonctionnalité'},
  { value: 'improvement', label: 'Amélioration'  },
  { value: 'ui_ux',       label: 'Interface'     },
  { value: 'performance', label: 'Performance'   },
  { value: 'other',       label: 'Autre'         },
];

const SEVERITY_OPTIONS: { value: FormData['severity']; label: string }[] = [
  { value: 'low',      label: 'Faible'   },
  { value: 'medium',   label: 'Moyenne'  },
  { value: 'high',     label: 'Élevée'   },
  { value: 'critical', label: 'Critique' },
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'improvement',
    severity: 'medium'
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const token = getToken();

      if (!token) {
        throw new Error('Vous devez être connecté pour envoyer un feedback');
      }

      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi');
      }

      const result = await response.json();

      setSubmitStatus({
        type: 'success',
        title: 'Feedback envoyé !',
        message: 'Votre feedback a été transmis avec succès. Merci pour votre contribution.',
        details: `ID: ${result.feedbackId}`
      });

      setTimeout(() => {
        setFormData({ title: '', description: '', type: 'improvement', severity: 'medium' });
        setSubmitStatus(null);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      setSubmitStatus({
        type: 'error',
        title: 'Erreur d\'envoi',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        details: 'Veuillez réessayer ou contacter le support'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ title: '', description: '', type: 'improvement', severity: 'medium' });
      setSubmitStatus(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="feedback-overlay" onClick={handleClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="feedback-header">
          <div className="feedback-header-info">
            <span className="feedback-header-eyebrow">Max</span>
            <h2>Envoyer un Feedback</h2>
          </div>
          <button className="feedback-close-btn" onClick={handleClose} disabled={isSubmitting}>
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="feedback-form">

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="title">
              Titre <span>*</span>
            </label>
            <input
              className="feedback-input"
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Décrivez brièvement votre feedback…"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="description">
              Description <span>*</span>
            </label>
            <textarea
              className="feedback-textarea"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Expliquez en détail votre feedback…"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Type pills */}
          <div className="feedback-field">
            <span className="feedback-label">Type de feedback</span>
            <div className="feedback-pills">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`feedback-pill ${formData.type === opt.value ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, type: opt.value }))}
                  disabled={isSubmitting}
                >
                  <span className="feedback-pill-icon">{TYPE_ICONS[opt.value]}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity pills */}
          <div className="feedback-field">
            <span className="feedback-label">Niveau d'importance</span>
            <div className="feedback-pills">
              {SEVERITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`feedback-severity-pill ${formData.severity === opt.value ? 'active' : ''}`}
                  data-severity={opt.value}
                  onClick={() => setFormData(prev => ({ ...prev, severity: opt.value }))}
                  disabled={isSubmitting}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="feedback-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={isSubmitting}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="btn-submit-loading">
                  <span className="btn-spinner" />
                  Envoi…
                </span>
              ) : 'Envoyer'}
            </button>
          </div>
        </form>

        {/* Status */}
        {submitStatus && (
          <div className={`feedback-status ${submitStatus.type}`}>
            <span className="feedback-status-icon">
              {submitStatus.type === 'success' ? <Check size={20} /> : <X size={20} />}
            </span>
            <h3>{submitStatus.title}</h3>
            <p>{submitStatus.message}</p>
            {submitStatus.details && (
              <div className="feedback-status-detail">{submitStatus.details}</div>
            )}
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default FeedbackModal;
