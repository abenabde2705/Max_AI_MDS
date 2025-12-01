import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour vérifier les rôles d'utilisateur
 */

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({
        message: 'Authentification requise'
      });
      return;
    }

    // Vérifier le rôle
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Accès refusé : permissions insuffisantes',
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware spécifiques pour chaque rôle
 */

export const requireAdmin = requireRole(['admin']);
export const requireAdminOrModerator = requireRole(['admin', 'moderator']);
export const requireUser = requireRole(['user', 'admin', 'moderator']);

/**
 * Middleware pour vérifier si l'utilisateur peut accéder à ses propres données ou s'il est admin
 */
export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        message: 'Authentification requise'
      });
      return;
    }

    // Les admins ont accès à tout
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Vérifier si l'utilisateur accède à ses propres données
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.id !== resourceUserId) {
      res.status(403).json({
        message: 'Accès refusé : vous ne pouvez accéder qu\'à vos propres données'
      });
      return;
    }

    next();
  };
};