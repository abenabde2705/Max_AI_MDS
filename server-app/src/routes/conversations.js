import express from 'express';
import { Conversation, Message } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

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
router.get('/', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Message,
          as: 'messages',
          attributes: ['content', 'sender', 'sent_at'],
          limit: 1,
          order: [['sent_at', 'DESC']],
          required: false
        }
      ],
      order: [['started_at', 'DESC']], // Triées par date (plus récente en premier)
      attributes: ['id', 'started_at', 'ended_at']
    });

    // Enrichir avec informations supplémentaires
    const enrichedConversations = conversations.map(conv => ({
      id: conv.id,
      started_at: conv.started_at,
      ended_at: conv.ended_at,
      lastMessage: conv.messages[0] || null,
      messageCount: 0 // Will be populated separately if needed
    }));

    res.json(enrichedConversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des conversations', 
      error: error.message 
    });
  }
});

// POST /api/conversations - Créer une nouvelle conversation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const conversation = await Conversation.create({
      user_id: req.user.id,
      started_at: new Date()
    });
    
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la conversation', 
      error: error.message 
    });
  }
});

// GET /api/conversations/:id - Récupérer une conversation avec tous ses messages
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id // Sécurité : seulement les conversations de l'utilisateur
      },
      include: [
        {
          model: Message,
          as: 'messages',
          order: [['sent_at', 'ASC']] // Messages triés chronologiquement
        }
      ]
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de la conversation', 
      error: error.message 
    });
  }
});

// DELETE /api/conversations/:id - Supprimer une conversation (suppression définitive)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id // Sécurité : seulement les conversations de l'utilisateur
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Supprimer la conversation (les messages seront supprimés automatiquement grâce à CASCADE)
    await conversation.destroy();
    
    res.json({ 
      message: 'Conversation supprimée définitivement',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la conversation', 
      error: error.message 
    });
  }
});

// DELETE /api/conversations - Supprimer tout l'historique de l'utilisateur
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const deletedCount = await Conversation.destroy({
      where: { user_id: req.user.id }
    });
    
    res.json({ 
      message: 'Historique supprimé définitivement',
      deletedConversations: deletedCount
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'historique:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'historique', 
      error: error.message 
    });
  }
});

// PUT /api/conversations/:id/end - Terminer une conversation
router.put('/:id/end', authenticateToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id
      }
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    conversation.ended_at = new Date();
    await conversation.save();
    
    res.json({ 
      message: 'Conversation terminée',
      conversation
    });
  } catch (error) {
    console.error('Erreur lors de la fin de conversation:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la fin de conversation', 
      error: error.message 
    });
  }
});

// GET /api/conversations/stats/summary - Statistiques des conversations de l'utilisateur
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalConversations = await Conversation.count({
      where: { user_id: req.user.id }
    });
    
    const totalMessages = await Message.count({
      include: [{
        model: Conversation,
        as: 'conversation',
        where: { user_id: req.user.id },
        attributes: []
      }]
    });
    
    const recentConversations = await Conversation.count({
      where: { 
        user_id: req.user.id,
        started_at: {
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
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ 
      message: 'Erreur lors du calcul des statistiques', 
      error: error.message 
    });
  }
});

export default router;