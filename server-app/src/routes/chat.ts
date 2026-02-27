import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken, checkMessageLimit } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// 20 requêtes par minute par IP — cohérent avec l'ancien rate-limit Traefik
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Trop de requêtes. Veuillez patienter avant de réessayer.' }
});

const router = express.Router();

interface ChatRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    is_premium: boolean;
  };
  body: {
    conversation_id: string;
    message: string;
  };
}

/**
 * POST /api/chat
 *
 * Proxy sécurisé : vérifie le JWT, applique la limite de messages,
 * sauvegarde le message utilisateur, appelle le Chat API interne,
 * sauvegarde la réponse IA, retourne la réponse au frontend.
 *
 * La clé API du Chat API n'est jamais exposée au client.
 */
router.post('/', chatRateLimit, authenticateToken, checkMessageLimit, async (req: ChatRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const { conversation_id, message } = req.body;

    if (!conversation_id || !message?.trim()) {
      res.status(400).json({ message: 'conversation_id et message sont requis' });
      return;
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({
      where: { id: conversation_id, userId: req.user.id }
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation non trouvée' });
      return;
    }

    const trimmedMessage = message.trim();

    // Sauvegarder le message utilisateur
    await Message.create({
      conversationId: conversation_id,
      sender: 'user',
      content: trimmedMessage,
      sentAt: new Date()
    });

    // Auto-titre : si c'est le 1er message, utiliser les 40 premiers caractères comme titre
    const messageCount = await Message.count({ where: { conversationId: conversation_id } });
    if (messageCount === 1) {
      const title = trimmedMessage.slice(0, 40).trim() + (trimmedMessage.length > 40 ? '...' : '');
      await Conversation.update({ title }, { where: { id: conversation_id } });
    }

    // Appeler le Chat API interne (réseau Docker, jamais exposé publiquement)
    const chatApiUrl = process.env.CHAT_API_URL || 'http://chat_api:8000';
    const chatResponse = await fetch(`${chatApiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmedMessage, session_id: conversation_id })
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`Chat API error ${chatResponse.status}: ${errorText}`);
    }

    const { response: aiResponse } = await chatResponse.json() as { response: string };

    // Sauvegarder la réponse IA
    await Message.create({
      conversationId: conversation_id,
      sender: 'ai',
      content: aiResponse,
      sentAt: new Date()
    });

    res.json({ response: aiResponse });
  } catch (error: unknown) {
    console.error('Erreur lors du traitement du chat:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ message: 'Erreur lors du traitement du message', error: message });
  }
});

export default router;
