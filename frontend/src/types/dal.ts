export interface DALStats {
    // Timestamp of statistics collection
    timestamp: string;
    // Current cycle of the Tezos network
    cycle: number;
    // Total number of bakers on the network
    total_bakers: number;
    // Number of active bakers participating in DAL
    dal_active_bakers: number;
    // Number of inactive bakers for DAL
    dal_inactive_bakers: number;
    // Number of unclassified bakers
    unclassified_bakers: number;
    // Number of non-attesting bakers
    non_attesting_bakers: number;
    // Percentage of baking power participating in DAL
    dal_baking_power_percentage: number;
    // Total baking power on the network
    total_baking_power: number;
    // Baking power of DAL participants
    dal_baking_power: number;
} 