#!/bin/bash

echo "🚀 Démarrage du monitoring Max AI..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "monitoring/docker-compose.yml" ]; then
    echo "❌ Ce script doit être exécuté depuis la racine du projet Max_AI_MDS"
    exit 1
fi

# Arrêter les services existants s'ils tournent
echo "🛑 Arrêt des services monitoring existants..."
cd monitoring
docker compose down > /dev/null 2>&1

# Démarrer Prometheus et Grafana
echo "📊 Démarrage de Prometheus et Grafana..."
docker compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 15

# Vérifier que les services sont démarrés
if ! curl -f http://localhost:9090 > /dev/null 2>&1; then
    echo "❌ Prometheus ne répond pas sur http://localhost:9090"
    exit 1
fi

if ! curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo "❌ Grafana ne répond pas sur http://localhost:3002"
    exit 1
fi

echo "✅ Monitoring démarré avec succès !"
echo ""
echo "🔗 Accès aux services :"
echo "  📊 Prometheus: http://localhost:9090"
echo "  📈 Grafana: http://localhost:3002"
echo "     - Username: admin"
echo "     - Password: admin123"
echo "  🎯 Métriques backend: http://localhost:3000/metrics"
echo "  📚 Swagger API: http://localhost:3000/api-docs"
echo ""
echo "💡 Utilisez './scripts/run-load-test.sh' pour lancer les tests de charge"