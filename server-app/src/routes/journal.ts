import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import EmotionalJournal from '../models/EmotionalJournal.js';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    firstname?: string;
    lastname?: string;
    is_premium: boolean;
  };
}

// GET /api/journal — Toutes les entrées de l'utilisateur, triées par date DESC
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const entries = await EmotionalJournal.findAll({
      where: { userId: req.user.id },
      order: [['dateLogged', 'DESC']]
    });

    res.json(entries.map(e => ({
      id: e.getDataValue('id'),
      mood: e.getDataValue('mood'),
      description: e.getDataValue('description'),
      tags: e.getDataValue('tags') || [],
      dateLogged: e.getDataValue('dateLogged'),
      globalEmotion: e.getDataValue('globalEmotion'),
      conversationId: e.getDataValue('conversationId')
    })));
  } catch (error) {
    console.error('Erreur GET /api/journal:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// POST /api/journal — Créer une nouvelle entrée manuelle
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const { mood, description, tags } = req.body;

    if (!mood || !description?.trim()) {
      res.status(400).json({ message: 'mood et description sont requis' });
      return;
    }

    const entry = await EmotionalJournal.create({
      userId: req.user.id,
      mood,
      description: description.trim(),
      tags: tags || [],
      dateLogged: new Date()
    });

    res.status(201).json({
      id: entry.getDataValue('id'),
      mood: entry.getDataValue('mood'),
      description: entry.getDataValue('description'),
      tags: entry.getDataValue('tags') || [],
      dateLogged: entry.getDataValue('dateLogged'),
      globalEmotion: entry.getDataValue('globalEmotion'),
      conversationId: entry.getDataValue('conversationId')
    });
  } catch (error) {
    console.error('Erreur POST /api/journal:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// DELETE /api/journal/:id — Supprimer une entrée (vérifie l'ownership)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    const entry = await EmotionalJournal.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!entry) {
      res.status(404).json({ message: 'Entrée non trouvée' });
      return;
    }

    await entry.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Erreur DELETE /api/journal/:id:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

export default router;
