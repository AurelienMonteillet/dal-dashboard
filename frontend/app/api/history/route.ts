import { NextResponse } from 'next/server';

const HISTORY_URL = process.env.NEXT_PUBLIC_HISTORY_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats_history.json';

/**
 * GET handler for DAL statistics history
 */
export async function GET() {
    try {
        // Fetch the history data
        const response = await fetch(HISTORY_URL, {
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.status}`);
        }

        // Get the data
        const data = await response.json();

        // Return the data with CORS headers to allow access from any origin
        return NextResponse.json(data, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Cache-Control': 'max-age=3600'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch DAL history data' },
            { status: 500 }
        );
    }
} 