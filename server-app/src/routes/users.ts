import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { Op } from 'sequelize';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Subscription from '../models/Subscription.js';
import EmotionalJournal from '../models/EmotionalJournal.js';
import CrisisAlert from '../models/CrisisAlert.js';
import StudentVerification from '../models/StudentVerification.js';

let _stripe: Stripe | null = null;
const getStripe = (): Stripe | null => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  return _stripe;
};

const FREE_MESSAGE_LIMIT = 10;

const router = express.Router();

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
        firstname?: string | undefined;
        lastname?: string | undefined;
        is_premium: boolean;
    };
}

/**
 * GET /api/users/me - Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    // Retourner les informations de l'utilisateur (déjà dans req.user grâce au middleware)
    res.json({
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      is_premium: req.user.is_premium,
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération du profil:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du profil', 
      error: message 
    });
  }
});

/**
 * GET /api/users/me/message-count - Nombre de messages utilisés et limite selon le plan
 */
router.get('/me/message-count', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    // Vérifier abonnement actif
    const activeSubscription = await Subscription.findOne({
      where: { userId: req.user.id, status: 'active' }
    });

    const isPremium = req.user.is_premium || !!activeSubscription;

    // Compter les messages utilisateur sur toutes ses conversations
    const conversations = await Conversation.findAll({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    const conversationIds = conversations.map(c => c.getDataValue('id'));

    const used = conversationIds.length === 0 ? 0 : await Message.count({
      where: {
        conversationId: { [Op.in]: conversationIds },
        sender: 'user'
      }
    });

    res.json({
      used,
      limit: isPremium ? null : FREE_MESSAGE_LIMIT,
      is_premium: isPremium
    });
  } catch (error: unknown) {
    console.error('Erreur lors du comptage des messages:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ message: 'Erreur interne du serveur', error: message });
  }
});

/**
 * DELETE /api/users/me - Suppression du compte (RGPD)
 */
router.delete('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const userId = req.user.id;

    // 1. Annuler l'abonnement Stripe actif si présent
    const subscription = await Subscription.findOne({
      where: { userId, status: 'active' }
    });

    if (subscription) {
      const stripeSubId = subscription.getDataValue('stripeSubscriptionId');
      if (stripeSubId) {
        const stripe = getStripe();
        if (stripe) {
          await stripe.subscriptions.cancel(stripeSubId).catch(() => {
            // Non bloquant : on supprime le compte même si Stripe échoue
          });
        }
      }
    }

    // 2. Récupérer les IDs de conversations pour supprimer les messages
    const conversations = await Conversation.findAll({
      where: { userId },
      attributes: ['id']
    });
    const conversationIds = conversations.map(c => c.getDataValue('id'));

    // 3. Suppression en cascade manuelle
    if (conversationIds.length > 0) {
      await Message.destroy({ where: { conversationId: { [Op.in]: conversationIds } } });
    }
    await Conversation.destroy({ where: { userId } });
    await EmotionalJournal.destroy({ where: { userId } });
    await CrisisAlert.destroy({ where: { userId } });
    await Subscription.destroy({ where: { userId } });
    await StudentVerification.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });

    res.json({ success: true, message: 'Compte supprimé avec succès' });
  } catch (error: unknown) {
    console.error('Erreur lors de la suppression du compte:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

export default router;
