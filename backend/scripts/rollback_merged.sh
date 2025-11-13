#!/bin/bash

# Rollback script to restore previous version

set -e

cd /opt/dal_dashboard

ORIGINAL="backend/data/dal_stats_history.json"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                        ⏮️  ROLLBACK DÉPLOIEMENT                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# List available backups
echo "📁 Backups disponibles :"
echo ""
ls -lht backend/data/dal_stats_history.backup_*.json | head -5 | while read -r line; do
    echo "  $line"
done
echo ""

# If timestamp provided, use it
if [ -n "$1" ]; then
    BACKUP="backend/data/dal_stats_history.backup_${1}.json"
    
    if [ ! -f "$BACKUP" ]; then
        echo "❌ Erreur : Backup introuvable ($BACKUP)"
        exit 1
    fi
else
    # Use most recent backup
    BACKUP=$(ls -t backend/data/dal_stats_history.backup_*.json | head -1)
    
    if [ -z "$BACKUP" ]; then
        echo "❌ Erreur : Aucun backup trouvé"
        exit 1
    fi
fi

echo "🔄 Restoration depuis :"
echo "  $BACKUP"
echo ""

# Show stats
CURRENT_COUNT=$(jq 'length' $ORIGINAL 2>/dev/null || echo "0")
BACKUP_COUNT=$(jq 'length' $BACKUP)

echo "📊 Statistiques :"
echo "  Fichier actuel : $CURRENT_COUNT cycles"
echo "  Backup         : $BACKUP_COUNT cycles"
echo ""

# Confirm
echo "════════════════════════════════════════════════════════════════════════════"
read -p "Restaurer ce backup ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo ""
echo "⏮️  Rollback en cours..."
echo ""

# Create safety backup of current
SAFETY_BACKUP="backend/data/dal_stats_history.before_rollback_$(date +%Y%m%d_%H%M%S).json"
cp "$ORIGINAL" "$SAFETY_BACKUP"
echo "1️⃣  Backup de sécurité créé : $SAFETY_BACKUP"

# Restore
cp "$BACKUP" "$ORIGINAL"
echo "2️⃣  Fichier restauré"

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ ROLLBACK RÉUSSI !"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Fichier actif       : $ORIGINAL"
echo "💾 Backup utilisé      : $BACKUP"
echo "🔒 Backup de sécurité  : $SAFETY_BACKUP"
echo ""
echo "Vérifiez le dashboard : http://localhost:3000"
echo ""

