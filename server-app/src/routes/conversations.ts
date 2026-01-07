import express, { Request, Response } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

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

interface CreateConversationRequest extends AuthenticatedRequest {
    body: {
        title?: string;
    };
}

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Gestion des conversations
 */

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Lister toutes les conversations de l'utilisateur
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Conversation'
 *                   - type: object
 *                     properties:
 *                       lastMessage:
 *                         type: string
 *                         description: Dernier message de la conversation
 *                       messageCount:
 *                         type: integer
 *                         description: Nombre total de messages
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Créer une nouvelle conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre de la conversation (optionnel)
 *                 example: "Discussion sur l'anxiété"
 *     responses:
 *       201:
 *         description: Conversation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const conversations = await Conversation.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Message,
          as: 'messages',
          attributes: ['content', 'sender', 'sentAt'],
          limit: 1,
          order: [['sentAt', 'DESC']],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']], // Triées par date (plus récente en premier)
      attributes: ['id', 'title', 'isArchived', 'createdAt', 'updatedAt']
    });

    // Enrichir avec informations supplémentaires
    const enrichedConversations = conversations.map(conv => {
      const convData: any = conv.get({ plain: true });
      return {
        id: convData.id,
        title: convData.title,
        isArchived: convData.isArchived,
        createdAt: convData.createdAt,
        updatedAt: convData.updatedAt,
        lastMessage: convData.messages?.[0] || null,
        messageCount: 0 // Will be populated separately if needed
      };
    });

    res.json(enrichedConversations);
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des conversations:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des conversations', 
      error: message 
    });
  }
});

// POST /api/conversations - Créer une nouvelle conversation
router.post('/', authenticateToken, async (req: CreateConversationRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const conversation = await Conversation.create({
      userId: req.user.id,
      title: req.body.title || 'Nouvelle conversation',
      isArchived: false
    });
    
    res.status(201).json(conversation);
  } catch (error: unknown) {
    console.error('Erreur lors de la création de la conversation:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la création de la conversation', 
      error: message 
    });
  }
});

// GET /api/conversations/:id - Récupérer une conversation avec tous ses messages
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id // Sécurité : seulement les conversations de l'utilisateur
      },
      include: [
        {
          model: Message,
          as: 'messages',
          order: [['sentAt', 'ASC']] // Messages triés chronologiquement
        }
      ]
    });
    
    if (!conversation) {
      res.status(404).json({ message: 'Conversation non trouvée' });
      return;
    }
    
    res.json(conversation);
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de la conversation', 
      error: message 
    });
  }
});

// DELETE /api/conversations/:id - Supprimer une conversation (suppression définitive)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id // Sécurité : seulement les conversations de l'utilisateur
      }
    });
    
    if (!conversation) {
      res.status(404).json({ message: 'Conversation non trouvée' });
      return;
    }
    
    // Supprimer la conversation (les messages seront supprimés automatiquement grâce à CASCADE)
    await conversation.destroy();
    
    res.json({ 
      message: 'Conversation supprimée définitivement',
      deletedId: req.params.id
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la conversation', 
      error: message 
    });
  }
});

// DELETE /api/conversations - Supprimer tout l'historique de l'utilisateur
router.delete('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const deletedCount = await Conversation.destroy({
      where: { userId: req.user.id }
    });
    
    res.json({ 
      message: 'Historique supprimé définitivement',
      deletedConversations: deletedCount
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la suppression de l\'historique:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'historique', 
      error: message 
    });
  }
});

// PUT /api/conversations/:id/end - Terminer une conversation
router.put('/:id/end', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!conversation) {
      res.status(404).json({ message: 'Conversation non trouvée' });
      return;
    }
    
    conversation.isArchived = true;
    await conversation.save();
    
    res.json({ 
      message: 'Conversation archivée',
      conversation
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la fin de conversation:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la fin de conversation', 
      error: message 
    });
  }
});

// GET /api/conversations/stats/summary - Statistiques des conversations de l'utilisateur
router.get('/stats/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const totalConversations = await Conversation.count({
      where: { userId: req.user.id }
    });
    
    const totalMessages = await Message.count({
      include: [{
        model: Conversation,
        as: 'conversation',
        where: { userId: req.user.id },
        attributes: []
      }]
    });
    
    const recentConversations = await Conversation.count({
      where: { 
        userId: req.user.id,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 derniers jours
        }
      }
    });
    
    res.json({
      totalConversations,
      totalMessages,
      recentConversations,
      averageMessagesPerConversation: totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0
    });
  } catch (error: unknown) {
    console.error('Erreur lors du calcul des statistiques:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors du calcul des statistiques', 
      error: message 
    });
  }
});

export default router;