import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';

interface JWTPayload {
    id: string;
    iat?: number;
    exp?: number;
}

// Fonction pour générer un token JWT
export const generateToken = (userId: string): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET non configuré');
    }
    
    // Cast en any pour contourner les problèmes de types JWT
    return (jwt as any).sign(
        { id: userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

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
            id: user.id,
            email: user.email,
            username: user.pseudonym || '',
            firstname: user.firstName,
            lastname: user.lastName,
            is_premium: user.isPremium
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
        const token = authHeader?.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

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
                id: user.id,
                email: user.email,
                username: user.pseudonym || '',
                firstname: user.firstName,
                lastname: user.lastName,
                is_premium: user.isPremium
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