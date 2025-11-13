#!/bin/bash

# Safe deployment script for merged DAL stats
# This script can be reverted easily

set -e

cd /opt/dal_dashboard

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ORIGINAL="backend/data/dal_stats_history.json"
MERGED="backend/data/dal_stats_history_merged.json"
BACKUP="backend/data/dal_stats_history.backup_${TIMESTAMP}.json"
DEPLOYED_FLAG="backend/data/.merged_deployed_${TIMESTAMP}"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                  🚀 DÉPLOIEMENT DU FICHIER MERGÉ                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if merged file exists
if [ ! -f "$MERGED" ]; then
    echo "❌ Erreur : Fichier mergé introuvable ($MERGED)"
    exit 1
fi

# Show what will be deployed
echo "📋 Fichiers :"
echo "  Source      : $MERGED"
echo "  Destination : $ORIGINAL"
echo "  Backup      : $BACKUP"
echo ""

# Show file sizes
echo "📊 Tailles :"
echo "  Original    : $(du -h $ORIGINAL | cut -f1)"
echo "  Mergé       : $(du -h $MERGED | cut -f1)"
echo ""

# Show cycle counts
ORIGINAL_COUNT=$(jq 'length' $ORIGINAL)
MERGED_COUNT=$(jq 'length' $MERGED)
echo "📈 Nombre de cycles :"
echo "  Original    : $ORIGINAL_COUNT cycles"
echo "  Mergé       : $MERGED_COUNT cycles"
echo ""

# Confirm
echo "════════════════════════════════════════════════════════════════════════════"
read -p "Déployer le fichier mergé ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "🔄 Déploiement en cours..."
echo ""

# Create backup
echo "1️⃣  Création du backup..."
cp "$ORIGINAL" "$BACKUP"
echo "   ✅ Backup créé : $BACKUP"

# Deploy merged file
echo "2️⃣  Copie du fichier mergé..."
cp "$MERGED" "$ORIGINAL"
echo "   ✅ Fichier mergé déployé"

# Create deployment flag
echo "3️⃣  Création du flag de déploiement..."
echo "{\"deployed_at\": \"$TIMESTAMP\", \"backup\": \"$BACKUP\"}" > "$DEPLOYED_FLAG"
echo "   ✅ Flag créé : $DEPLOYED_FLAG"

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ DÉPLOIEMENT RÉUSSI !"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Fichier actif   : $ORIGINAL"
echo "💾 Backup          : $BACKUP"
echo ""
echo "Pour revenir en arrière :"
echo "  cp $BACKUP $ORIGINAL"
echo ""
echo "Ou utiliser le script :"
echo "  ./backend/scripts/rollback_merged.sh $TIMESTAMP"
echo ""
echo "Prochaines étapes :"
echo "  1. Vérifier le dashboard : http://localhost:3000"
echo "  2. Si OK : git add backend/data/dal_stats_history.json"
echo "  3. Si OK : git commit -m 'fix: Correct DAL stats with dal_participation (cycles 1000+)'"
echo "  4. Si OK : git push"
echo ""

