/**
 * Script pour exécuter les migrations de performance
 */
import { addPerformanceIndexes } from './migrations/001-add-performance-indexes.js';
import sequelize from './config/db.js';

const runMigration = async () => {
  try {
    console.log('🚀 Démarrage de la migration des index de performance...');
    
    await addPerformanceIndexes(sequelize.getQueryInterface(), sequelize);
    
    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Exécuter la migration si ce fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;