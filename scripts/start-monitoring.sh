#!/bin/bash

echo "Starting Max AI monitoring..."

if [ ! -f "monitoring/docker-compose.yml" ]; then
    echo "This script must be run from the Max_AI_MDS project root"
    exit 1
fi

echo "Stopping existing monitoring services..."
cd monitoring
docker compose down > /dev/null 2>&1

echo "Starting Prometheus and Grafana..."
docker compose up -d

echo "Waiting for services to start..."
sleep 15

if ! curl -f http://localhost:9090 > /dev/null 2>&1; then
    echo "Prometheus not responding on http://localhost:9090"
    exit 1
fi

if ! curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo "Grafana not responding on http://localhost:3002"
    exit 1
fi

echo "Monitoring started successfully!"
echo ""
echo "Service access:"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3002"
echo "     - Username: admin"
echo "     - Password: admin123"
echo "  Backend metrics: http://localhost:3000/metrics"
echo "  Swagger API: http://localhost:3000/api-docs"
echo ""
echo "Use './scripts/run-load-test.sh' to launch load tests"