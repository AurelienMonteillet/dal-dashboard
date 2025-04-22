'use client';

import './globals.css';
import { Inter } from 'next/font/google';

// Police Google Fonts
const inter = Inter({ subsets: ['latin'] });

// Métadonnées pour la page
export const metadata = {
  title: 'Tableau de bord DAL Tezos',
  description: 'Tableau de bord pour la participation au DAL (Couche d\'Disponibilité des Données) sur le réseau Tezos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Inclure jQuery pour permettre d'autres fonctionnalités plus tard */}
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" defer></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
