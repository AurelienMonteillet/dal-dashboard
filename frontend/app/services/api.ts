'use client';

/**
 * Service to retrieve DAL statistics from GitHub Pages
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

// URL of the JSON file hosted on GitHub Pages
const JSON_URL = process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json';

/**
 * Retrieves DAL statistics from the JSON hosted on GitHub Pages
 */
export async function fetchDalStats(): Promise<DALStats> {
    try {
        const response = await fetch(JSON_URL, {
            // Necessary to avoid caching the response
            cache: 'no-store',
            next: { revalidate: 3600 } // Revalidate every hour
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