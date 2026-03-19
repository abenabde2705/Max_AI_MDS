/**
 * Migration 010 — Créer la table stripe_webhook_events (déduplication des webhooks Stripe)
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  try {
    console.log('🔧 Création de la table stripe_webhook_events...');

    await queryInterface.createTable('stripe_webhook_events', {
      event_id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    console.log('✅ Table stripe_webhook_events créée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création de stripe_webhook_events:', error);
    throw error;
  }
};

export const down = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.dropTable('stripe_webhook_events');
};
