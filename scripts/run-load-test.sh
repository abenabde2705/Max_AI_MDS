#!/bin/bash

echo "🧪 Lancement des tests de charge Max AI..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "k6/auth-test.js" ]; then
    echo "❌ Ce script doit être exécuté depuis la racine du projet Max_AI_MDS"
    exit 1
fi

# Vérifier que k6 est installé
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 n'est pas installé."
    echo "📥 Installation de k6..."
    
    # Installation pour Ubuntu/Debian
    sudo gpg -k
    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6
    
    # Vérifier l'installation
    if ! command -v k6 &> /dev/null; then
        echo "❌ Échec de l'installation de k6"
        exit 1
    fi
    echo "✅ k6 installé avec succès"
fi

# Vérifier que le backend est accessible
echo "🔍 Vérification de l'accessibilité du backend..."
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Le backend n'est pas accessible sur http://localhost:3000"
    echo "💡 Assurez-vous que le backend est démarré avec 'docker compose up -d'"
    exit 1
fi

echo "✅ Backend accessible, lancement du test..."
echo ""
echo "📋 Configuration du test :"
echo "  🎯 Objectifs : P95 < 300ms, Erreurs < 1%"
echo "  👥 Utilisateurs virtuels : 5"
echo "  ⏱️  Durée : 2 minutes"
echo "  🚦 Routes testées :"
echo "     - GET /api/conversations (route principale)"
echo "     - POST /api/conversations"
echo "     - POST /api/messages (route critique)"
echo "     - GET /api/messages/:id (route secondaire)"
echo "     - GET /api/health"
echo ""

# Lancer le test
cd k6
k6 run auth-test.js

echo ""
echo "🎉 Test terminé !"
echo ""
echo "📊 Pour analyser les résultats détaillés :"
echo "  📈 Grafana: http://localhost:3002 (Dashboard 'Max AI Performance')"
echo "  📊 Prometheus: http://localhost:9090"
echo "  🎯 Métriques live: http://localhost:3000/metrics"