import express, { Request, Response } from 'express';
import { Op } from 'sequelize';
import { authenticateToken } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Subscription from '../models/Subscription.js';

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

export default router;
