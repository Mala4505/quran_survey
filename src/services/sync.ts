// Sync service — handles scheduled sync with Google Apps Script endpoint

import {
    getAllPendingChanges,
    clearPendingChanges,
    replaceAllPeople,
    updateSyncMeta,
    getSyncMeta,
    setAllowedITS,
} from './db';
import { invalidateSearchCache } from './search';
import { APPS_SCRIPT_URL, SYNC_WINDOWS, SYNC_RETRY_INTERVAL, SYNC_CHECK_INTERVAL } from '../config';
import type { Person } from '../types';

type SyncCallback = (status: 'syncing' | 'success' | 'failed', message?: string) => void;

let syncIntervalId: ReturnType<typeof setInterval> | null = null;
let lastSyncAttempt = 0;

export function isInSyncWindow(): boolean {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    return SYNC_WINDOWS.some(({ start, end }) => {
        if (end > 24) {
            // Window crosses midnight (e.g., 23–26 means 23:00–02:00)
            return currentHour >= start || currentHour < end - 24;
        }
        return currentHour >= start && currentHour < end;
    });
}

export async function fetchFullDataset(): Promise<Person[]> {
    if (!APPS_SCRIPT_URL) {
        throw new Error('Apps Script URL not configured');
    }

    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return data.people || data;
}

export async function uploadChanges(loggedInITS: number): Promise<boolean> {
    if (!APPS_SCRIPT_URL) {
        throw new Error('Apps Script URL not configured');
    }

    const pendingChanges = await getAllPendingChanges();
    if (pendingChanges.length === 0) return true;

    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            itsNumber: loggedInITS,
            updates: pendingChanges.map((c) => ({
                EjamaatID: c.EjamaatID,
                Quran_Sanad: c.Quran_Sanad,
                Talim: c.Talim,
                Contact_No: c.Contact_No,
                Is_Updated: c.Is_Updated,
            })),
        }),
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.success !== false;
}

export async function performSync(
    loggedInITS: number,
    onStatus?: SyncCallback
): Promise<boolean> {
    try {
        onStatus?.('syncing');
        await updateSyncMeta({ lastSync: null, lastSyncStatus: 'syncing' });

        // Step 1: Upload pending changes
        const ok = await uploadChanges(loggedInITS);

        // Step 2: Only clear if backend confirmed success
        if (ok) {
            await clearPendingChanges();
        }


        // Step 3: Download full dataset
        const people = await fetchFullDataset();

        // Step 4: Replace local dataset
        await replaceAllPeople(people);

        // Step 5: Update allowed ITS list from full dataset
        const allITS = people.map((p) => p.EjamaatID);
        await setAllowedITS(allITS);

        // Step 6: Invalidate search cache
        invalidateSearchCache();

        // Step 7: Update meta
        const now = Date.now();
        await updateSyncMeta({ lastSync: now, lastSyncStatus: 'success' });

        onStatus?.('success', `Synced at ${new Date(now).toLocaleTimeString()}`);
        return true;
    } catch (error) {
        const meta = await getSyncMeta();
        await updateSyncMeta({ ...meta, lastSyncStatus: 'failed' });
        onStatus?.('failed', error instanceof Error ? error.message : 'Sync failed');
        return false;
    }
}

export function startSyncScheduler(
    loggedInITS: number,
    onStatus?: SyncCallback
): void {
    if (syncIntervalId) return; // Already running

    syncIntervalId = setInterval(async () => {
        if (!isInSyncWindow()) return;

        const now = Date.now();
        if (now - lastSyncAttempt < SYNC_RETRY_INTERVAL) return;

        if (!navigator.onLine) return;

        lastSyncAttempt = now;
        await performSync(loggedInITS, onStatus);
    }, SYNC_CHECK_INTERVAL);
}

export function stopSyncScheduler(): void {
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
    }
}
