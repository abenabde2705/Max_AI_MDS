import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { sequelize } from '../models/index.js';

// Configuration globale pour les tests
beforeAll(async () => {
  // Synchroniser la base de données pour les tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Nettoyer après tous les tests
  await sequelize.close();
});

// Nettoyer entre chaque test
afterEach(async () => {
  try {
    // Supprimer toutes les données de test
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  } catch {
    // Si truncate échoue, essayer de supprimer manuellement
    const { User, Conversation, Message } = await import('../models/index.js');
    await Message.destroy({ where: {}, force: true });
    await Conversation.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  }
});