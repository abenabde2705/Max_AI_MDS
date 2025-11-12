import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Envoyer un feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - severity
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre du feedback
 *               description:
 *                 type: string
 *                 description: Description détaillée
 *               type:
 *                 type: string
 *                 enum: [bug, feature, improvement, ui_ux, performance, other]
 *                 description: Type de feedback
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Niveau d'importance
 *               userEmail:
 *                 type: string
 *                 description: Email de l'utilisateur (optionnel)
 *     responses:
 *       201:
 *         description: Feedback envoyé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, type, severity, userEmail } = req.body;

    // Validation des données requises
    if (!title || !description || !type || !severity) {
      return res.status(400).json({
        error: 'Champs requis manquants',
        required: ['title', 'description', 'type', 'severity']
      });
    }

    // Validation des valeurs énumérées
    const validTypes = ['bug', 'feature', 'improvement', 'ui_ux', 'performance', 'other'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Type invalide',
        validTypes
      });
    }

    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        error: 'Sévérité invalide',
        validSeverities
      });
    }

    const feedbackData = {
      title,
      description,
      type,
      severity,
      userEmail: userEmail || req.user?.email || 'anonymous',
      userId: req.user?.id,
      createdAt: new Date().toISOString()
    };

    // Simulation d'envoi (en production, ici on appellerait les webhooks)
    console.log('📤 Feedback reçu:', feedbackData);
    
    // Réponse simulée pour le test
    const response = {
      success: true,
      message: 'Feedback envoyé avec succès',
      feedbackId: `feedback-${Date.now()}`,
      data: feedbackData,
      actions: {
        github: type === 'bug' || severity === 'critical' ? 'Issue créée' : 'Non applicable',
        tracking: 'Enregistré pour suivi'
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Erreur lors du traitement du feedback:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/feedback/test:
 *   get:
 *     summary: Test de connectivité du système de feedback
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Système opérationnel
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Système de feedback opérationnel',
    timestamp: new Date().toISOString(),
    endpoints: {
      submit: '/api/feedback',
      test: '/api/feedback/test'
    }
  });
});

export default router;