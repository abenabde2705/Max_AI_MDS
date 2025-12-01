import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { UserAttributes } from '../../types/global.js';

// Interface pour les attributs optionnels lors de la création
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'firstName' | 'lastName' | 'age' | 'lastLogin' | 'pseudonym'> {}

// Classe du modèle User avec tous les types
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password?: string;
  public isAnonymous!: boolean;
  public pseudonym?: string;
  public isPremium!: boolean;
  public firstName?: string;
  public lastName?: string;
  public age?: number;
  public lastLogin?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthodes d'instance avec types
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      if (!this.password) {
        throw new Error('Aucun mot de passe défini pour cet utilisateur');
      }
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
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
    allowNull: false,
    field: 'password_hash',
    validate: {
      len: {
        args: [6, 255],
        msg: 'Le mot de passe doit contenir au moins 6 caractères'
      }
    }
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_anonymous'
  },
  pseudonym: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_premium'
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [13],
        msg: 'Vous devez avoir au moins 13 ans'
      },
      max: {
        args: [120],
        msg: 'Âge invalide'
      }
    }
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  }
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        user.password = hashedPassword;
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password') && user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        user.password = hashedPassword;
      }
    }
  }
});

export default User;