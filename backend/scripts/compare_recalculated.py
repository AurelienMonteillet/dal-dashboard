#!/usr/bin/env python3
"""
Compare original and recalculated DAL stats to verify the corrections.
"""

import json
from pathlib import Path
from datetime import datetime

# Paths
ORIGINAL = Path("/opt/dal_dashboard/backend/data/dal_stats_history.json")
RECALCULATED = Path("/opt/dal_dashboard/backend/data_recalculated/dal_stats_history.json")

def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)

def compare():
    print("=" * 80)
    print("Comparaison : Ancien vs Nouveau (Recalculé)")
    print("=" * 80)
    print()
    
    original = {entry['cycle']: entry for entry in load_json(ORIGINAL)}
    recalculated = {entry['cycle']: entry for entry in load_json(RECALCULATED)}
    
    all_cycles = sorted(set(original.keys()) | set(recalculated.keys()))
    
    print(f"Cycles dans l'original: {len(original)}")
    print(f"Cycles recalculés: {len(recalculated)}")
    print()
    
    # Statistics
    date_changes = 0
    bp_changes = 0
    bakers_changes = 0
    total_bp_diff = 0
    
    print("Différences significatives (Baking Power change > 1%) :")
    print("-" * 80)
    print(f"{'Cycle':<6} | {'Date':<24} | {'BP %':<18} | {'Bakers':<15}")
    print(f"{'':6} | {'OLD → NEW':<24} | {'OLD → NEW':<18} | {'OLD → NEW':<15}")
    print("-" * 80)
    
    significant_changes = []
    
    for cycle in all_cycles:
        old = original.get(cycle, {})
        new = recalculated.get(cycle, {})
        
        if not old or not new:
            continue
        
        # Extract values
        old_date = old.get('timestamp', '')[:10]
        new_date = new.get('timestamp', '')[:10]
        old_bp = old.get('dal_baking_power_percentage', 0)
        new_bp = new.get('dal_baking_power_percentage', 0)
        old_bakers = old.get('dal_active_bakers', 0)
        new_bakers = new.get('dal_active_bakers', 0)
        
        # Track changes
        if old_date != new_date:
            date_changes += 1
        if abs(old_bp - new_bp) > 0.1:
            bp_changes += 1
        if old_bakers != new_bakers:
            bakers_changes += 1
        
        total_bp_diff += abs(old_bp - new_bp)
        
        # Show significant changes (> 1% BP difference)
        if abs(old_bp - new_bp) > 1.0:
            significant_changes.append({
                'cycle': cycle,
                'old_date': old_date,
                'new_date': new_date,
                'old_bp': old_bp,
                'new_bp': new_bp,
                'old_bakers': old_bakers,
                'new_bakers': new_bakers
            })
    
    # Show significant changes
    for change in sorted(significant_changes, key=lambda x: abs(x['old_bp'] - x['new_bp']), reverse=True)[:20]:
        date_str = f"{change['old_date']} → {change['new_date']}" if change['old_date'] != change['new_date'] else change['old_date']
        bp_str = f"{change['old_bp']:.1f}% → {change['new_bp']:.1f}%"
        bakers_str = f"{change['old_bakers']} → {change['new_bakers']}"
        
        print(f"{change['cycle']:<6} | {date_str:<24} | {bp_str:<18} | {bakers_str:<15}")
    
    print("-" * 80)
    print()
    
    # Summary statistics
    print("Statistiques globales :")
    print("-" * 80)
    print(f"Total cycles comparés: {len(all_cycles)}")
    print(f"Cycles avec changement de date: {date_changes}")
    print(f"Cycles avec changement de BP (> 0.1%): {bp_changes}")
    print(f"Cycles avec changement de bakers: {bakers_changes}")
    print(f"Différence moyenne BP: {total_bp_diff / len(all_cycles):.2f}%")
    print()
    
    # Sample comparison: First 5, Middle 5, Last 5
    print("Échantillons détaillés :")
    print("-" * 80)
    
    sample_cycles = all_cycles[:5] + all_cycles[len(all_cycles)//2-2:len(all_cycles)//2+3] + all_cycles[-5:]
    
    for cycle in sample_cycles:
        old = original.get(cycle, {})
        new = recalculated.get(cycle, {})
        
        if not old or not new:
            continue
        
        print(f"\nCycle {cycle}:")
        print(f"  Date:        {old.get('timestamp', '')[:10]} → {new.get('timestamp', '')[:10]}")
        print(f"  BP:          {old.get('dal_baking_power_percentage', 0):.2f}% → {new.get('dal_baking_power_percentage', 0):.2f}%")
        print(f"  Bakers:      {old.get('dal_active_bakers', 0)} → {new.get('dal_active_bakers', 0)}")
        print(f"  Difference:  {abs(old.get('dal_baking_power_percentage', 0) - new.get('dal_baking_power_percentage', 0)):.2f}% BP")
    
    print()
    print("=" * 80)
    print("Vérifications :")
    print("=" * 80)
    
    # Check if changes make sense
    issues = []
    
    for cycle in all_cycles:
        old = original.get(cycle, {})
        new = recalculated.get(cycle, {})
        
        if not old or not new:
            continue
        
        old_bp = old.get('dal_baking_power_percentage', 0)
        new_bp = new.get('dal_baking_power_percentage', 0)
        
        # Check for unexpected increases
        if new_bp > old_bp + 0.5:  # More than 0.5% increase is suspicious
            issues.append(f"  ⚠️  Cycle {cycle}: BP increased by {new_bp - old_bp:.2f}% (unexpected)")
    
    if issues:
        print("⚠️  Problèmes potentiels détectés :")
        for issue in issues[:10]:  # Show first 10
            print(issue)
    else:
        print("✅ Aucun problème détecté - les changements semblent cohérents")
    
    print()
    print("Attendu : BP devrait diminuer (suppression des faux positifs)")
    print("          Dates devraient être légèrement modifiées")
    print()
    print("=" * 80)
    
    # Final recommendation
    if bp_changes > 0 and all(recalculated.get(c, {}).get('dal_baking_power_percentage', 100) <= original.get(c, {}).get('dal_baking_power_percentage', 0) + 1 for c in all_cycles if c in original and c in recalculated):
        print("✅ RECOMMANDATION : Les données recalculées semblent correctes")
        print()
        print("Pour appliquer les changements :")
        print("  cp backend/data/dal_stats_history.json backend/data/dal_stats_history.backup_$(date +%Y%m%d_%H%M%S).json")
        print("  cp backend/data_recalculated/dal_stats_history.json backend/data/dal_stats_history.json")
        print("  cd /opt/dal_dashboard && git add backend/data/dal_stats_history.json")
        print("  git commit -m 'fix: Correct DAL stats with dal_participation RPC and proper dates'")
        print("  git push")
    else:
        print("⚠️  ATTENTION : Vérifier manuellement avant d'appliquer")
    
    print("=" * 80)

if __name__ == "__main__":
    compare()


