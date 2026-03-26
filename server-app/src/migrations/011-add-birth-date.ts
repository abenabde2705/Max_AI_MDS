/**
 * Migration 011 — Ajouter birth_date sur la table users
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const addBirthDate = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Ajout de birth_date sur users...');

      await queryInterface.addColumn('users', 'birth_date', {
        type: DataTypes.DATEONLY,
        allowNull: true,
      }, { transaction } as any);

      console.log('✅ Colonne birth_date ajoutée sur users');
    } catch (error) {
      console.error('❌ Erreur lors de la migration 011:', error);
      throw error;
    }
  });
};

const revertAddBirthDate = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      await queryInterface.removeColumn('users', 'birth_date', { transaction } as any);
      console.log('✅ Revert migration 011 effectué');
    } catch (error) {
      console.error('❌ Erreur lors du revert 011:', error);
      throw error;
    }
  });
};

export { addBirthDate as up, revertAddBirthDate as down };
