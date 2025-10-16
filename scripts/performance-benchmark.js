#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'max_ai_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const performanceBenchmarks = [
  {
    name: 'Conversations par utilisateur - Index sur user_id',
    description: 'Test de performance pour récupérer les conversations d\'un utilisateur',
    sql: `SELECT c.*, 
             (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count_check
          FROM conversations c 
          WHERE c.user_id = $1 
          ORDER BY c.started_at DESC 
          LIMIT 20`,
    expectedImprovement: 'Index sur user_id + started_at devrait réduire le temps à <10ms'
  },
  {
    name: 'Messages par conversation - Index sur conversation_id',
    description: 'Test de performance pour récupérer les messages d\'une conversation',
    sql: `SELECT * FROM messages 
          WHERE conversation_id = $1 
          ORDER BY sent_at ASC`,
    expectedImprovement: 'Index sur conversation_id + sent_at devrait réduire le temps à <5ms'
  },
  {
    name: 'Messages récents globaux - Index composé',
    description: 'Test de performance pour récupérer les messages récents de tous les utilisateurs',
    sql: `SELECT m.*, c.user_id, u.email 
          FROM messages m 
          JOIN conversations c ON m.conversation_id = c.id 
          JOIN users u ON c.user_id = u.id 
          WHERE m.sent_at > $1 
          ORDER BY m.sent_at DESC 
          LIMIT 100`,
    expectedImprovement: 'Index sur sent_at devrait permettre un tri rapide'
  },
  {
    name: 'Statistiques utilisateur - Agrégation complexe',
    description: 'Test de performance pour calculer les statistiques d\'un utilisateur',
    sql: `SELECT 
            u.id,
            u.email,
            COUNT(DISTINCT c.id) as total_conversations,
            COUNT(m.id) as total_messages,
            MAX(m.sent_at) as last_activity,
            AVG(EXTRACT(EPOCH FROM (c.ended_at - c.started_at))) as avg_conversation_duration
          FROM users u
          LEFT JOIN conversations c ON u.id = c.user_id
          LEFT JOIN messages m ON c.id = m.conversation_id
          WHERE u.id = $1
          GROUP BY u.id, u.email`,
    expectedImprovement: 'Index combiné user_id + foreign keys devrait optimiser les JOIN'
  },
  {
    name: 'Recherche par contenu - Index de texte',
    description: 'Test de performance pour rechercher dans le contenu des messages',
    sql: `SELECT m.*, c.user_id 
          FROM messages m 
          JOIN conversations c ON m.conversation_id = c.id 
          WHERE m.content ILIKE $1 
          ORDER BY m.sent_at DESC 
          LIMIT 50`,
    expectedImprovement: 'Index GIN sur content devrait accélérer la recherche textuelle'
  }
];

async function runBenchmark(name, sql, params, iterations = 10) {
  const client = await pool.connect();
  const times = [];
  
  try {
    console.log(`\n🔬 Test: ${name}`);
    console.log(`📝 SQL: ${sql.replace(/\s+/g, ' ').trim()}`);
    console.log(`🔄 Itérations: ${iterations}`);
    
    // Warm-up
    await client.query(sql, params);
    
    // Mesures de performance
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      const result = await client.query(sql, params);
      const end = process.hrtime.bigint();
      
      const durationMs = Number(end - start) / 1000000; // Convert nanoseconds to milliseconds
      times.push(durationMs);
      
      if (i === 0) {
        console.log(`📊 Résultats: ${result.rows.length} lignes`);
      }
    }
    
    // Analyse EXPLAIN
    console.log(`\n📈 Plan d'exécution:`);
    const explainResult = await client.query(`EXPLAIN ANALYZE ${sql}`, params);
    explainResult.rows.forEach(row => {
      console.log(`   ${row['QUERY PLAN']}`);
    });
    
  } finally {
    client.release();
  }
  
  return times;
}

async function analyzeResults(benchmarkName, times) {
  const sorted = times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  console.log(`\n⚡ Résultats de performance pour "${benchmarkName}":`);
  console.log(`   📊 Moyenne: ${avg.toFixed(2)}ms`);
  console.log(`   🎯 Médiane: ${median.toFixed(2)}ms`);
  console.log(`   📈 P95: ${p95.toFixed(2)}ms`);
  console.log(`   ⬇️  Min: ${min.toFixed(2)}ms`);
  console.log(`   ⬆️  Max: ${max.toFixed(2)}ms`);
  
  // Classification des performances
  let status;
  if (p95 < 10) status = '🟢 EXCELLENT';
  else if (p95 < 50) status = '🟡 BON';
  else if (p95 < 100) status = '🟠 ACCEPTABLE';
  else status = '🔴 LENT';
  
  console.log(`   🚦 Statut: ${status}`);
  
  return { avg, median, p95, min, max, status };
}

async function getSampleData() {
  const client = await pool.connect();
  
  try {
    const userResult = await client.query('SELECT id FROM users ORDER BY RANDOM() LIMIT 1');
    const convResult = await client.query('SELECT id FROM conversations ORDER BY RANDOM() LIMIT 1');
    const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    return {
      userId: userResult.rows[0]?.id,
      conversationId: convResult.rows[0]?.id,
      recentDate,
      searchTerm: '%anxiété%'
    };
  } finally {
    client.release();
  }
}

async function generatePerformanceReport() {
  const client = await pool.connect();
  
  try {
    // Statistiques générales
    console.log('\n📋 RAPPORT DE PERFORMANCE - MAX AI DATABASE');
    console.log('='.repeat(50));
    
    const stats = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM conversations'),
      client.query('SELECT COUNT(*) as count FROM messages'),
      client.query('SELECT pg_size_pretty(pg_total_relation_size(\'messages\')) as size'),
      client.query('SELECT pg_size_pretty(pg_database_size(current_database())) as db_size')
    ]);
    
    console.log(`👥 Utilisateurs: ${stats[0].rows[0].count}`);
    console.log(`💬 Conversations: ${stats[1].rows[0].count}`);
    console.log(`📨 Messages: ${stats[2].rows[0].count}`);
    console.log(`💾 Taille table messages: ${stats[3].rows[0].size}`);
    console.log(`🗄️  Taille base de données: ${stats[4].rows[0].db_size}`);
    
    // Index existants
    console.log(`\n🗂️  INDEX ACTUELS:`);
    const indexResult = await client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename IN ('users', 'conversations', 'messages')
      ORDER BY tablename, indexname
    `);
    
    indexResult.rows.forEach(row => {
      console.log(`   📌 ${row.tablename}.${row.indexname}`);
      console.log(`      ${row.indexdef}`);
    });
    
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await generatePerformanceReport();
    
    const sampleData = await getSampleData();
    
    if (!sampleData.userId || !sampleData.conversationId) {
      console.log('\n❌ Pas assez de données pour les tests. Générez d\'abord des données avec:');
      console.log('   node scripts/generate-test-data.js 1000 5 20');
      return;
    }
    
    console.log('\n🚀 DÉBUT DES TESTS DE PERFORMANCE');
    console.log('='.repeat(50));
    
    const results = [];
    
    // Test 1: Conversations par utilisateur
    const times1 = await runBenchmark(
      benchmarkResults[0].name,
      benchmarkResults[0].sql,
      [sampleData.userId]
    );
    results.push({
      name: benchmarkResults[0].name,
      ...await analyzeResults(benchmarkResults[0].name, times1)
    });
    
    // Test 2: Messages par conversation
    const times2 = await runBenchmark(
      benchmarkResults[1].name,
      benchmarkResults[1].sql,
      [sampleData.conversationId]
    );
    results.push({
      name: benchmarkResults[1].name,
      ...await analyzeResults(benchmarkResults[1].name, times2)
    });
    
    // Test 3: Messages récents
    const times3 = await runBenchmark(
      benchmarkResults[2].name,
      benchmarkResults[2].sql,
      [sampleData.recentDate]
    );
    results.push({
      name: benchmarkResults[2].name,
      ...await analyzeResults(benchmarkResults[2].name, times3)
    });
    
    // Test 4: Statistiques utilisateur
    const times4 = await runBenchmark(
      benchmarkResults[3].name,
      benchmarkResults[3].sql,
      [sampleData.userId]
    );
    results.push({
      name: benchmarkResults[3].name,
      ...await analyzeResults(benchmarkResults[3].name, times4)
    });
    
    // Test 5: Recherche textuelle
    const times5 = await runBenchmark(
      benchmarkResults[4].name,
      benchmarkResults[4].sql,
      [sampleData.searchTerm]
    );
    results.push({
      name: benchmarkResults[4].name,
      ...await analyzeResults(benchmarkResults[4].name, times5)
    });
    
    // Résumé final
    console.log('\n📊 RÉSUMÉ DES PERFORMANCES');
    console.log('='.repeat(50));
    results.forEach(result => {
      console.log(`${result.status} ${result.name}: P95=${result.p95.toFixed(2)}ms`);
    });
    
    const avgP95 = results.reduce((sum, r) => sum + r.p95, 0) / results.length;
    console.log(`\n🎯 Performance moyenne P95: ${avgP95.toFixed(2)}ms`);
    
    if (avgP95 < 20) {
      console.log('🏆 EXCELLENT! Les index fonctionnent parfaitement.');
    } else if (avgP95 < 50) {
      console.log('👍 BON! Les performances sont acceptables.');
    } else {
      console.log('⚠️  ATTENTION! Optimisations supplémentaires recommandées.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du benchmark:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Fix: Use performanceBenchmarks instead of benchmarkResults
const benchmarkResults = performanceBenchmarks;

if (require.main === module) {
  main();
}