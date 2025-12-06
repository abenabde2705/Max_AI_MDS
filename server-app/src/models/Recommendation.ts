import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import type { RecommendationAttributes } from '../../types/global.js';

// Interface pour les attributs optionnels lors de la création
interface RecommendationCreationAttributes extends Optional<RecommendationAttributes, 'id' | 'description'> {}

// Classe du modèle Recommendation avec tous les types
class Recommendation extends Model<RecommendationAttributes, RecommendationCreationAttributes> implements RecommendationAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public type!: 'video' | 'article' | 'exercise' | 'professionnel de santé';
}

// Initialisation du modèle
Recommendation.init({
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
  sequelize,
  tableName: 'recommendations',
  timestamps: false,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['name']
    }
  ]
});

export default Recommendation;