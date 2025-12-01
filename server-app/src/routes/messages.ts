import express, { Request, Response } from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
        firstname?: string;
        lastname?: string;
        is_premium: boolean;
        role: 'user' | 'admin' | 'moderator';
    };
}

interface CreateMessageRequest extends AuthenticatedRequest {
    body: {
        conversation_id: string;
        content: string;
        sender: 'user' | 'ai';
    };
}

interface GetMessagesRequest extends AuthenticatedRequest {
    query: {
        page?: string;
        limit?: string;
        conversation_id?: string;
        q?: string;
    };
}

// POST /api/messages - Envoyer un message dans une conversation
router.post('/', authenticateToken, async (req: CreateMessageRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const { conversation_id, content, sender } = req.body;
    
    // Validation
    if (!conversation_id || !content || !sender) {
      res.status(400).json({ 
        message: 'conversation_id, content et sender sont requis' 
      });
      return;
    }
    
    if (!['user', 'ai'].includes(sender)) {
      res.status(400).json({ 
        message: 'sender doit être "user" ou "ai"' 
      });
      return;
    }
    
    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({
      where: { 
        id: conversation_id,
        userId: req.user.id 
      }
    });
    
    if (!conversation) {
      res.status(404).json({ message: 'Conversation non trouvée' });
      return;
    }
    
    // Créer le message
    const message = await Message.create({
      conversationId: conversation_id,
      sender,
      content,
      emotionDetected: undefined, // Sera mis à jour par l'IA plus tard
      sentAt: new Date()
    });
    
    res.status(201).json(message);
  } catch (error: unknown) {
    console.error('Erreur lors de l\'envoi du message:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi du message', 
      error: message 
    });
  }
});

// GET /api/messages - Récupérer les messages d'une conversation avec pagination
router.get('/', authenticateToken, async (req: GetMessagesRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const { conversation_id, page = '1', limit = '50' } = req.query;
    
    if (!conversation_id) {
      res.status(400).json({ message: 'conversation_id est requis' });
      return;
    }
    
    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({
      where: { 
        id: conversation_id,
        userId: req.user.id 
      }
    });
    
    if (!conversation) {
      res.status(404).json({ message: 'Conversation non trouvée' });
      return;
    }
    
    const pageNum = Number.parseInt(page, 10);
    const limitNum = Number.parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const messages = await Message.findAndCountAll({
      where: { conversationId: conversation_id },
      order: [['sentAt', 'ASC']], // Messages triés chronologiquement
      limit: limitNum,
      offset: offset
    });
    
    res.json({
      messages: messages.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: messages.count,
        totalPages: Math.ceil(messages.count / limitNum)
      }
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des messages:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des messages', 
      error: message 
    });
  }
});

// PUT /api/messages/:id/emotion - Mettre à jour l'émotion détectée d'un message
router.put('/:id/emotion', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const { emotion } = req.body;
    
    if (!emotion) {
      res.status(400).json({ message: 'emotion est requise' });
      return;
    }
    
    // Trouver le message et vérifier qu'il appartient à l'utilisateur
    const message = await Message.findOne({
      where: { id: req.params.id },
      include: [{
        model: Conversation,
        as: 'conversation',
        where: { userId: req.user.id }
      }]
    });
    
    if (!message) {
      res.status(404).json({ message: 'Message non trouvé' });
      return;
    }
    
    message.emotionDetected = emotion;
    await message.save();
    
    res.json(message);
  } catch (error: unknown) {
    console.error('Erreur lors de la mise à jour de l\'émotion:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'émotion', 
      error: message 
    });
  }
});

// DELETE /api/messages/:id - Supprimer un message
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    // Trouver le message et vérifier qu'il appartient à l'utilisateur
    const message = await Message.findOne({
      where: { id: req.params.id },
      include: [{
        model: Conversation,
        as: 'conversation',
        where: { userId: req.user.id }
      }]
    });
    
    if (!message) {
      res.status(404).json({ message: 'Message non trouvé' });
      return;
    }
    
    await message.destroy();
    
    res.json({ 
      message: 'Message supprimé',
      deletedId: req.params.id
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la suppression du message:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du message', 
      error: message 
    });
  }
});

// GET /api/messages/search - Rechercher dans les messages
router.get('/search', authenticateToken, async (req: GetMessagesRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const { q: searchTerm, page = '1', limit = '20' } = req.query;
    
    if (!searchTerm) {
      res.status(400).json({ message: 'Terme de recherche (q) requis' });
      return;
    }
    
    const pageNum = Number.parseInt(page, 10);
    const limitNum = Number.parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const messages = await Message.findAndCountAll({
      where: {
        content: {
          [Op.iLike]: `%${searchTerm}%`
        }
      },
      include: [{
        model: Conversation,
        as: 'conversation',
        where: { userId: req.user.id },
        attributes: ['id', 'title']
      }],
      order: [['sentAt', 'DESC']],
      limit: limitNum,
      offset: offset
    });
    
    res.json({
      messages: messages.rows,
      searchTerm,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: messages.count,
        totalPages: Math.ceil(messages.count / limitNum)
      }
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la recherche de messages:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ 
      message: 'Erreur lors de la recherche de messages', 
      error: message 
    });
  }
});

export default router;