-- Script de debug pour visualiser la base de données MaxAI

-- Lister toutes les tables
\dt

-- Afficher la structure des tables principales
\echo '=== STRUCTURE TABLE USERS ==='
\d users

\echo '=== STRUCTURE TABLE CONVERSATIONS ==='
\d conversations

\echo '=== STRUCTURE TABLE MESSAGES ==='
\d messages

\echo '=== STRUCTURE TABLE EMOTIONAL_JOURNAL ==='
\d emotional_journal

\echo '=== STRUCTURE TABLE RECOMMENDATIONS ==='
\d recommendations

\echo '=== STRUCTURE TABLE SUBSCRIPTIONS ==='
\d subscriptions

-- Afficher le contenu des tables
\echo '=== CONTENU TABLE USERS ==='
SELECT 
    id, 
    email, 
    "firstName", 
    "lastName", 
    is_anonymous, 
    is_premium,
    role,
    created_at,
    SUBSTRING(password_hash FROM 1 FOR 20) || '...' AS password_preview
FROM users 
ORDER BY created_at DESC;

\echo '=== CONTENU TABLE CONVERSATIONS ==='
SELECT 
    id, 
    title, 
    user_id, 
    created_at
FROM conversations 
ORDER BY created_at DESC 
LIMIT 10;

\echo '=== CONTENU TABLE MESSAGES ==='
SELECT 
    id, 
    conversation_id, 
    sender, 
    SUBSTRING(content FROM 1 FOR 50) || '...' AS content_preview,
    sent_at
FROM messages 
ORDER BY sent_at DESC 
LIMIT 10;

-- Statistiques
\echo '=== STATISTIQUES ==='
SELECT 
    'users' as table_name, COUNT(*) as count 
FROM users
UNION ALL
SELECT 
    'conversations' as table_name, COUNT(*) as count 
FROM conversations
UNION ALL
SELECT 
    'messages' as table_name, COUNT(*) as count 
FROM messages
UNION ALL
SELECT 
    'emotional_journal' as table_name, COUNT(*) as count 
FROM emotional_journal
UNION ALL
SELECT 
    'recommendations' as table_name, COUNT(*) as count 
FROM recommendations
UNION ALL
SELECT 
    'subscriptions' as table_name, COUNT(*) as count 
FROM subscriptions;

-- Vérifier spécifiquement la colonne role
\echo '=== VÉRIFICATION COLONNE ROLE ==='
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;