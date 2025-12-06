import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import type { SubscriptionAttributes } from '../../types/global.js';

// Interface pour les attributs optionnels lors de la création
interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'endDate'> {}

// Classe du modèle Subscription avec tous les types
class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: string;
  public userId!: string;
  public status!: 'active' | 'canceled';
  public startDate!: Date;
  public endDate?: Date;
}

// Initialisation du modèle
Subscription.init({
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
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  }
}, {
  sequelize,
  tableName: 'subscriptions',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default Subscription;