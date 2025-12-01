/**
 * Script pour exécuter les migrations de performance
 */
import { addPerformanceIndexes } from './migrations/001-add-performance-indexes.js';
import { sequelize } from './config/db.js';
import { fileURLToPath } from 'node:url';

const runMigration = async (): Promise<void> => {
  try {
    console.log('🚀 Démarrage de la migration des index de performance...');
    
    await addPerformanceIndexes(sequelize.getQueryInterface(), sequelize.constructor as any);
    
    console.log('🎉 Migration terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Exécuter la migration si ce fichier est appelé directement
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runMigration();
}

export default runMigration;