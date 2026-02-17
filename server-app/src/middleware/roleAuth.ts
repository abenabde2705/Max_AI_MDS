import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour vérifier les rôles d'utilisateur
 */

export const requireRole = (_allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({
        message: 'Authentification requise'
      });
      return;
    }

    // TODO: Système de rôles désactivé temporairement
    // Tous les utilisateurs authentifiés ont accès
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

    // TODO: Système de rôles désactivé - vérifier uniquement la propriété
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