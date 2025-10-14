import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const User = sequelize.define('User', {
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
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Le mot de passe doit contenir au moins 6 caractères'
      }
    }
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pseudonym: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Champs additionnels pour compatibilité avec l'ancien système
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
        args: 13,
        msg: 'Vous devez avoir au moins 13 ans'
      },
      max: {
        args: 120,
        msg: 'Âge invalide'
      }
    }
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    }
  }
});

// Méthodes d'instance
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  } catch (error) {
    throw new Error('Erreur lors de la vérification du mot de passe');
  }
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

export default User;