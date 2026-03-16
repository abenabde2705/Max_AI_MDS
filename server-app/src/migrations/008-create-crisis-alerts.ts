/**
 * Migration 008 — Créer la table crisis_alerts
 */
import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const createCrisisAlerts = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Création de la table crisis_alerts...');

      await queryInterface.createTable('crisis_alerts', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
        },
        message_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'messages', key: 'id' },
          onDelete: 'CASCADE'
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE'
        },
        severity: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'moderate'
        },
        status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'unread'
        },
        detected_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        resolved_at: {
          type: DataTypes.DATE,
          allowNull: true
        },
        resolved_by: {
          type: DataTypes.UUID,
          allowNull: true
        }
      }, { transaction } as any);

      await queryInterface.addIndex('crisis_alerts', ['user_id'], { transaction } as any);
      await queryInterface.addIndex('crisis_alerts', ['status'], { transaction } as any);

      console.log('✅ Table crisis_alerts créée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création de crisis_alerts:', error);
      throw error;
    }
  });
};

const revertCrisisAlerts = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      await queryInterface.dropTable('crisis_alerts', { transaction } as any);
    } catch (error) {
      throw error;
    }
  });
};

export { createCrisisAlerts as up, revertCrisisAlerts as down };
