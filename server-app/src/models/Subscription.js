import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['active', 'canceled']],
        msg: 'Le statut doit être "active" ou "canceled"'
      }
    }
  },
  start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'subscriptions',
  timestamps: false
});

export default Subscription;