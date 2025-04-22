import { NextRequest, NextResponse } from 'next/server';

const HISTORY_URL = process.env.NEXT_PUBLIC_HISTORY_URL || 'https://aurelienmonteillet.github.io/dal-dashboard/dal_stats_history.json';

/**
 * GET handler for specific cycle statistics
 */
export async function GET(
    request: Request,
    context: { params: Promise<{ cycle: string }> }
) {
    try {
        const params = await context.params;
        const cycle = parseInt(params.cycle);

        if (isNaN(cycle)) {
            return NextResponse.json(
                { error: 'Invalid cycle parameter' },
                { status: 400 }
            );
        }

        // Fetch all history data
        const response = await fetch(HISTORY_URL, {
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.status}`);
        }

        // Find the specific cycle
        const allData = await response.json();
        const cycleData = allData.find((entry: any) => entry.cycle === cycle);

        if (!cycleData) {
            return NextResponse.json(
                { error: `No data found for cycle ${cycle}` },
                { status: 404 }
            );
        }

        // Return the data with CORS headers
        return NextResponse.json(cycleData, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Cache-Control': 'max-age=3600'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cycle data' },
            { status: 500 }
        );
    }
} 