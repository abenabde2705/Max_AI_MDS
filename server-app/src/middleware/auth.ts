import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Subscription from '../models/Subscription.js';
import { FREE_MESSAGE_LIMIT } from '../config/constants.js';

interface JWTPayload {
    id: string;
    iat?: number;
    exp?: number;
}

// Fonction pour générer un token JWT
export const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const payload = { id: userId };
  const options: jwt.SignOptions = { expiresIn: '24h' };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];

        const token = req.cookies?.jwt_token
            ?? (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

        if (!token) {
            res.status(401).json({ 
                success: false, 
                message: 'Token d\'accès manquant' 
            });
            return;
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET non configuré');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

        const user = await User.findByPk(decoded.id);

        if (!user) {
            res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
            return;
        }

        // Ajouter l'utilisateur à l'objet request
        req.user = {
            id: user.getDataValue('id'),
            email: user.getDataValue('email'),
            username: '',
            firstname: user.getDataValue('firstName'),
            lastname: user.getDataValue('lastName'),
            is_premium: user.getDataValue('isPremium'),
            role: user.getDataValue('role') || 'user'
        };

        next();
    } catch (error: unknown) {
        console.error('Erreur d\'authentification:', error);
        
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ 
                success: false, 
                message: 'Token invalide' 
            });
            return;
        }
        
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ 
                success: false, 
                message: 'Token expiré' 
            });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: 'Erreur interne du serveur' 
        });
    }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = req.cookies?.jwt_token
            ?? (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

        if (!token) {
            // Pas de token, on continue sans authentification
            next();
            return;
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET non configuré');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
        
        const user = await User.findByPk(decoded.id);
        if (user) {
            req.user = {
                id: user.getDataValue('id'),
                email: user.getDataValue('email'),
                username: '',
                firstname: user.getDataValue('firstName'),
                lastname: user.getDataValue('lastName'),
                is_premium: user.getDataValue('isPremium'),
                role: user.getDataValue('role') || 'user'
            };
        }

        next();
    } catch (error: unknown) {
        // En cas d'erreur avec l'auth optionnelle, on continue sans utilisateur
        console.warn('Erreur d\'authentification optionnelle:', error);
        next();
    }
};

// Middleware pour vérifier le statut premium
export const requirePremium = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ 
            success: false, 
            message: 'Authentification requise' 
        });
        return;
    }

    if (!req.user.is_premium) {
        res.status(403).json({ 
            success: false, 
            message: 'Accès premium requis' 
        });
        return;
    }

    next();
};

// Middleware pour vérifier la limite de messages du plan gratuit
export const checkMessageLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ce middleware ne s'applique qu'aux messages envoyés par l'utilisateur.
    // On skip uniquement si sender est explicitement 'ai'.
    // Si sender est absent (ex: /api/chat), on applique le check.
    if (req.body.sender === 'ai') {
        next();
        return;
    }

    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentification requise' });
        return;
    }

    // Les utilisateurs premium ne sont pas limités
    if (req.user.is_premium) {
        next();
        return;
    }

    try {
        // Vérifier si l'utilisateur a un abonnement actif
        const activeSubscription = await Subscription.findOne({
            where: {
                userId: req.user.id,
                status: 'active'
            }
        });

        if (activeSubscription) {
            next();
            return;
        }

        // Compter uniquement les messages d'aujourd'hui (reset quotidien implicite)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const conversations = await Conversation.findAll({
            where: { userId: req.user.id },
            attributes: ['id']
        });

        const conversationIds = conversations.map(c => c.getDataValue('id'));

        const messageCount = conversationIds.length === 0 ? 0 : await Message.count({
            where: {
                conversationId: { [Op.in]: conversationIds },
                sender: 'user',
                sentAt: { [Op.gte]: startOfDay }
            }
        });

        if (messageCount >= FREE_MESSAGE_LIMIT) {
            res.status(403).json({
                success: false,
                error: 'MESSAGE_LIMIT_REACHED',
                message: `Vous avez atteint la limite de ${FREE_MESSAGE_LIMIT} messages du plan gratuit. Passez au plan Premium pour continuer.`,
                used: messageCount,
                limit: FREE_MESSAGE_LIMIT
            });
            return;
        }

        next();
    } catch (error: unknown) {
        console.error('Erreur lors de la vérification de la limite de messages:', error);
        res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
    }
};

// Middleware pour vérifier que l'utilisateur peut accéder à ses propres ressources
export const requireOwnership = (param: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ 
                success: false, 
                message: 'Authentification requise' 
            });
            return;
        }

        const resourceUserId = req.params[param] || req.body[param];
        
        if (!resourceUserId) {
            res.status(400).json({ 
                success: false, 
                message: `Paramètre ${param} manquant` 
            });
            return;
        }

        if (req.user.id !== resourceUserId) {
            res.status(403).json({ 
                success: false, 
                message: 'Accès non autorisé à cette ressource' 
            });
            return;
        }

        next();
    };
};