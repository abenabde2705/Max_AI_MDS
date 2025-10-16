#!/bin/bash

# Performance Testing Automation Script for Max AI
# Tests database indexing performance with realistic data

set -e

echo "🚀 MAX AI - TESTS DE PERFORMANCE AUTOMATISÉS"
echo "=============================================="

# Configuration
USERS=${1:-1000}
CONVERSATIONS_PER_USER=${2:-5}
MESSAGES_PER_CONVERSATION=${3:-20}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-max_ai_db}
DB_USER=${DB_USER:-postgres}

echo "📊 Configuration du test:"
echo "   👥 Utilisateurs: $USERS"
echo "   💬 Conversations par utilisateur: ~$CONVERSATIONS_PER_USER"
echo "   📨 Messages par conversation: ~$MESSAGES_PER_CONVERSATION"
echo "   🗄️  Base de données: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Vérifier que les services sont démarrés
echo "🔍 Vérification des services..."
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "❌ Le serveur backend n'est pas démarré sur le port 3000"
    echo "   Démarrez-le avec: cd server-app && npm start"
    exit 1
fi

if ! nc -z $DB_HOST $DB_PORT; then
    echo "❌ PostgreSQL n'est pas accessible sur $DB_HOST:$DB_PORT"
    echo "   Vérifiez que PostgreSQL est démarré"
    exit 1
fi

echo "✅ Services opérationnels"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install pg
fi

# Étape 1: Mesurer les performances AVANT l'ajout de données
echo ""
echo "📏 ÉTAPE 1: Benchmark baseline (base vide)"
echo "==========================================="
node scripts/performance-benchmark.js 2>/dev/null || echo "⚠️  Base de données vide, benchmark limité"

# Étape 2: Générer des données de test réalistes
echo ""
echo "🎲 ÉTAPE 2: Génération des données de test"
echo "=========================================="
echo "⏳ Génération de $(($USERS * $CONVERSATIONS_PER_USER * $MESSAGES_PER_CONVERSATION)) messages..."

start_time=$(date +%s)
node scripts/generate-test-data.js $USERS $CONVERSATIONS_PER_USER $MESSAGES_PER_CONVERSATION
end_time=$(date +%s)
generation_time=$((end_time - start_time))

echo "✅ Données générées en ${generation_time}s"

# Étape 3: Tester les performances APRÈS génération de données
echo ""
echo "⚡ ÉTAPE 3: Benchmark avec données (après indexation)"
echo "=================================================="
node scripts/performance-benchmark.js

# Étape 4: Test de charge léger
echo ""
echo "🔥 ÉTAPE 4: Test de charge léger (10 utilisateurs)"
echo "==============================================="
echo "⏳ Test k6 - 2 minutes avec 10 utilisateurs virtuels..."

k6 run k6/auth-test.js --duration 120s --vus 10 --quiet

# Étape 5: Test de charge progressif (optionnel)
if [ "$#" -ge 4 ] && [ "$4" = "--full-stress" ]; then
    echo ""
    echo "🚨 ÉTAPE 5: Test de stress complet (jusqu'à 100 utilisateurs)"
    echo "=========================================================="
    echo "⏳ Test de montée en charge progressive - 21 minutes..."
    echo "   📊 Surveillez Grafana: http://localhost:3002"
    
    k6 run k6/stress-test-progressive.js
else
    echo ""
    echo "💡 Pour un test de stress complet, utilisez:"
    echo "   ./scripts/run-performance-tests.sh $USERS $CONVERSATIONS_PER_USER $MESSAGES_PER_CONVERSATION --full-stress"
fi

# Étape 6: Rapport final
echo ""
echo "📊 ÉTAPE 6: Rapport de performance final"
echo "======================================"

# Statistiques de la base
echo "📈 Statistiques finales:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    'Utilisateurs: ' || COUNT(*) 
FROM users
UNION ALL
SELECT 
    'Conversations: ' || COUNT(*) 
FROM conversations
UNION ALL
SELECT 
    'Messages: ' || COUNT(*) 
FROM messages
UNION ALL
SELECT 
    'Taille DB: ' || pg_size_pretty(pg_database_size('$DB_NAME'));
" 2>/dev/null || echo "⚠️  Impossible de se connecter à PostgreSQL pour les statistiques"

# Vérifier les métriques Prometheus
echo ""
echo "📡 Métriques système actuelles:"
if curl -s http://localhost:3000/metrics | grep -E "http_requests_total|http_request_duration" > /dev/null; then
    total_requests=$(curl -s http://localhost:3000/metrics | grep -E "http_requests_total" | awk -F' ' '{sum += $2} END {print sum}')
    echo "   📊 Total requêtes traitées: $total_requests"
    echo "   🔗 Métriques complètes: http://localhost:3000/metrics"
    echo "   📈 Dashboard Grafana: http://localhost:3002 (admin/admin)"
    echo "   📉 Prometheus: http://localhost:9090"
else
    echo "   ⚠️  Métriques non disponibles"
fi

echo ""
echo "🎉 TESTS DE PERFORMANCE TERMINÉS"
echo "================================"
echo "✅ Index de performance appliqués et testés"
echo "✅ Données de test générées: $(($USERS * $CONVERSATIONS_PER_USER * $MESSAGES_PER_CONVERSATION)) messages"
echo "✅ Benchmarks de performance effectués" 
echo "✅ Tests de charge validés"
echo ""
echo "📋 Prochaines étapes recommandées:"
echo "   1. 📊 Analyser les résultats dans Grafana"
echo "   2. 🔍 Examiner les plans d'exécution SQL affichés"
echo "   3. ⚙️  Ajuster les index si nécessaire"
echo "   4. 🔄 Relancer les tests après optimisations"
echo ""
echo "💡 Pour nettoyer les données de test:"
echo "   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c \"TRUNCATE messages, conversations, users CASCADE;\""