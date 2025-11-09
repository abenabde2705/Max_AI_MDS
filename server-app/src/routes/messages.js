import express from 'express';
import { Message, Conversation } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// POST /api/messages - Envoyer un message dans une conversation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { conversation_id, content, sender } = req.body;
    
    // Validation
    if (!conversation_id || !content || !sender) {
      return res.status(400).json({ 
        message: 'conversation_id, content et sender sont requis' 
      });
    }
    
    if (!['user', 'ai'].includes(sender)) {
      return res.status(400).json({ 
        message: 'sender doit être "user" ou "ai"' 
      });
    }
    
    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({
      where: { 
        id: conversation_id,
        user_id: req.user.id 
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Créer le message
    const message = await Message.create({
      conversation_id,
      sender,
      content,
      emotion_detected: null, // Sera mis à jour par l'IA plus tard
      sent_at: new Date()
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi du message', 
      error: error.message 
    });
  }
});

// GET /api/messages/:conversationId - Récupérer tous les messages d'une conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({
      where: { 
        id: conversationId,
        user_id: req.user.id 
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Récupérer tous les messages triés par date
    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      order: [['sent_at', 'ASC']],
      attributes: ['id', 'sender', 'content', 'emotion_detected', 'sent_at']
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des messages', 
      error: error.message 
    });
  }
});

// PUT /api/messages/:id/emotion - Mettre à jour l'émotion détectée d'un message
router.put('/:id/emotion', authenticateToken, async (req, res) => {
  try {
    const { emotion_detected } = req.body;
    
    // Trouver le message et vérifier qu'il appartient à l'utilisateur
    const message = await Message.findOne({
      where: { id: req.params.id },
      include: [{
        model: Conversation,
        as: 'conversation',
        where: { user_id: req.user.id }
      }]
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    // Mettre à jour l'émotion
    message.emotion_detected = emotion_detected;
    await message.save();
    
    res.json({ 
      message: 'Émotion mise à jour',
      updatedMessage: message
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'émotion:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'émotion', 
      error: error.message 
    });
  }
});

// DELETE /api/messages/:id - Supprimer un message spécifique
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Trouver le message et vérifier qu'il appartient à l'utilisateur
    const message = await Message.findOne({
      where: { id: req.params.id },
      include: [{
        model: Conversation,
        as: 'conversation',
        where: { user_id: req.user.id }
      }]
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    await message.destroy();
    
    res.json({ 
      message: 'Message supprimé',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du message', 
      error: error.message 
    });
  }
});

// GET /api/messages/search/:conversationId - Rechercher dans les messages d'une conversation
router.get('/search/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'La recherche doit contenir au moins 2 caractères' });
    }
    
    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({
      where: { 
        id: conversationId,
        user_id: req.user.id 
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Rechercher dans les messages
    const messages = await Message.findAll({
      where: { 
        conversation_id: conversationId,
        content: {
          [Op.iLike]: `%${query.trim()}%` // Recherche insensible à la casse
        }
      },
      order: [['sent_at', 'ASC']],
      attributes: ['id', 'sender', 'content', 'emotion_detected', 'sent_at']
    });
    
    res.json({
      query: query.trim(),
      results: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la recherche', 
      error: error.message 
    });
  }
});

export default router;