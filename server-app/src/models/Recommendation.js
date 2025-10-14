import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const Recommendation = sequelize.define('Recommendation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['video', 'article', 'exercise', 'professionnel de santé']],
        msg: 'Le type doit être: video, article, exercise ou professionnel de santé'
      }
    }
  }
}, {
  tableName: 'recommendations',
  timestamps: false
});

export default Recommendation;