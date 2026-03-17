/**
 * Migration 006 — Créer la table student_verifications
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const createStudentVerifications = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Création de la table student_verifications...');

      await queryInterface.createTable('student_verifications', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'pending'
        },
        card_image_path: {
          type: DataTypes.STRING(500),
          allowNull: false
        },
        submitted_at: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW
        },
        reviewed_at: {
          type: DataTypes.DATE,
          allowNull: true
        },
        reviewed_by: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' }
        },
        rejection_reason: {
          type: DataTypes.TEXT,
          allowNull: true
        }
      }, { transaction } as any);

      await queryInterface.sequelize.query(
        'ALTER TABLE student_verifications ADD CONSTRAINT student_verifications_status_check CHECK (status IN (\'pending\', \'approved\', \'rejected\'))',
        { transaction }
      );

      await queryInterface.addIndex('student_verifications', ['user_id'], { transaction } as any);
      await queryInterface.addIndex('student_verifications', ['status'], { transaction } as any);

      console.log('✅ Table student_verifications crée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création de student_verifications:', error);
      throw error;
    }
  });
};

const revertCreateStudentVerifications = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🗑️ Suppression de la table student_verifications...');
      await queryInterface.dropTable('student_verifications', { transaction } as any);
      console.log('✅ Revert effectué');
    } catch (error) {
      console.error('❌ Erreur lors du revert:', error);
      throw error;
    }
  });
};

export { createStudentVerifications as up, revertCreateStudentVerifications as down };
