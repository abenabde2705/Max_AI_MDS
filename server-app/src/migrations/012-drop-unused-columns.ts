/**
 * Migration 012 — Supprimer les colonnes inutilisées de la table users
 * Colonnes supprimées : is_anonymous, pseudonym, age, facebook_id
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const dropUnusedColumns = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Suppression des colonnes inutilisées sur users...');

      const tableDesc = await queryInterface.describeTable('users');

      if (tableDesc['is_anonymous']) {
        await queryInterface.removeColumn('users', 'is_anonymous', { transaction } as any);
        console.log('✅ Colonne is_anonymous supprimée');
      }
      if (tableDesc['pseudonym']) {
        await queryInterface.removeColumn('users', 'pseudonym', { transaction } as any);
        console.log('✅ Colonne pseudonym supprimée');
      }
      if (tableDesc['age']) {
        await queryInterface.removeColumn('users', 'age', { transaction } as any);
        console.log('✅ Colonne age supprimée');
      }
      if (tableDesc['facebook_id']) {
        await queryInterface.removeColumn('users', 'facebook_id', { transaction } as any);
        console.log('✅ Colonne facebook_id supprimée');
      }

      console.log('✅ Migration 012 terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la migration 012:', error);
      throw error;
    }
  });
};

const revertDropUnusedColumns = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      await queryInterface.addColumn('users', 'is_anonymous', { type: DataTypes.BOOLEAN, defaultValue: false }, { transaction } as any);
      await queryInterface.addColumn('users', 'pseudonym', { type: DataTypes.STRING(100), allowNull: true }, { transaction } as any);
      await queryInterface.addColumn('users', 'age', { type: DataTypes.INTEGER, allowNull: true }, { transaction } as any);
      await queryInterface.addColumn('users', 'facebook_id', { type: DataTypes.STRING, allowNull: true }, { transaction } as any);
      console.log('✅ Revert migration 012 effectué');
    } catch (error) {
      console.error('❌ Erreur lors du revert 012:', error);
      throw error;
    }
  });
};

export { dropUnusedColumns as up, revertDropUnusedColumns as down };
