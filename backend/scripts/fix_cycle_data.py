#!/usr/bin/env python3
"""
Script utilitaire pour corriger les données d'anciens cycles DAL.
Permet de recalculer et mettre à jour les données pour des cycles spécifiques.
"""

import sys
import json
import argparse
import logging
from pathlib import Path
from datetime import datetime
from dal_calculation import DALCalculator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/fix_cycle_data.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def load_history():
    """Charge l'historique des données DAL"""
    history_file = Path("/opt/dal_dashboard/backend/data/dal_stats_history.json")
    if history_file.exists():
        with open(history_file, 'r') as f:
            return json.load(f)
    return []

def save_history(history):
    """Sauvegarde l'historique des données DAL"""
    history_file = Path("/opt/dal_dashboard/backend/data/dal_stats_history.json")
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)
    
    # Copie aussi vers le frontend
    frontend_file = Path("/opt/dal_dashboard/frontend/public/dal_stats_history.json")
    with open(frontend_file, 'w') as f:
        json.dump(history, f, indent=2)

def fix_cycle_data(cycle, network="mainnet"):
    """
    Corrige les données pour un cycle spécifique
    
    Args:
        cycle: Numéro du cycle à corriger
        network: Réseau Tezos (défaut: mainnet)
    """
    logger.info(f"Correction des données pour le cycle {cycle}")
    
    # Initialiser le calculateur DAL
    calculator = DALCalculator(network)
    
    # Calculer les nouvelles données
    stats = calculator.calculate_stats(cycle)
    
    if not stats:
        logger.error(f"Impossible de calculer les données pour le cycle {cycle}")
        return False
    
    # Charger l'historique existant
    history = load_history()
    
    # Créer l'entrée pour l'historique
    history_entry = {
        "timestamp": stats.timestamp.isoformat(),
        "cycle": stats.cycle,
        "dal_active_bakers": stats.dal_active_bakers,
        "dal_baking_power_percentage": round(stats.dal_baking_power_percentage, 1),
        "dal_participation_percentage": round(stats.dal_participation_percentage, 1),
        "dal_adoption_percentage": round(stats.dal_adoption_percentage, 1)
    }
    
    # Trouver et remplacer l'entrée existante ou ajouter une nouvelle
    found = False
    for i, entry in enumerate(history):
        if entry.get("cycle") == cycle:
            history[i] = history_entry
            found = True
            logger.info(f"Entrée mise à jour pour le cycle {cycle}")
            break
    
    if not found:
        history.append(history_entry)
        logger.info(f"Nouvelle entrée ajoutée pour le cycle {cycle}")
    
    # Trier par cycle (plus récent en premier)
    history.sort(key=lambda x: x.get("cycle", 0), reverse=True)
    
    # Sauvegarder l'historique
    save_history(history)
    
    logger.info(f"Données corrigées pour le cycle {cycle}:")
    logger.info(f"  - Bakers DAL actifs: {stats.dal_active_bakers}")
    logger.info(f"  - Pourcentage de baking power: {stats.dal_baking_power_percentage:.1f}%")
    logger.info(f"  - Pourcentage de participation: {stats.dal_participation_percentage:.1f}%")
    logger.info(f"  - Pourcentage d'adoption: {stats.dal_adoption_percentage:.1f}%")
    
    return True

def list_cycles():
    """Liste tous les cycles disponibles dans l'historique"""
    history = load_history()
    if not history:
        logger.info("Aucun cycle trouvé dans l'historique")
        return
    
    logger.info("Cycles disponibles dans l'historique:")
    for entry in history[:10]:  # Afficher les 10 plus récents
        cycle = entry.get("cycle", "N/A")
        timestamp = entry.get("timestamp", "N/A")
        active_bakers = entry.get("dal_active_bakers", 0)
        baking_power = entry.get("dal_baking_power_percentage", 0)
        logger.info(f"  Cycle {cycle} ({timestamp}): {active_bakers} bakers, {baking_power}% baking power")

def main():
    parser = argparse.ArgumentParser(description='Corriger les données DAL pour des cycles spécifiques')
    parser.add_argument('--cycle', type=int, help='Numéro du cycle à corriger')
    parser.add_argument('--network', type=str, default='mainnet', help='Réseau Tezos (défaut: mainnet)')
    parser.add_argument('--list', action='store_true', help='Lister les cycles disponibles')
    parser.add_argument('--cycles', nargs='+', type=int, help='Corriger plusieurs cycles')
    
    args = parser.parse_args()
    
    if args.list:
        list_cycles()
        return
    
    if args.cycles:
        # Corriger plusieurs cycles
        for cycle in args.cycles:
            logger.info(f"Traitement du cycle {cycle}...")
            if fix_cycle_data(cycle, args.network):
                logger.info(f"Cycle {cycle} corrigé avec succès")
            else:
                logger.error(f"Échec de la correction du cycle {cycle}")
    elif args.cycle:
        # Corriger un seul cycle
        if fix_cycle_data(args.cycle, args.network):
            logger.info(f"Cycle {args.cycle} corrigé avec succès")
        else:
            logger.error(f"Échec de la correction du cycle {args.cycle}")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
