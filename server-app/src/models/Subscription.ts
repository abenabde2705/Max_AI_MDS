import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import type { SubscriptionAttributes } from '../../types/global.js';

// Type pour les attributs optionnels lors de la création
type SubscriptionCreationAttributes = Optional<SubscriptionAttributes, 'id'>;

// Classe du modèle Subscription avec tous les types
class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: string;
  public userId!: string;
  public plan!: 'premium' | 'student';
  public status!: 'active' | 'canceled' | 'disputed';
  public startDate!: Date;
  public endDate?: Date;
  public stripeCustomerId?: string;
  public stripeSubscriptionId?: string;
  public stripePeriodEnd?: Date;
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
  plan: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'premium',
    field: 'plan',
    validate: {
      isIn: {
        args: [['premium', 'student']],
        msg: 'Le plan doit être "premium" ou "student"'
      }
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['active', 'canceled', 'disputed']],
        msg: 'Le statut doit être "active", "canceled" ou "disputed"'
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
  },
  stripeCustomerId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_customer_id'
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_subscription_id'
  },
  stripePeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'stripe_period_end'
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