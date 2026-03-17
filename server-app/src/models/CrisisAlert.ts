import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

interface CrisisAlertAttributes {
  id: string;
  messageId: string;
  userId: string;
  severity: 'urgent' | 'moderate';
  status: 'unread' | 'resolved';
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

type CrisisAlertCreationAttributes = Optional<CrisisAlertAttributes, 'id' | 'resolvedAt' | 'resolvedBy'>;

class CrisisAlert extends Model<CrisisAlertAttributes, CrisisAlertCreationAttributes> implements CrisisAlertAttributes {
  public id!: string;
  public messageId!: string;
  public userId!: string;
  public severity!: 'urgent' | 'moderate';
  public status!: 'unread' | 'resolved';
  public detectedAt!: Date;
  public resolvedAt?: Date;
  public resolvedBy?: string;
}

CrisisAlert.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'message_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  severity: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'moderate'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unread'
  },
  detectedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'detected_at'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'resolved_by'
  }
}, {
  sequelize,
  tableName: 'crisis_alerts',
  timestamps: false
});

export default CrisisAlert;
