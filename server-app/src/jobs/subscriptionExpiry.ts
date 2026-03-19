/**
 * Job — Désactiver les abonnements dont stripePeriodEnd est dépassé.
 *
 * Stripe envoie normalement customer.subscription.deleted, mais en cas de webhook
 * manqué ce job sert de filet de sécurité. S'exécute toutes les heures.
 */

import { Op } from 'sequelize';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const deactivateExpiredSubscriptions = async (): Promise<void> => {
  const now = new Date();

  const expired = await Subscription.findAll({
    where: {
      status: 'active',
      stripePeriodEnd: { [Op.lt]: now },
    },
  });

  if (expired.length === 0) return;

  for (const sub of expired) {
    const userId = sub.getDataValue('userId');
    await sub.update({ status: 'canceled' });
    await User.update({ isPremium: false }, { where: { id: userId } });
    console.log(`⏰ Abonnement expiré désactivé: userId=${userId}`);
  }

  console.log(`⏰ ${expired.length} abonnement(s) expiré(s) désactivé(s)`);
};

const INTERVAL_MS = 60 * 60 * 1000; // 1 heure

export const startSubscriptionExpiryJob = (): void => {
  // Exécution immédiate au démarrage, puis toutes les heures
  deactivateExpiredSubscriptions().catch(err =>
    console.error('Erreur job expiration abonnements:', err)
  );

  setInterval(() => {
    deactivateExpiredSubscriptions().catch(err =>
      console.error('Erreur job expiration abonnements:', err)
    );
  }, INTERVAL_MS);

  console.log('⏰ Job d\'expiration des abonnements démarré (intervalle: 1h)');
};
