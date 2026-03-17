import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';
import passport from '../config/passport.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.js';

const router = express.Router();

interface RegisterRequest extends Request {
    body: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        age: string | number;
    };
}

interface LoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

interface UpdateProfileRequest extends Request {
    body: {
        firstName?: string;
        lastName?: string;
        email?: string;
    };
}

interface ChangePasswordRequest extends Request {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}

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
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints pour l'authentification des utilisateurs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - age
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Prénom de l'utilisateur
 *                 example: "Jean"
 *               lastName:
 *                 type: string
 *                 description: Nom de famille
 *                 example: "Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email
 *                 example: "jean.dupont@email.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Mot de passe
 *                 example: "monmotdepasse123"
 *               age:
 *                 type: integer
 *                 minimum: 13
 *                 description: Âge de l'utilisateur
 *                 example: 25
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Inscription réussie"
 *                 token:
 *                   type: string
 *                   description: Token JWT pour l'authentification
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides ou utilisateur déjà existant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, age } = req.body;

    // Validation des données
    if (!firstName || !lastName || !email || !password || !age) {
      res.status(400).json({
        message: 'Tous les champs sont requis'
      });
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      res.status(400).json({
        message: 'Un compte existe déjà avec cet email'
      });
      return;
    }

    // Créer un nouvel utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: password, // Le modèle hashera automatiquement via le beforeSave hook
      age: Number.parseInt(age.toString(), 10),
      isAnonymous: false,
      isPremium: false
    });

    console.log('Created user:', user);
    console.log('User ID:', user.getDataValue('id'));
    console.log('User dataValues:', user.dataValues);
    console.log('User getDataValue id:', user.getDataValue('id'));

    // Envoyer l'email de bienvenue (non-bloquant)
    sendWelcomeEmail({ to: email.toLowerCase(), firstName }).catch(err =>
      console.error('Erreur envoi email de bienvenue:', err)
    );

    // Générer un token JWT
    const userId = user.getDataValue('id');
    console.log('Using userId for token:', userId);
    const token = generateToken(userId);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user.getDataValue('id'),
        firstName: user.getDataValue('firstName'),
        lastName: user.getDataValue('lastName'),
        email: user.getDataValue('email'),
        age: user.getDataValue('age')
      }
    });

  } catch (error: unknown) {
    console.error('Erreur lors de l\'inscription:', error);
    
    if (error instanceof Error && error.name === 'SequelizeValidationError') {
      res.status(400).json({
        message: 'Données invalides',
        error: error.message
      });
      return;
    }

    if (error instanceof Error && 'code' in error && error.code === '23505') {
      res.status(400).json({
        message: 'Un compte existe déjà avec cet email'
      });
      return;
    }

    res.status(500).json({
      message: 'Erreur serveur lors de l\'inscription'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email
 *                 example: "jean.dupont@email.com"
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *                 example: "monmotdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *                 token:
 *                   type: string
 *                   description: Token JWT pour l'authentification
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données manquantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      res.status(400).json({
        message: 'Email et mot de passe requis'
      });
      return;
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'isAnonymous', 'isPremium', 'age', 'lastLogin', 'createdAt', 'updatedAt'] // Spécifier tous les champs
    });
    
    if (!user) {
      res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // Vérifier le mot de passe
    console.log('Password provided:', password);
    console.log('Stored hash:', user.getDataValue('password'));
    console.log('GetDataValue hash:', user.getDataValue('password'));
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // Mettre à jour la date de dernière connexion
    await user.update({ lastLogin: new Date() });

    // Générer un token JWT
    const token = generateToken(user.getDataValue('id'));

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.getDataValue('id'),
        firstName: user.getDataValue('firstName'),
        lastName: user.getDataValue('lastName'),
        email: user.getDataValue('email'),
        age: user.getDataValue('age'),
        isPremium: user.getDataValue('isPremium')
      }
    });

  } catch (error: unknown) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la connexion'
    });
  }
});

// Route pour obtenir le profil utilisateur (protégée)
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Utilisateur non authentifié'
      });
      return;
    }

    console.log('Profile request - req.user:', req.user);
    console.log('Profile request - req.user.id:', req.user.id);
    console.log('Profile request - typeof req.user.id:', typeof req.user.id);

    const user = await User.findByPk(req.user.id);
    console.log('Profile request - found user:', user ? `${user.email} (${user.id})` : 'null');
    
    if (!user) {
      res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    res.json({
      user: {
        id: user.getDataValue('id'),
        firstName: user.getDataValue('firstName'),
        lastName: user.getDataValue('lastName'),
        email: user.getDataValue('email'),
        age: user.getDataValue('age'),
        isPremium: user.getDataValue('isPremium'),
        role: user.getDataValue('role') || 'user',
        createdAt: user.getDataValue('createdAt'),
        lastLogin: user.getDataValue('lastLogin')
      }
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

// Route pour mettre à jour le profil utilisateur (protégée)
router.put('/profile', authenticateToken, async (req: UpdateProfileRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Utilisateur non authentifié'
      });
      return;
    }

    const { firstName, lastName, email } = req.body;
    const userId = req.user.id;

    const updateData: Partial<{ firstName: string; lastName: string; email: string }> = {};
    if (firstName) {updateData.firstName = firstName;}
    if (lastName) {updateData.lastName = lastName;}
    if (email) {updateData.email = email.toLowerCase();}

    const [updatedCount] = await User.update(updateData, {
      where: { id: userId }
    });

    if (updatedCount === 0) {
      res.status(404).json({
        message: 'Utilisateur introuvable'
      });
      return;
    }

    const updatedUser = await User.findByPk(userId);
    
    if (!updatedUser) {
      res.status(404).json({
        message: 'Utilisateur introuvable après mise à jour'
      });
      return;
    }

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        age: updatedUser.age,
        isPremium: updatedUser.isPremium
      }
    });

  } catch (error: unknown) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        message: 'Un compte existe déjà avec cet email'
      });
      return;
    }

    res.status(500).json({
      message: 'Erreur serveur lors de la mise à jour'
    });
  }
});

// Route pour changer le mot de passe (protégée)
router.put('/change-password', authenticateToken, async (req: ChangePasswordRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Utilisateur non authentifié'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
      return;
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
      return;
    }
    
    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(401).json({
        message: 'Mot de passe actuel incorrect'
      });
      return;
    }

    // Mettre à jour le mot de passe (le hook beforeSave s'occupera du hachage)
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Mot de passe changé avec succès'
    });

  } catch (error: unknown) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
});

// Route pour vérifier la validité du token
router.get('/verify-token', authenticateToken, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({
      valid: false,
      message: 'Token invalide'
    });
    return;
  }

  res.json({
    valid: true,
    user: {
      id: req.user.id,
      firstName: req.user.firstname,
      lastName: req.user.lastname,
      email: req.user.email,
      is_premium: req.user.is_premium
    }
  });
});

/**
 * @swagger
 * /api/auth/create-admin:
 *   post:
 *     summary: Créer un compte administrateur (Admin seulement)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Super"
 *               lastName:
 *                 type: string
 *                 example: "Admin"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@maxai.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "adminPassword123"
 *               role:
 *                 type: string
 *                 enum: [admin, moderator]
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Administrateur créé avec succès
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/create-admin', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      res.status(400).json({
        message: 'Tous les champs sont requis'
      });
      return;
    }

    // Vérifier que le rôle est valide
    if (!['admin', 'moderator'].includes(role)) {
      res.status(400).json({
        message: 'Rôle invalide. Seuls admin et moderator sont autorisés.'
      });
      return;
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (existingUser) {
      res.status(409).json({
        message: 'Un compte existe déjà avec cet email'
      });
      return;
    }

    // Créer l'administrateur
    const adminUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      isAnonymous: false,
      isPremium: true // Les admins sont automatiquement premium
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        isPremium: adminUser.isPremium
      }
    });

  } catch (error: unknown) {
    console.error('Erreur lors de la création de l\'admin:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création de l\'administrateur'
    });
  }
});

/**
 * @swagger
 * /api/auth/request-email-verification:
 *   post:
 *     summary: Demander la vérification d'email
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email de vérification envoyé
 *       400:
 *         description: Email déjà vérifié
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/request-email-verification', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

 

    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // TODO: Envoyer email avec le token
    // await sendVerificationEmail(user.email, verificationToken);

    res.json({ 
      message: 'Email de vérification envoyé',
      // En développement, retourner le token pour tester
      ...(process.env.NODE_ENV === 'development' && { verificationToken })
    });
  } catch (error) {
    console.error('Erreur envoi vérification email:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Vérifier l'email avec un token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de vérification d'email
 *     responses:
 *       200:
 *         description: Email vérifié avec succès
 *       400:
 *         description: Token invalide ou email déjà vérifié
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Token requis' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'email_verification') {
      res.status(400).json({ message: 'Token invalide' });
      return;
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }




    res.json({ 
      message: 'Email vérifié avec succès',
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error: unknown) {
    console.error('Erreur vérification email:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({ message: 'Token invalide ou expiré' });
    } else {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
});

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Demander la réinitialisation de mot de passe
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé (si l'email existe)
 *       400:
 *         description: Email requis
 */
router.post('/request-password-reset', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email requis' });
      return;
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    
    // Pour des raisons de sécurité, on renvoie toujours le même message
    // même si l'utilisateur n'existe pas
    const successMessage = 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé';

    if (!user) {
      res.json({ message: successMessage });
      return;
    }

    const resetToken = jwt.sign(
      { userId: user.getDataValue('id'), type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Envoyer l'email de réinitialisation (non-bloquant)
    sendPasswordResetEmail({
      to: user.getDataValue('email'),
      firstName: user.getDataValue('firstName'),
      token: resetToken,
    }).catch(err => console.error('Erreur envoi email reset password:', err));

    res.json({ 
      message: successMessage,
      // En développement, retourner le token pour tester
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Erreur demande reset password:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe avec un token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de réinitialisation
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Nouveau mot de passe
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou mot de passe trop court
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token et nouveau mot de passe requis' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'password_reset') {
      res.status(400).json({ message: 'Token invalide' });
      return;
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    // Le hook beforeUpdate va automatiquement hasher le nouveau mot de passe
    await user.update({ password: newPassword });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error: unknown) {
    console.error('Erreur reset password:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).json({ message: 'Token invalide ou expiré' });
    } else {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
});

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Rafraîchir le token JWT
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Nouveau token JWT
 *                 user:
 *                   type: object
 *                   description: Informations utilisateur mises à jour
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/refresh-token', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    const newToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ 
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Authentification via Google OAuth
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirection vers Google pour l'authentification
 */
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback Google OAuth
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirection vers le dashboard avec le token
 */
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
    session: false 
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
        return;
      }

      // Récupérer l'ID de l'utilisateur (Sequelize peut retourner l'objet différemment)
      const userId = user.id || user.dataValues?.id || user.get?.('id') || user.getDataValue?.('id');
      
      if (!userId) {
        console.error('Impossible de récupérer l\'ID utilisateur');
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=no_user_id`);
        return;
      }

      // Générer un token JWT
      const token = generateToken(userId);

      // Rediriger vers le frontend avec le token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Erreur Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=server_error`);
    }
  }
);

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     summary: Authentification via Facebook OAuth
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirection vers Facebook pour l'authentification
 */
router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['email'] 
  })
);

/**
 * @swagger
 * /api/auth/facebook/callback:
 *   get:
 *     summary: Callback Facebook OAuth
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirection vers le dashboard avec le token
 */
router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
    session: false 
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
        return;
      }

      // Récupérer l'ID de l'utilisateur (Sequelize peut retourner l'objet différemment)
      const userId = user.id || user.dataValues?.id || user.get?.('id') || user.getDataValue?.('id');
      
      if (!userId) {
        console.error('Impossible de récupérer l\'ID utilisateur Facebook');
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=no_user_id`);
        return;
      }

      // Générer un token JWT
      const token = generateToken(userId);

      // Rediriger vers le frontend avec le token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Erreur Facebook callback:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=server_error`);
    }
  }
);

/**
 * POST /auth/set-password
 * Valide le token de création de compte et enregistre le mot de passe choisi.
 */
router.post('/set-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token et mot de passe requis' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
      return;
    }

    // Le hook beforeUpdate du modèle User hashe automatiquement le password
    await user.update({ password, resetToken: undefined, resetTokenExpiry: undefined });

    const userId = user.getDataValue('id');
    const jwtToken = generateToken(userId);

    res.json({ success: true, message: 'Mot de passe défini avec succès', token: jwtToken });
  } catch (error) {
    console.error('POST /auth/set-password error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;