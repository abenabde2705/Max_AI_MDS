import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import type { EmotionalJournalAttributes } from '../../types/global.js';

// Type pour les attributs optionnels lors de la création
type EmotionalJournalCreationAttributes = Optional<EmotionalJournalAttributes, 'id' | 'conversationId' | 'globalEmotion' | 'mood' | 'description' | 'tags'>;

// Classe du modèle EmotionalJournal avec tous les types
class EmotionalJournal extends Model<EmotionalJournalAttributes, EmotionalJournalCreationAttributes> implements EmotionalJournalAttributes {
  public id!: string;
  public conversationId?: string;
  public userId!: string;
  public globalEmotion?: Record<string, any>;
  public dateLogged!: Date;
  public mood?: string;
  public description?: string;
  public tags?: string[];
}

// Initialisation du modèle
EmotionalJournal.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'conversation_id',
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  globalEmotion: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'global_emotion',
    comment: 'Pourcentage des émotions ressenties pendant une conversation'
  },
  dateLogged: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_logged'
  },
  mood: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  }
}, {
  sequelize,
  tableName: 'emotional_journal',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['conversation_id']
    },
    {
      fields: ['date_logged']
    }
  ]
});

export default EmotionalJournal;