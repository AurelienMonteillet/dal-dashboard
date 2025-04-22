import { NextResponse } from 'next/server';

const JSON_URL = process.env.NEXT_PUBLIC_JSON_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats.json';

/**
 * GET handler for current DAL statistics
 */
export async function GET() {
    try {
        // Fetch the stats from the source
        const response = await fetch(JSON_URL, {
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.status}`);
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
            { error: 'Failed to fetch DAL statistics' },
            { status: 500 }
        );
    }
} 