'use client';

/**
 * Service pour récupérer les statistiques DAL depuis GitHub Pages
 */

export interface DALStats {
    timestamp: string;
    cycle: number;
    total_bakers: number;
    dal_active_bakers: number;
    dal_inactive_bakers: number;
    unclassified_bakers: number;
    non_attesting_bakers: number;
    dal_baking_power_percentage: number;
    total_baking_power: number;
    dal_baking_power: number;
}

// URL du fichier JSON hébergé sur GitHub Pages
const JSON_URL = process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json';

/**
 * Récupère les statistiques DAL depuis le JSON hébergé sur GitHub Pages
 */
export async function fetchDalStats(): Promise<DALStats> {
    try {
        const response = await fetch(JSON_URL, {
            // Nécessaire pour éviter la mise en cache de la réponse
            cache: 'no-store',
            next: { revalidate: 3600 } // Revalider toutes les heures
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching DAL stats:', error);
        throw error;
    }
} 