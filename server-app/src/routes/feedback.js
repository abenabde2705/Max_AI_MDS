import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// ================================
// SERVICES WEBHOOK
// ================================

class WebhookService {
  // GitHub - Issues pour bugs critiques
  async createGitHubIssue(feedbackData) {
    if (!process.env.GITHUB_TOKEN) {
      console.log('GitHub token non configuré, skip GitHub issue');
      return { skipped: true, reason: 'Token manquant' };
    }

    const issueData = {
      title: `[${feedbackData.severity.toUpperCase()}] ${feedbackData.title}`,
      body: `## Feedback Utilisateur\n\n**Type:** ${feedbackData.type}\n**Sévérité:** ${feedbackData.severity}\n**Email:** ${feedbackData.userEmail}\n**Date:** ${feedbackData.createdAt}\n\n### Description\n${feedbackData.description}\n\n---\n*Feedback automatique depuis Max AI*`,
      labels: ['user-feedback', feedbackData.type, `severity:${feedbackData.severity}`]
    };

    try {
      const response = await axios.post(
        `https://api.github.com/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/issues`,
        issueData,
        {
          headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      return {
        id: response.data.number,
        url: response.data.html_url
      };
    } catch (error) {
      console.error('Erreur GitHub:', error.response?.data || error.message);
      throw new Error(`Failed to create GitHub issue: ${error.message}`);
    }
  }

  // Airtable - Tous les feedbacks  
  async createAirtableRecord(recordData) {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log('Airtable non configuré, skip enregistrement');
      return { skipped: true, reason: 'Configuration manquante' };
    }

    console.log('Tentative Airtable:', {
      baseId: process.env.AIRTABLE_BASE_ID,
      tableName: process.env.AIRTABLE_TABLE_NAME,
      hasApiKey: !!process.env.AIRTABLE_API_KEY
    });

    const airtableConfig = {
      baseId: process.env.AIRTABLE_BASE_ID,
      apiKey: process.env.AIRTABLE_API_KEY,
      tableName: process.env.AIRTABLE_TABLE_NAME || 'Feedback'
    };

    // Mapping des valeurs pour correspondre aux options Airtable
    const mapType = (type) => {
      const mapping = {
        'bug': 'Bug',
        'feature': 'Feature Request',
        'improvement': 'Enhancement', 
        'ui_ux': 'Enhancement',
        'performance': 'Enhancement',
        'other': 'Other'
      };
      return mapping[type] || 'Other';
    };

    const mapSeverity = (severity) => {
      const mapping = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'critical': 'Critical'
      };
      return mapping[severity] || 'Medium';
    };

    const payload = {
      records: [{
        fields: {
          'Title': recordData.title,
          'Type': mapType(recordData.type),
          'Severity': mapSeverity(recordData.severity),
          'Description': recordData.description,
          'User Email': recordData.userEmail,
          'Status': 'Open',
          'Created': recordData.createdAt,
          'Source': 'Max AI Web App',
          'Conversation ID': recordData.conversationId || '',
          'Metadata': JSON.stringify({
            userId: recordData.userId,
            timestamp: recordData.createdAt,
            source: 'web-feedback-form'
          })
        }
      }]
    };

    try {
      const url = `https://api.airtable.com/v0/${airtableConfig.baseId}/${airtableConfig.tableName}`;
      console.log('URL Airtable:', url);
      
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${airtableConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Succès Airtable:', response.data.records[0].id);
      
      return {
        id: response.data.records[0].id,
        url: `https://airtable.com/${airtableConfig.baseId}/${airtableConfig.tableName}`
      };
    } catch (error) {
      console.error('Erreur Airtable:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Ne pas faire échouer tout le processus si Airtable ne marche pas
      return { 
        error: true, 
        message: error.response?.data?.error?.message || error.message 
      };
    }
  }

  // Orchestration des webhooks
  async processWebhooks(feedbackData) {
    const results = {
      github: null,
      airtable: null,
      summary: {
        success: 0,
        failed: 0,
        skipped: 0
      }
    };

    // GitHub pour bugs critiques uniquement
    if (feedbackData.type === 'bug' || feedbackData.severity === 'critical') {
      try {
        results.github = await this.createGitHubIssue(feedbackData);
        if (results.github.skipped) {
          results.summary.skipped++;
        } else {
          results.summary.success++;
        }
      } catch (error) {
        results.github = { error: true, message: error.message };
        results.summary.failed++;
      }
    } else {
      results.github = { skipped: true, reason: 'Non critique' };
      results.summary.skipped++;
    }

    // Airtable pour tous les feedbacks
    try {
      results.airtable = await this.createAirtableRecord(feedbackData);
      if (results.airtable.skipped) {
        results.summary.skipped++;
      } else if (results.airtable.error) {
        results.summary.failed++;
      } else {
        results.summary.success++;
      }
    } catch (error) {
      results.airtable = { error: true, message: error.message };
      results.summary.failed++;
    }

    return results;
  }
}

const webhookService = new WebhookService();

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

    console.log('Traitement feedback:', {
      title: feedbackData.title,
      type: feedbackData.type,
      severity: feedbackData.severity,
      userEmail: feedbackData.userEmail
    });
    
    // Traitement des webhooks (Airtable + GitHub)
    const webhookResults = await webhookService.processWebhooks(feedbackData);
    
    // Réponse avec résultats réels
    const response = {
      success: true,
      message: 'Feedback traité avec succès',
      feedbackId: `feedback-${Date.now()}`,
      data: feedbackData,
      webhooks: {
        github: webhookResults.github?.url ? 
          `Issue créée: ${webhookResults.github.url}` : 
          webhookResults.github?.skipped ? 'Non applicable (pas critique)' : 
          webhookResults.github?.error ? `Erreur: ${webhookResults.github.message}` : 'Traité',
        airtable: webhookResults.airtable?.url ? 
          `Enregistré: ${webhookResults.airtable.url}` : 
          webhookResults.airtable?.skipped ? 'Non configuré' :
          webhookResults.airtable?.error ? `Erreur: ${webhookResults.airtable.message}` : 'Traité'
      },
      stats: webhookResults.summary
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