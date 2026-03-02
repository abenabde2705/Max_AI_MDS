/**
 * Migration 005 — Étendre la table subscriptions
 * Ajoute : plan, stripe_customer_id, stripe_subscription_id, stripe_period_end
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const extendSubscriptions = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Extension de la table subscriptions...');

      await queryInterface.addColumn('subscriptions', 'plan', {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'premium'
      }, { transaction } as any);

      await queryInterface.addColumn('subscriptions', 'stripe_customer_id', {
        type: DataTypes.STRING(255),
        allowNull: true
      }, { transaction } as any);

      await queryInterface.addColumn('subscriptions', 'stripe_subscription_id', {
        type: DataTypes.STRING(255),
        allowNull: true
      }, { transaction } as any);

      await queryInterface.addColumn('subscriptions', 'stripe_period_end', {
        type: DataTypes.DATE,
        allowNull: true
      }, { transaction } as any);

      // Contrainte CHECK sur plan
      await queryInterface.sequelize.query(
        'ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN (\'premium\', \'student\'))',
        { transaction }
      );

      console.log('✅ Table subscriptions étendue avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'extension de subscriptions:', error);
      throw error;
    }
  });
};

const revertExtendSubscriptions = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🗑️ Revert extension subscriptions...');

      await queryInterface.sequelize.query(
        'ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check',
        { transaction }
      );

      await queryInterface.removeColumn('subscriptions', 'stripe_period_end', { transaction } as any);
      await queryInterface.removeColumn('subscriptions', 'stripe_subscription_id', { transaction } as any);
      await queryInterface.removeColumn('subscriptions', 'stripe_customer_id', { transaction } as any);
      await queryInterface.removeColumn('subscriptions', 'plan', { transaction } as any);

      console.log('✅ Revert effectué');
    } catch (error) {
      console.error('❌ Erreur lors du revert:', error);
      throw error;
    }
  });
};

export { extendSubscriptions as up, revertExtendSubscriptions as down };
