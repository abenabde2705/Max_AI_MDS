import express, { Request, Response } from 'express';
import User from '../models/User.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

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

    // Générer un token JWT
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age
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
      where: { email: email.toLowerCase() } 
    });
    
    if (!user) {
      res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // Mettre à jour la date de dernière connexion
    await user.update({ lastLogin: new Date() });

    // Générer un token JWT
    const token = generateToken(user.id);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        isPremium: user.isPremium
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

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      res.status(404).json({
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
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
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email.toLowerCase();

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

export default router;