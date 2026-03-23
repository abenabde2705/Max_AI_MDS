/**
 * Migration 007 — Ajouter role et stripe_customer_id sur la table users
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const addUserRoleAndStripe = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Ajout de role et stripe_customer_id sur users...');

      await queryInterface.addColumn('users', 'role', {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'user'
      }, { transaction } as any);

      await queryInterface.addColumn('users', 'stripe_customer_id', {
        type: DataTypes.STRING(255),
        allowNull: true
      }, { transaction } as any);

      await queryInterface.sequelize.query(
        'ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (\'user\', \'admin\'))',
        { transaction }
      );

      await queryInterface.addIndex('users', ['role'], { transaction } as any);

      console.log('✅ Colonnes role et stripe_customer_id ajoutées sur users');
    } catch (error) {
      console.error('❌ Erreur lors de la migration 007:', error);
      throw error;
    }
  });
};

const revertAddUserRoleAndStripe = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🗑️ Revert migration 007...');

      await queryInterface.sequelize.query(
        'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check',
        { transaction }
      );

      await queryInterface.removeColumn('users', 'stripe_customer_id', { transaction } as any);
      await queryInterface.removeColumn('users', 'role', { transaction } as any);

      console.log('✅ Revert effectué');
    } catch (error) {
      console.error('❌ Erreur lors du revert:', error);
      throw error;
    }
  });
};

export { addUserRoleAndStripe as up, revertAddUserRoleAndStripe as down };
