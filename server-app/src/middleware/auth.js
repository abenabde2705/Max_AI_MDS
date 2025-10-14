import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Middleware pour vérifier le token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur introuvable' 
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Token invalide' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: 'Token expiré' 
      });
    }
    
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur lors de l\'authentification' 
    });
  }
};

// Middleware pour vérifier le rôle admin
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ 
      message: 'Accès réservé aux administrateurs' 
    });
  }
};

// Fonction utilitaire pour générer un token JWT
export const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};