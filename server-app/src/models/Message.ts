import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import type { MessageAttributes } from '../../types/global.js';

// Interface pour les attributs optionnels lors de la création
interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'emotionDetected' | 'sentAt'> {}

// Classe du modèle Message avec tous les types
class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public conversationId!: string;
  public content!: string;
  public sender!: 'user' | 'ai';
  public emotionDetected?: string;
  public sentAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Message.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'conversation_id',
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  sender: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: {
        args: [['user', 'assistant']],
        msg: 'Le sender doit être "user" ou "assistant"'
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  emotionDetected: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'emotion_detected'
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'sent_at',
    defaultValue: DataTypes.NOW
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'sent_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'sent_at'
  }
}, {
  sequelize,
  tableName: 'messages',
  timestamps: true,
  createdAt: 'sent_at',
  updatedAt: 'sent_at'
});

export default Message;