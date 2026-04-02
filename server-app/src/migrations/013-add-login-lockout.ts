/**
 * Migration 013 — Ajouter failed_login_attempts et locked_until sur la table users
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const up = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Ajout de failed_login_attempts et locked_until sur users...');

      await queryInterface.addColumn('users', 'failed_login_attempts', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }, { transaction } as any);

      await queryInterface.addColumn('users', 'locked_until', {
        type: DataTypes.DATE,
        allowNull: true,
      }, { transaction } as any);

      console.log('✅ Colonnes failed_login_attempts et locked_until ajoutées sur users');
    } catch (error) {
      console.error('❌ Erreur lors de la migration 013:', error);
      throw error;
    }
  });
};

const down = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    await queryInterface.removeColumn('users', 'locked_until', { transaction } as any);
    await queryInterface.removeColumn('users', 'failed_login_attempts', { transaction } as any);
  });
};

export { up, down };
