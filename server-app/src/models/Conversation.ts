import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import type { ConversationAttributes } from '../../types/global.js';

// Interface pour les attributs optionnels lors de la création
interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'createdAt' | 'updatedAt' | 'emotionalContext'> {}

// Classe du modèle Conversation avec tous les types
class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public isArchived!: boolean;
  public emotionalContext?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle
Conversation.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Nouvelle conversation'
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_archived'
  },
  emotionalContext: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'emotional_context'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Conversation;