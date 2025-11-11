#!/bin/bash

# Script de mise à jour rapide pour pousser les données DAL vers GitHub Pages
# Usage: ./quick_update.sh [message_commit]

COMMIT_MESSAGE="${1:-Update DAL stats - $(date +%Y-%m-%d)}"

echo "===== Mise à jour rapide DAL: $(date) ====="

# Aller au répertoire du projet
cd /opt/dal_dashboard

# Vérifier qu'on est sur la branche main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Basculement vers la branche main..."
    git stash
    git checkout main
fi

# Vérifier s'il y a des changements
if git diff --quiet backend/data/dal_stats.json backend/data/dal_stats_history.json; then
    echo "Aucun changement détecté dans les données DAL."
    exit 0
fi

echo "Changements détectés, mise à jour en cours..."

# Créer le répertoire docs s'il n'existe pas
mkdir -p docs

# Copier les fichiers JSON vers docs pour GitHub Pages
cp backend/data/dal_stats.json docs/
cp backend/data/dal_stats_history.json docs/

# Copier aussi vers frontend/public pour le fallback local
cp backend/data/dal_stats.json frontend/public/
cp backend/data/dal_stats_history.json frontend/public/

# Configurer SSH pour l'automatisation
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_automation_key

# Configurer git pour utiliser SSH
git config --local core.sshCommand "ssh -i ~/.ssh/github_automation_key -F /dev/null"

# Ajouter et commiter les changements
git add backend/data/dal_stats.json backend/data/dal_stats_history.json docs/ frontend/public/dal_stats.json frontend/public/dal_stats_history.json
git commit -m "$COMMIT_MESSAGE"

# Pousser les changements
echo "Poussage vers GitHub Pages..."
git push origin main

# Nettoyer l'agent SSH
ssh-agent -k

echo "Mise à jour terminée avec succès!"
echo "Les données sont maintenant disponibles sur GitHub Pages."

# Afficher un résumé des changements
echo ""
echo "Résumé des changements:"
if [ -f backend/data/dal_stats.json ]; then
    CYCLE=$(jq -r '.cycle' backend/data/dal_stats.json)
    ACTIVE_BAKERS=$(jq -r '.dal_active_bakers' backend/data/dal_stats.json)
    BAKING_POWER=$(jq -r '.dal_baking_power_percentage' backend/data/dal_stats.json)
    echo "  Cycle actuel: $CYCLE"
    echo "  Bakers DAL actifs: $ACTIVE_BAKERS"
    echo "  Pourcentage de baking power: ${BAKING_POWER}%"
fi

