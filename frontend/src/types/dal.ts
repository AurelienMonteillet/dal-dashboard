export interface DALStats {
    // Horodatage de la collecte des statistiques
    timestamp: string;
    // Cycle actuel du réseau Tezos
    cycle: number;
    // Nombre total de bakers sur le réseau
    total_bakers: number;
    // Nombre de bakers actifs participant au DAL
    dal_active_bakers: number;
    // Nombre de bakers inactifs pour le DAL
    dal_inactive_bakers: number;
    // Nombre de bakers non classifiés
    unclassified_bakers: number;
    // Nombre de bakers qui n'attestent pas
    non_attesting_bakers: number;
    // Pourcentage du pouvoir de baking participant au DAL
    dal_baking_power_percentage: number;
    // Pouvoir de baking total sur le réseau
    total_baking_power: number;
    // Pouvoir de baking des participants au DAL
    dal_baking_power: number;
} 