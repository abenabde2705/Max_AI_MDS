#!/bin/bash
echo "🧹 Nettoyage Docker en cours..."
docker system prune -af --volumes
echo "✅ Nettoyage terminé !"
docker system df