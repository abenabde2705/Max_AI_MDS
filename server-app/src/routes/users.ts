import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';

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

export default router;
