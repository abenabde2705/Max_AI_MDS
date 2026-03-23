#!/usr/bin/env node

const { Pool } = require('pg');
const crypto = require('crypto');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'max_ai_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Génération de données réalistes
const generateUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: crypto.randomUUID(),
      email: `user${i}@testperf.com`,
      password_hash: crypto.createHash('sha256').update(`password${i}`).digest('hex'),
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Dernière année
      updated_at: new Date(),
    });
  }
  return users;
};

const generateConversations = (users, avgConversationsPerUser) => {
  const conversations = [];
  users.forEach(user => {
    const numConversations = Math.floor(Math.random() * avgConversationsPerUser * 2) + 1;
    for (let i = 0; i < numConversations; i++) {
      const startedAt = new Date(user.created_at.getTime() + Math.random() * (Date.now() - user.created_at.getTime()));
      const endedAt = Math.random() > 0.3 ? new Date(startedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null; // 70% finies
      conversations.push({
        id: crypto.randomUUID(),
        user_id: user.id,
        started_at: startedAt,
        ended_at: endedAt,
      });
    }
  });
  return conversations;
};

const generateMessages = (conversations, avgMessagesPerConversation) => {
  const messages = [];
  const sampleMessages = [
    "Bonjour, j'ai besoin d'aide pour gérer mon anxiété.",
    "Comment puis-je améliorer mon sommeil ?",
    "Je me sens stressé au travail, que faire ?",
    "Merci pour vos conseils, cela m'a beaucoup aidé.",
    "Pouvez-vous m'expliquer des techniques de relaxation ?",
    "J'ai du mal à me concentrer ces derniers temps.",
    "Comment gérer les relations difficiles ?",
    "Je ressens de la tristesse, est-ce normal ?",
    "Quelles sont les bonnes habitudes pour la santé mentale ?",
    "Comment développer la confiance en soi ?",
  ];

  const emotions = ['anxiété', 'joie', 'tristesse', 'colère', 'peur', 'surprise', 'dégoût', 'anticipation'];

  conversations.forEach(conversation => {
    const numMessages = Math.floor(Math.random() * avgMessagesPerConversation * 2) + 2; // Min 2 messages
    let messageTime = new Date(conversation.started_at);
    
    for (let i = 0; i < numMessages; i++) {
      // Alternance user/assistant
      const isUser = i % 2 === 0;
      messageTime = new Date(messageTime.getTime() + Math.random() * 60 * 60 * 1000); // Max 1h entre messages
      
      // S'arrêter si la conversation a une date de fin et qu'on l'a dépassée
      if (conversation.ended_at && messageTime > conversation.ended_at) {
        break;
      }
      
      messages.push({
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        sender: isUser ? 'user' : 'assistant',
        content: isUser 
          ? sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
          : `Je comprends votre situation. Voici quelques conseils personnalisés pour vous aider...`,
        emotion_detected: isUser && Math.random() > 0.7 ? emotions[Math.floor(Math.random() * emotions.length)] : null,
        sent_at: messageTime,
      });
    }
  });
  
  return messages;
};

const insertData = async (users, conversations, messages) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(`Insertion de ${users.length} utilisateurs...`);
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
        [user.id, user.email, user.password_hash, user.created_at, user.updated_at]
      );
    }
    
    console.log(`Insertion de ${conversations.length} conversations...`);
    for (const conv of conversations) {
      await client.query(
        `INSERT INTO conversations (id, user_id, started_at, ended_at) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [conv.id, conv.user_id, conv.started_at, conv.ended_at]
      );
    }
    
    console.log(`Insertion de ${messages.length} messages...`);
    for (const msg of messages) {
      await client.query(
        `INSERT INTO messages (id, conversation_id, sender, content, emotion_detected, sent_at) 
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
        [msg.id, msg.conversation_id, msg.sender, msg.content, msg.emotion_detected, msg.sent_at]
      );
    }
    
    await client.query('COMMIT');
    console.log('Toutes les données ont été insérées avec succès !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de l\'insertion :', error);
    throw error;
  } finally {
    client.release();
  }
};

const analyzeData = async () => {
  const client = await pool.connect();
  
  try {
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const convCount = await client.query('SELECT COUNT(*) FROM conversations');
    const msgCount = await client.query('SELECT COUNT(*) FROM messages');
    
    console.log('\nSTATISTIQUES DE LA BASE DE DONNÉES:');
    console.log(`Utilisateurs: ${userCount.rows[0].count}`);
    console.log(`Conversations: ${convCount.rows[0].count}`);
    console.log(`Messages: ${msgCount.rows[0].count}`);
    
    // Analyse des performances avec EXPLAIN ANALYZE
    console.log('\nANALYSE DES PERFORMANCES:');
    
    const queries = [
      {
        name: 'Conversations par utilisateur (avec index)',
        sql: 'EXPLAIN ANALYZE SELECT * FROM conversations WHERE user_id = $1 ORDER BY started_at DESC LIMIT 10',
        params: [(await client.query('SELECT id FROM users LIMIT 1')).rows[0]?.id]
      },
      {
        name: 'Messages par conversation (avec index)',
        sql: 'EXPLAIN ANALYZE SELECT * FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
        params: [(await client.query('SELECT id FROM conversations LIMIT 1')).rows[0]?.id]
      },
      {
        name: 'Messages récents tous utilisateurs (avec index)',
        sql: 'EXPLAIN ANALYZE SELECT m.*, c.user_id FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE m.sent_at > $1 ORDER BY m.sent_at DESC LIMIT 50',
        params: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] // 7 derniers jours
      }
    ];
    
    for (const query of queries) {
      if (query.params[0]) {
        console.log(`\n ${query.name}:`);
        const result = await client.query(query.sql, query.params);
        console.log(result.rows.map(row => row['QUERY PLAN']).join('\n'));
      }
    }
    
  } finally {
    client.release();
  }
};

// Script principal
async function main() {
  const args = process.argv.slice(2);
  const userCount = parseInt(args[0]) || 1000;
  const avgConversationsPerUser = parseInt(args[1]) || 5;
  const avgMessagesPerConversation = parseInt(args[2]) || 20;
  
  console.log('GÉNÉRATION DE DONNÉES DE TEST POUR MAX AI');
  console.log(`Configuration:`);
  console.log(`   - ${userCount} utilisateurs`);
  console.log(`   - ~${avgConversationsPerUser} conversations par utilisateur`);
  console.log(`   - ~${avgMessagesPerConversation} messages par conversation`);
  console.log(`   - ~${userCount * avgConversationsPerUser * avgMessagesPerConversation} messages au total\n`);
  
  try {
    console.log('Génération des utilisateurs...');
    const users = generateUsers(userCount);
    
    console.log('Génération des conversations...');
    const conversations = generateConversations(users, avgConversationsPerUser);
    
    console.log('Génération des messages...');
    const messages = generateMessages(conversations, avgMessagesPerConversation);
    
    console.log('Insertion dans la base de données...');
    await insertData(users, conversations, messages);
    
    console.log('Analyse des performances...');
    await analyzeData();
    
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateUsers, generateConversations, generateMessages, insertData };