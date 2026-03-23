import { Sequelize } from 'sequelize';

// Configuration TypeScript pour Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'maxai',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      // Éviter la pluralisation automatique des noms de tables
      freezeTableName: true
    }
  }
);

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully');
    
    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development',
      force: false // Ne jamais forcer la recréation en production
    });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default sequelize;