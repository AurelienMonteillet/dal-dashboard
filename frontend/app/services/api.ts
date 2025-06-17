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

export interface BakerStatus {
    online: boolean;
    cycle: number;
    last_checked: string;
}

export interface DALStatusResponse {
    timestamp: string;
    data: {
        [key: string]: BakerStatus;
    };
}

// URL of the JSON files hosted on GitHub Pages
const STATS_URL = process.env.NEXT_PUBLIC_STATS_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json';
const STATUS_URL = process.env.NEXT_PUBLIC_STATUS_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_status.json';

/**
 * Retrieves DAL statistics from the JSON hosted on GitHub Pages
 */
export async function fetchDalStats(): Promise<DALStats> {
    try {
        const response = await fetch(STATS_URL, {
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

/**
 * Retrieves baker DAL status from the JSON hosted on GitHub Pages
 */
export async function fetchBakerStatus(): Promise<DALStatusResponse> {
    try {
        const response = await fetch(STATUS_URL, {
            cache: 'no-store',
            next: { revalidate: 60 } // Revalidate every minute for more real-time status
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement distant du statut DAL :', error);
        // Fallback : essayer de charger depuis le dossier public local
        try {
            const localResponse = await fetch('/dal_status.json', {
                cache: 'no-store'
            });
            if (!localResponse.ok) {
                throw new Error(`Echec du chargement local : ${localResponse.status}`);
            }
            return await localResponse.json();
        } catch (localError) {
            console.error('Echec du fallback local pour le statut DAL :', localError);
            throw new Error('Impossible de récupérer le statut DAL (distant et local échoués)');
        }
    }
} 