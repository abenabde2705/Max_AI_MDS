#!/bin/bash

set -e

echo "MAX AI - AUTOMATED PERFORMANCE TESTS"
echo "====================================="

USERS=${1:-1000}
CONVERSATIONS_PER_USER=${2:-5}
MESSAGES_PER_CONVERSATION=${3:-20}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-max_ai_db}
DB_USER=${DB_USER:-postgres}

echo "Test Configuration:"
echo "   Users: $USERS"
echo "   Conversations per user: ~$CONVERSATIONS_PER_USER"
echo "   Messages per conversation: ~$MESSAGES_PER_CONVERSATION"
echo "   Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""

echo "Verifying services..."
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "Backend server not running on port 3000"
    echo "   Start with: cd server-app && npm start"
    exit 1
fi

if ! nc -z $DB_HOST $DB_PORT; then
    echo "PostgreSQL not accessible on $DB_HOST:$DB_PORT"
    echo "   Check that PostgreSQL is running"
    exit 1
fi

echo "Services operational"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install pg
fi

echo ""
echo "STEP 1: Baseline benchmark (empty database)"
echo "==========================================="
node scripts/performance-benchmark.js 2>/dev/null || echo "Empty database, limited benchmark"

echo ""
echo "STEP 2: Test data generation"
echo "============================"
echo "Generating $(($USERS * $CONVERSATIONS_PER_USER * $MESSAGES_PER_CONVERSATION)) messages..."

start_time=$(date +%s)
node scripts/generate-test-data.js $USERS $CONVERSATIONS_PER_USER $MESSAGES_PER_CONVERSATION
end_time=$(date +%s)
generation_time=$((end_time - start_time))

echo "Data generated in ${generation_time}s"

echo ""
echo "STEP 3: Benchmark with data (after indexing)"
echo "============================================"
node scripts/performance-benchmark.js

echo ""
echo "STEP 4: Light load test (10 users)"
echo "=================================="
echo "k6 test - 2 minutes with 10 virtual users..."

k6 run k6/auth-test.js --duration 120s --vus 10 --quiet

if [ "$#" -ge 4 ] && [ "$4" = "--full-stress" ]; then
    echo ""
    echo "STEP 5: Full stress test (up to 100 users)"
    echo "=========================================="
    echo "Progressive load test - 21 minutes..."
    echo "   Monitor Grafana: http://localhost:3002"
    
    k6 run k6/stress-test-progressive.js
else
    echo ""
    echo "For full stress test, use:"
    echo "   ./scripts/run-performance-tests.sh $USERS $CONVERSATIONS_PER_USER $MESSAGES_PER_CONVERSATION --full-stress"
fi

echo ""
echo "STEP 6: Final performance report"
echo "==============================="

echo "Final statistics:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    'Users: ' || COUNT(*) 
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
    'DB Size: ' || pg_size_pretty(pg_database_size('$DB_NAME'));
" 2>/dev/null || echo "Cannot connect to PostgreSQL for statistics"

echo ""
echo "Current system metrics:"
if curl -s http://localhost:3000/metrics | grep -E "http_requests_total|http_request_duration" > /dev/null; then
    total_requests=$(curl -s http://localhost:3000/metrics | grep -E "http_requests_total" | awk -F' ' '{sum += $2} END {print sum}')
    echo "   Total requests processed: $total_requests"
    echo "   Complete metrics: http://localhost:3000/metrics"
    echo "   Grafana Dashboard: http://localhost:3002 (admin/admin)"
    echo "   Prometheus: http://localhost:9090"
else
    echo "   Metrics not available"
fi

echo ""
echo "PERFORMANCE TESTS COMPLETED"
echo "==========================="
echo "Performance indexes applied and tested"
echo "Test data generated: $(($USERS * $CONVERSATIONS_PER_USER * $MESSAGES_PER_CONVERSATION)) messages"
echo "Performance benchmarks completed" 
echo "Load tests validated"
echo ""
echo "To clean test data:"
echo "   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c \"TRUNCATE messages, conversations, users CASCADE;\""