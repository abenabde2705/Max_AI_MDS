// Types globaux pour l'application Max AI Backend

import { Request } from 'express';

// Extension de l'interface Request d'Express pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        firstname?: string | undefined;
        lastname?: string | undefined;
        is_premium: boolean;
        role: 'user' | 'admin' | 'moderator';
      };
    }
  }
}

// Types pour les modèles de base de données
export interface UserAttributes {
  id: string;
  email: string;
  password?: string;
  isAnonymous: boolean;
  pseudonym?: string;
  isPremium: boolean;
  firstName?: string;
  lastName?: string;
  age?: number;
  role: 'user' | 'admin' | 'moderator';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationAttributes {
  id: string;
  userId: string;
  title: string;
  isArchived: boolean;
  emotionalContext?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttributes {
  id: string;
  conversationId: string;
  content: string;
  sender: 'user' | 'ai';
  emotionDetected?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackAttributes {
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'ui_ux' | 'performance' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userEmail: string;
  userId?: string;
  conversationId?: string;
  createdAt: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FeedbackAttributes {
  id: string;
  userId: string;
  type: 'bug' | 'feature-request' | 'general';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionAttributes {
  id: string;
  userId: string;
  status: 'active' | 'canceled';
  startDate: Date;
  endDate?: Date;
}

export interface RecommendationAttributes {
  id: string;
  name: string;
  description?: string;
  type: 'video' | 'article' | 'exercise' | 'professionnel de santé';
}

export interface EmotionalJournalAttributes {
  id: string;
  conversationId: string;
  userId: string;
  globalEmotion?: Record<string, any>;
  dateLogged: Date;
}

// Types pour les services externes
export interface AirtableRecord {
  id?: string;
  fields: Record<string, any>;
}

export interface WebhookResults {
  github: {
    id?: number;
    url?: string;
    error?: boolean;
    skipped?: boolean;
    reason?: string;
    message?: string;
  } | null;
  airtable: {
    id?: string;
    url?: string;
    error?: boolean;
    skipped?: boolean;
    reason?: string;
    message?: string;
  } | null;
  summary: {
    success: number;
    failed: number;
    skipped: number;
  };
}

export {};