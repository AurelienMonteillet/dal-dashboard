#!/usr/bin/env python3
"""
Compare original vs merged file to validate changes.
"""

import json
from pathlib import Path

ORIGINAL = Path("/opt/dal_dashboard/backend/data/dal_stats_history.json")
MERGED = Path("/opt/dal_dashboard/backend/data/dal_stats_history_merged.json")

def compare():
    print("=" * 80)
    print("Comparaison : ORIGINAL vs MERGED")
    print("=" * 80)
    print()
    
    original = {entry['cycle']: entry for entry in json.load(ORIGINAL.open())}
    merged = {entry['cycle']: entry for entry in json.load(MERGED.open())}
    
    print(f"Cycles dans l'original : {len(original)}")
    print(f"Cycles dans le mergé   : {len(merged)}")
    print()
    
    # Check what changed
    changed = 0
    unchanged = 0
    
    print("Différences détectées :")
    print("-" * 80)
    
    for cycle in sorted(set(original.keys()) | set(merged.keys())):
        if cycle not in original:
            print(f"  Cycle {cycle} : Nouveau (absent de l'original)")
            changed += 1
        elif cycle not in merged:
            print(f"  Cycle {cycle} : Supprimé (absent du mergé)")
            changed += 1
        elif cycle >= 1000:
            # These should have changed
            old_bp = original[cycle].get('dal_baking_power_percentage', 0)
            new_bp = merged[cycle].get('dal_baking_power_percentage', 0)
            
            if abs(old_bp - new_bp) > 0.01:
                diff = new_bp - old_bp
                print(f"  Cycle {cycle} : BP changé {old_bp:.1f}% → {new_bp:.1f}% ({diff:+.1f}%)")
                changed += 1
            else:
                unchanged += 1
        else:
            # These should be unchanged
            if original[cycle] != merged[cycle]:
                print(f"  ⚠️  Cycle {cycle} : Modifié alors qu'il devrait être identique")
                changed += 1
            else:
                unchanged += 1
    
    print("-" * 80)
    print()
    print(f"Résumé : {changed} cycles modifiés, {unchanged} cycles inchangés")
    print()
    
    # Show transition
    print("Zone de transition (cycles 997-1003) :")
    print("-" * 80)
    print(f"{'Cycle':<8} | {'Original BP':<15} | {'Merged BP':<15} | {'Diff':<10}")
    print("-" * 80)
    
    for cycle in range(997, 1004):
        if cycle in original and cycle in merged:
            old_bp = original[cycle].get('dal_baking_power_percentage', 0)
            new_bp = merged[cycle].get('dal_baking_power_percentage', 0)
            diff = new_bp - old_bp
            marker = " ← TRANSITION" if cycle == 1000 else ""
            print(f"{cycle:<8} | {old_bp:>13.1f}% | {new_bp:>13.1f}% | {diff:>8.1f}%{marker}")
    
    print("-" * 80)
    print()
    print("=" * 80)
    print("✅ Vérification terminée")
    print("=" * 80)

if __name__ == "__main__":
    compare()

