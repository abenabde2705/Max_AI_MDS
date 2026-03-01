import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import StudentVerification from '../models/StudentVerification.js';

const router = Router();

// Configuration multer pour l'upload des cartes étudiantes
const storage = multer.diskStorage({
  destination: 'uploads/student-cards/',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez JPEG, PNG, WebP ou PDF.'));
    }
  }
});

/**
 * POST /api/student-verification/submit
 * Soumettre une carte étudiante pour vérification
 */
router.post('/student-verification/submit', authenticateToken, upload.single('card'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
      return;
    }

    const userId = (req.user as any).id;

    // Vérifier s'il existe déjà une vérification en cours
    const existing = await StudentVerification.findOne({
      where: { userId, status: 'pending' }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Une demande de vérification est déjà en attente',
        code: 'VERIFICATION_PENDING'
      });
      return;
    }

    const verification = await StudentVerification.create({
      userId,
      status: 'pending',
      cardImagePath: req.file.path,
      submittedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Carte étudiante soumise avec succès. En attente de vérification.',
      data: {
        id: verification.getDataValue('id'),
        status: verification.getDataValue('status'),
        submittedAt: verification.getDataValue('submittedAt')
      }
    });
  } catch (error: unknown) {
    console.error('Erreur soumission carte étudiante:', error);
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    res.status(500).json({ success: false, message });
  }
});

/**
 * GET /api/student-verification/status
 * Retourne le statut de vérification de l'utilisateur connecté
 */
router.get('/student-verification/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).id;

    const verification = await StudentVerification.findOne({
      where: { userId },
      order: [['submittedAt', 'DESC']]
    });

    if (!verification) {
      res.json({
        success: true,
        data: { status: 'none' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: verification.getDataValue('id'),
        status: verification.getDataValue('status'),
        submittedAt: verification.getDataValue('submittedAt'),
        reviewedAt: verification.getDataValue('reviewedAt'),
        rejectionReason: verification.getDataValue('rejectionReason')
      }
    });
  } catch (error: unknown) {
    console.error('Erreur récupération statut vérification:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

/**
 * GET /api/admin/student-verifications
 * Liste des vérifications en attente (admin only)
 */
router.get('/admin/student-verifications', authenticateToken, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const verifications = await StudentVerification.findAll({
      where: { status: 'pending' },
      order: [['submittedAt', 'ASC']]
    });

    res.json({
      success: true,
      data: verifications.map(v => ({
        id: v.getDataValue('id'),
        userId: v.getDataValue('userId'),
        status: v.getDataValue('status'),
        cardImagePath: v.getDataValue('cardImagePath'),
        submittedAt: v.getDataValue('submittedAt')
      }))
    });
  } catch (error: unknown) {
    console.error('Erreur liste vérifications admin:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

/**
 * PATCH /api/admin/student-verifications/:id
 * Approuver ou rejeter une vérification (admin only)
 */
router.patch('/admin/student-verifications/:id', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Statut invalide. Utilisez "approved" ou "rejected".' });
      return;
    }

    const verification = await StudentVerification.findByPk(id);

    if (!verification) {
      res.status(404).json({ success: false, message: 'Vérification non trouvée' });
      return;
    }

    await verification.update({
      status,
      reviewedAt: new Date(),
      reviewedBy: (req.user as any).id,
      rejectionReason: status === 'rejected' ? rejectionReason : null
    });

    res.json({
      success: true,
      message: `Vérification ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`,
      data: {
        id: verification.getDataValue('id'),
        status: verification.getDataValue('status'),
        reviewedAt: verification.getDataValue('reviewedAt')
      }
    });
  } catch (error: unknown) {
    console.error('Erreur mise à jour vérification admin:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

export default router;
