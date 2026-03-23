import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { subscribeContact, unsubscribeContact, getContactStatus } from '../services/newsletter.js';

const router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string; username: string; firstname?: string; lastname?: string };
}

// POST /api/newsletter/subscribe — public (landing page form)
router.post('/subscribe', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'Email requis' });
    return;
  }
  try {
    await subscribeContact(email);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
});

// POST /api/newsletter/unsubscribe — auth (profile toggle OFF)
router.post('/unsubscribe', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const email = req.user?.email;
  if (!email) { res.status(401).json({ message: 'Non authentifié' }); return; }
  try {
    await unsubscribeContact(email);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Erreur serveur' });
  }
});

// GET /api/newsletter/status — auth (profile toggle initial state)
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const email = req.user?.email;
  if (!email) { res.status(401).json({ message: 'Non authentifié' }); return; }
  try {
    const subscribed = await getContactStatus(email);
    res.json({ subscribed });
  } catch {
    res.json({ subscribed: false });
  }
});

export default router;
