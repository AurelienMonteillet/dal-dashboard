import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Chemin correct vers le fichier dal_status.json dans le dossier public
const DAL_STATUS_PATH = path.join(process.cwd(), 'public', 'dal_status.json');

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
    const { address } = params;
    try {
        const file = await fs.readFile(DAL_STATUS_PATH, 'utf-8');
        const json = JSON.parse(file);
        const baker = json.data[address];
        if (!baker) {
            return NextResponse.json({ error: 'Baker not found' }, { status: 404 });
        }
        return NextResponse.json(baker, { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: 'Erreur lors de la lecture du statut DAL' }, { status: 500 });
    }
} 