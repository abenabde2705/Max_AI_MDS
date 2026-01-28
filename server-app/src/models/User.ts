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
  public googleId?: string;
  public facebookId?: string;
  public lastLogin?: Date;
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
      
      console.log('Comparing password with hash:', hashedPassword.substring(0, 20) + '...');
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
    validate: {
      len: {
        args: [6, 255],
        msg: 'Le mot de passe doit contenir au moins 6 caractères'
      },
      isValidPassword(value: string | null) {
        // Valider seulement si un password est fourni et que ce n'est pas un compte OAuth
        if (!value && !this.googleId && !this.facebookId && !this.isAnonymous) {
          throw new Error('Le mot de passe est requis pour les comptes non-OAuth');
        }
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
      isValidAge(value: number | null | undefined) {
        // Valider seulement si une valeur est fournie
        if (value !== null && value !== undefined) {
          if (value < 13) {
            throw new Error('Vous devez avoir au moins 13 ans');
          }
          if (value > 120) {
            throw new Error('Âge invalide');
          }
        }
      }
    }
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'google_id',
    unique: true
  },
  facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'facebook_id',
    unique: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
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
        console.log('Hashing password for new user:', user.email);
        const hashedPassword = await bcrypt.hash(password, 12);
        user.setDataValue('password', hashedPassword);
      }
    },
    beforeUpdate: async (user: User) => {
      // Hasher le mot de passe avant mise à jour s'il a changé
      if (user.changed('password')) {
        const password = user.getDataValue('password');
        if (password) {
          console.log('Hashing password for user update:', user.email);
          const hashedPassword = await bcrypt.hash(password, 12);
          user.setDataValue('password', hashedPassword);
        }
      }
    }
  }
});

export default User;