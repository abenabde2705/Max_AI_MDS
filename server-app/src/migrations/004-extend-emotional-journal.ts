/**
 * Migration pour étendre la table emotional_journal
 * Date: 2026-02-27
 * Description: Rend conversation_id nullable + ajoute mood, description, tags
 *              pour permettre les entrées manuelles sans conversation associée.
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const extendEmotionalJournal = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Extension de la table emotional_journal...');

      // Rendre conversation_id nullable (entrées manuelles sans conversation)
      await queryInterface.changeColumn('emotional_journal', 'conversation_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'conversations',
          key: 'id'
        }
      }, { transaction } as any);

      // Ajouter la colonne mood
      await queryInterface.addColumn('emotional_journal', 'mood', {
        type: DataTypes.STRING(20),
        allowNull: true
      }, { transaction } as any);

      // Ajouter la colonne description
      await queryInterface.addColumn('emotional_journal', 'description', {
        type: DataTypes.TEXT,
        allowNull: true
      }, { transaction } as any);

      // Ajouter la colonne tags (JSONB)
      await queryInterface.addColumn('emotional_journal', 'tags', {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
      }, { transaction } as any);

      console.log('✅ Table emotional_journal étendue avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'extension de la table:', error);
      throw error;
    }
  });
};

const revertExtendEmotionalJournal = async (queryInterface: QueryInterface, _Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🗑️ Revert de l\'extension emotional_journal...');

      await queryInterface.removeColumn('emotional_journal', 'mood', { transaction } as any);
      await queryInterface.removeColumn('emotional_journal', 'description', { transaction } as any);
      await queryInterface.removeColumn('emotional_journal', 'tags', { transaction } as any);

      // Remettre conversation_id non-nullable
      await queryInterface.changeColumn('emotional_journal', 'conversation_id', {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        }
      }, { transaction } as any);

      console.log('✅ Revert effectué');
    } catch (error) {
      console.error('❌ Erreur lors du revert:', error);
      throw error;
    }
  });
};

export { extendEmotionalJournal as up, revertExtendEmotionalJournal as down };
