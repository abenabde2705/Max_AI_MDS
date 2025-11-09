import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const Message = sequelize.define('Message', {
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
  sender: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: {
        args: [['user', 'ai']],
        msg: 'Le sender doit être "user" ou "ai"'
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  emotion_detected: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'messages',
  timestamps: false
});

export default Message;