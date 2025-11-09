import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const EmotionalJournal = sequelize.define('EmotionalJournal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  global_emotion: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Pourcentage des émotions ressenties pendant une conversation'
  },
  date_logged: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'emotional_journal',
  timestamps: false
});

export default EmotionalJournal;