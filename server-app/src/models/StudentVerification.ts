import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import type { StudentVerificationAttributes } from '../../types/global.js';

type StudentVerificationCreationAttributes = Optional<StudentVerificationAttributes, 'id' | 'submittedAt' | 'reviewedAt' | 'reviewedBy' | 'rejectionReason'>;

class StudentVerification extends Model<StudentVerificationAttributes, StudentVerificationCreationAttributes> implements StudentVerificationAttributes {
  public id!: string;
  public userId!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public cardImagePath!: string;
  public submittedAt!: Date;
  public reviewedAt?: Date;
  public reviewedBy?: string;
  public rejectionReason?: string;
}

StudentVerification.init({
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
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'approved', 'rejected']],
        msg: 'Le statut doit être "pending", "approved" ou "rejected"'
      }
    }
  },
  cardImagePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'card_image_path'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'submitted_at'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reviewed_at'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reviewed_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  }
}, {
  sequelize,
  tableName: 'student_verifications',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

export default StudentVerification;
