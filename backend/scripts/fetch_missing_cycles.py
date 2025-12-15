#!/usr/bin/env python3

import sys
import subprocess
from pathlib import Path

# Add the scripts directory to the path to import dal_calculation
sys.path.insert(0, str(Path(__file__).parent))

from dal_calculation import DALCalculator, save_results_and_update_history

def fetch_missing_cycles(start_cycle: int, end_cycle: int, output_dir: str = None):
    """
    Fetch statistics for multiple cycles.
    
    Args:
        start_cycle: First cycle to fetch (inclusive)
        end_cycle: Last cycle to fetch (inclusive)
        output_dir: Output directory for data files
    """
    # Initialize paths
    if output_dir:
        data_dir = Path(output_dir)
    else:
        data_dir = Path("/opt/dal_dashboard/backend/data")
    
    results_file = data_dir / "dal_stats.json"
    history_file = data_dir / "dal_stats_history.json"
    
    # Initialize the calculator
    calculator = DALCalculator(network="mainnet")
    
    print(f"Récupération des cycles {start_cycle} à {end_cycle}...")
    
    for cycle in range(start_cycle, end_cycle + 1):
        try:
            print(f"\n{'='*60}")
            print(f"Traitement du cycle {cycle}...")
            print(f"{'='*60}")
            
            # Calculate stats for this cycle
            stats = calculator.calculate_stats(verbose=True, cycle=cycle)
            
            # Save results and update history
            save_results_and_update_history(stats, results_file, history_file)
            
            print(f"✅ Cycle {cycle} terminé et sauvegardé")
            
        except Exception as e:
            print(f"❌ Erreur lors du calcul du cycle {cycle}: {e}")
            continue
    
    print(f"\n{'='*60}")
    print(f"Récupération terminée ! Cycles {start_cycle} à {end_cycle} traités.")
    print(f"{'='*60}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Récupérer les cycles manquants')
    parser.add_argument('--start', type=int, required=True, help='Premier cycle à récupérer')
    parser.add_argument('--end', type=int, required=True, help='Dernier cycle à récupérer')
    parser.add_argument('--output-dir', type=str, help='Répertoire de sortie pour les fichiers de données')
    
    args = parser.parse_args()
    
    fetch_missing_cycles(args.start, args.end, args.output_dir)

