import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { UserAttributes } from '../../types/global.js';

// Type pour les attributs optionnels lors de la création
type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'firstName' | 'lastName' | 'birthDate' | 'lastLogin' | 'role' | 'stripeCustomerId' | 'resetToken' | 'resetTokenExpiry'>;

// Classe du modèle User avec tous les types
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password?: string;
  public isPremium!: boolean;
  public role!: 'user' | 'admin';
  public stripeCustomerId?: string;
  public firstName?: string;
  public lastName?: string;
  public birthDate?: string;
  public googleId?: string;
  public lastLogin?: Date;
  public resetToken?: string;
  public resetTokenExpiry?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthodes d'instance avec types
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      // Accéder au password_hash directement depuis la base de données
      const hashedPassword = this.getDataValue('password') || this.dataValues.password;
      
      if (!hashedPassword) {
        console.error('Aucun hash trouvé pour utilisateur:', this.email);
        throw new Error('Aucun mot de passe défini pour cet utilisateur');
      }
      
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      console.error('Erreur dans comparePassword:', error);
      throw new Error('Erreur lors de la vérification du mot de passe');
    }
  }

  public toJSON(): Omit<UserAttributes, 'password'> {
    const values = { ...this.get() } as UserAttributes;
    delete values.password;
    return values;
  }
}

// Initialisation du modèle
User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Format d\'email invalide'
      }
    }
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'password_hash',

  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'admin']],
        msg: 'Le rôle doit être "user" ou "admin"'
      }
    }
  },
  stripeCustomerId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_customer_id'
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'birth_date',
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'google_id',
    unique: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'reset_token',
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_token_expiry',
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user: User) => {
      // Hasher le mot de passe avant création
      const password = user.getDataValue('password') || user.dataValues.password;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        user.setDataValue('password', hashedPassword);
      }
    },
    beforeUpdate: async (user: User) => {
      // Hasher le mot de passe avant mise à jour s'il a changé
      if (user.changed('password')) {
        const password = user.getDataValue('password');
        if (password) {
          const hashedPassword = await bcrypt.hash(password, 12);
          user.setDataValue('password', hashedPassword);
        }
      }
    }
  }
});

export default User;