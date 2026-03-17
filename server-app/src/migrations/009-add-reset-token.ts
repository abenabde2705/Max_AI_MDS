/**
 * Migration 009 — Ajouter reset_token et reset_token_expiry sur la table users
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const up = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Ajout de reset_token et reset_token_expiry sur users...');

      await queryInterface.addColumn('users', 'reset_token', {
        type: DataTypes.STRING(255),
        allowNull: true,
      }, { transaction } as any);

      await queryInterface.addColumn('users', 'reset_token_expiry', {
        type: DataTypes.DATE,
        allowNull: true,
      }, { transaction } as any);

      console.log('✅ Colonnes reset_token et reset_token_expiry ajoutées sur users');
    } catch (error) {
      console.error('❌ Erreur lors de la migration 009:', error);
      throw error;
    }
  });
};

const down = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    await queryInterface.removeColumn('users', 'reset_token_expiry', { transaction } as any);
    await queryInterface.removeColumn('users', 'reset_token', { transaction } as any);
  });
};

export { up, down };
