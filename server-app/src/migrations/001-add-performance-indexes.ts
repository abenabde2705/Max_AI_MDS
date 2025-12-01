/**
 * Migration pour ajouter des index de performance
 * Date: 2025-10-16
 * Description: Optimisation des requêtes avec des index sur les colonnes fréquemment utilisées
 */

import { QueryInterface, DataTypes, Transaction } from 'sequelize';

const addPerformanceIndexes = async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🔧 Ajout des index de performance...');

      // Index sur user_id pour les conversations (requêtes fréquentes par utilisateur)
      await queryInterface.addIndex('conversations', ['user_id'], {
        name: 'idx_conversations_user_id',
        transaction
      });

      // Index sur started_at pour le tri chronologique
      await queryInterface.addIndex('conversations', ['started_at'], {
        name: 'idx_conversations_started_at',
        transaction
      });

      // Index composite user_id + started_at pour les requêtes combinées
      await queryInterface.addIndex('conversations', ['user_id', 'started_at'], {
        name: 'idx_conversations_user_started',
        transaction
      });

      // Index sur conversation_id pour les messages (JOIN fréquent)
      await queryInterface.addIndex('messages', ['conversation_id'], {
        name: 'idx_messages_conversation_id',
        transaction
      });

      // Index sur sent_at pour le tri chronologique des messages
      await queryInterface.addIndex('messages', ['sent_at'], {
        name: 'idx_messages_sent_at',
        transaction
      });

      // Index composite conversation_id + sent_at pour les requêtes de messages ordonnés
      await queryInterface.addIndex('messages', ['conversation_id', 'sent_at'], {
        name: 'idx_messages_conv_sent',
        transaction
      });

      // Index sur sender pour filtrer par type de message
      await queryInterface.addIndex('messages', ['sender'], {
        name: 'idx_messages_sender',
        transaction
      });

      console.log('✅ Index de performance ajoutés avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout des index:', error);
      throw error;
    }
  });
};

const removePerformanceIndexes = async (queryInterface: QueryInterface, Sequelize: typeof DataTypes): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction: Transaction) => {
    try {
      console.log('🗑️ Suppression des index de performance...');

      // Supprimer tous les index ajoutés
      const indexes: string[] = [
        'idx_conversations_user_id',
        'idx_conversations_started_at',
        'idx_conversations_user_started',
        'idx_messages_conversation_id',
        'idx_messages_sent_at',
        'idx_messages_conv_sent',
        'idx_messages_sender'
      ];

      for (const indexName of indexes) {
        try {
          await queryInterface.removeIndex('conversations', indexName, { transaction });
        } catch (error) {
          // Ignorer si l'index n'existe pas
        }
        try {
          await queryInterface.removeIndex('messages', indexName, { transaction });
        } catch (error) {
          // Ignorer si l'index n'existe pas
        }
      }

      console.log('✅ Index de performance supprimés');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des index:', error);
      throw error;
    }
  });
};

export { addPerformanceIndexes, removePerformanceIndexes };
export { addPerformanceIndexes as up, removePerformanceIndexes as down };