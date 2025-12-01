import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import axios from 'axios';

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

interface CreateFeedbackRequest extends AuthenticatedRequest {
    body: {
        type: 'bug' | 'feature-request' | 'general';
        title: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        metadata?: Record<string, any>;
    };
}

interface WebhookResult {
    service: string;
    success: boolean;
    skipped?: boolean;
    reason?: string;
    response?: any;
    error?: string;
}

// ================================
// SERVICES WEBHOOK
// ================================

class WebhookService {
    // GitHub - Issues pour bugs critiques
    async createGitHubIssue(feedbackData: any): Promise<WebhookResult> {
        if (!process.env.GITHUB_TOKEN) {
            console.log('GitHub token non configuré, skip GitHub issue');
            return { service: 'github', success: false, skipped: true, reason: 'Token manquant' };
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
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                service: 'github',
                success: true,
                response: { id: response.data.id, url: response.data.html_url }
            };
        } catch (error) {
            console.error('Erreur GitHub webhook:', error);
            return {
                service: 'github',
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    // Slack - Notifications pour feedback critique
    async sendSlackNotification(feedbackData: any): Promise<WebhookResult> {
        if (!process.env.SLACK_WEBHOOK_URL) {
            return { service: 'slack', success: false, skipped: true, reason: 'Webhook URL manquante' };
        }

        const slackMessage = {
            text: `Nouveau feedback critique reçu`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `🚨 Feedback ${feedbackData.severity.toUpperCase()}: ${feedbackData.title}`
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Type:*\n${feedbackData.type}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Sévérité:*\n${feedbackData.severity}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Utilisateur:*\n${feedbackData.userEmail}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Date:*\n${feedbackData.createdAt}`
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Description:*\n${feedbackData.description}`
                    }
                }
            ]
        };

        try {
            const response = await axios.post(process.env.SLACK_WEBHOOK_URL, slackMessage);
            return {
                service: 'slack',
                success: true,
                response: response.status
            };
        } catch (error) {
            console.error('Erreur Slack webhook:', error);
            return {
                service: 'slack',
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    // Orchestrateur principal
    async processWebhooks(feedbackData: any): Promise<WebhookResult[]> {
        const results: WebhookResult[] = [];

        // Pour les bugs critiques ou high severity, créer GitHub issue
        if (['critical', 'high'].includes(feedbackData.severity) || feedbackData.type === 'bug') {
            const githubResult = await this.createGitHubIssue(feedbackData);
            results.push(githubResult);
        }

        // Pour les feedbacks critiques, notifier Slack
        if (feedbackData.severity === 'critical') {
            const slackResult = await this.sendSlackNotification(feedbackData);
            results.push(slackResult);
        }

        return results;
    }
}

// ================================
// ROUTES PRINCIPALES
// ================================

const webhookService = new WebhookService();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Système de feedback et signalement
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Soumettre un feedback
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
 *               - type
 *               - title
 *               - description
 *               - severity
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['bug', 'feature-request', 'general']
 *                 description: Type de feedback
 *               title:
 *                 type: string
 *                 description: Titre du feedback
 *                 example: "Bug dans le chat"
 *               description:
 *                 type: string
 *                 description: Description détaillée
 *                 example: "Le message ne s'envoie pas quand..."
 *               severity:
 *                 type: string
 *                 enum: ['low', 'medium', 'high', 'critical']
 *                 description: Niveau de sévérité
 *               metadata:
 *                 type: object
 *                 description: Métadonnées optionnelles
 *     responses:
 *       201:
 *         description: Feedback soumis avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feedbackId:
 *                   type: string
 *                 webhookResults:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Données manquantes ou invalides
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authenticateToken, async (req: CreateFeedbackRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }

        const { type, title, description, severity, metadata } = req.body;

        // Validation
        if (!type || !title || !description || !severity) {
            res.status(400).json({
                message: 'Les champs type, title, description et severity sont requis'
            });
            return;
        }

        const validTypes = ['bug', 'feature-request', 'general'];
        const validSeverities = ['low', 'medium', 'high', 'critical'];

        if (!validTypes.includes(type)) {
            res.status(400).json({
                message: 'Type invalide. Types acceptés: ' + validTypes.join(', ')
            });
            return;
        }

        if (!validSeverities.includes(severity)) {
            res.status(400).json({
                message: 'Sévérité invalide. Sévérités acceptées: ' + validSeverities.join(', ')
            });
            return;
        }

        // Données pour les webhooks
        const feedbackData = {
            id: `feedback_${Date.now()}_${req.user.id.slice(0, 8)}`,
            type,
            title,
            description,
            severity,
            metadata: metadata || {},
            userEmail: req.user.email,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        // Déclencher les webhooks selon la sévérité
        const webhookResults = await webhookService.processWebhooks(feedbackData);

        // Log pour monitoring
        console.log(`Feedback reçu:`, {
            id: feedbackData.id,
            type,
            severity,
            user: req.user.email,
            webhooksTriggered: webhookResults.length
        });

        res.status(201).json({
            message: 'Feedback soumis avec succès',
            feedbackId: feedbackData.id,
            webhookResults: webhookResults.map(result => ({
                service: result.service,
                success: result.success,
                skipped: result.skipped || false
            }))
        });

    } catch (error: unknown) {
        console.error('Erreur lors de la soumission du feedback:', error);
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        res.status(500).json({
            message: 'Erreur serveur lors de la soumission du feedback',
            error: message
        });
    }
});

// Route pour tester les webhooks (dev uniquement)
router.post('/test-webhooks', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (process.env.NODE_ENV === 'production') {
            res.status(403).json({
                message: 'Endpoint de test non disponible en production'
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: 'Utilisateur non authentifié' });
            return;
        }

        const testFeedback = {
            id: 'test_webhook_' + Date.now(),
            type: 'bug',
            title: 'Test de webhook',
            description: 'Ceci est un test des webhooks automatiques',
            severity: 'critical',
            userEmail: req.user.email,
            userId: req.user.id,
            createdAt: new Date().toISOString()
        };

        const results = await webhookService.processWebhooks(testFeedback);

        res.json({
            message: 'Test des webhooks terminé',
            results
        });

    } catch (error: unknown) {
        console.error('Erreur lors du test des webhooks:', error);
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        res.status(500).json({
            message: 'Erreur lors du test des webhooks',
            error: message
        });
    }
});

export default router;