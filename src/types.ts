// Type definitions

export interface Person {
    EjamaatID: number;
    Full_Name: string;
    FLOOR: string;
    ROW: string;
    SEAT: string;
    Quran_Sanad: string;
    Talim: string;
    Contact_No: string;
    Is_Updated: boolean;
}

export interface PendingChange {
    EjamaatID: number;
    Quran_Sanad: string;
    Talim: string;
    Contact_No: string;
    Is_Updated: boolean;
    timestamp: number;
}

export interface SyncMeta {
    lastSync: number | null;
    lastSyncStatus: 'success' | 'failed' | 'syncing' | 'idle';
}

export interface AuthState {
    loggedInITS: number | null;
    allowedITS: number[];
}
