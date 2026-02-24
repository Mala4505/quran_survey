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
      return currentHour >= start || currentHour < end - 24;
    }
    return currentHour >= start && currentHour < end;
  });
}

export async function fetchFullDataset(): Promise<Person[]> {
  if (!APPS_SCRIPT_URL) throw new Error('Apps Script URL not configured');

  const response = await fetch(APPS_SCRIPT_URL, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

  const data = await response.json();
  return data.people || data;
}

export async function uploadChanges(loggedInITS: number): Promise<boolean> {
  if (!APPS_SCRIPT_URL) throw new Error('Apps Script URL not configured');

  const pendingChanges = await getAllPendingChanges();
  if (pendingChanges.length === 0) {
    console.log('[SYNC] No pending changes to upload');
    return true;
  }

  console.log('[SYNC] Uploading changes count:', pendingChanges.length);

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

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

  const result = await response.json();
  console.log('[SYNC] Upload response:', result);

  return result.success === true;
}

export async function performSync(loggedInITS: number, onStatus?: SyncCallback): Promise<boolean> {
  try {
    onStatus?.('syncing');
    console.log('[SYNC] Starting sync for ITS:', loggedInITS);

    await updateSyncMeta({ lastSync: null, lastSyncStatus: 'syncing' });

    // Step 1: Upload pending changes (if any)
    const ok = await uploadChanges(loggedInITS);
    if (ok) {
      await clearPendingChanges();
      console.log('[SYNC] Cleared local pending changes');
    } else {
      console.warn('[SYNC] Upload failed, keeping local pending changes for retry');
    }

    // Step 2: Always refresh dataset from Sheets
    const people = await fetchFullDataset();
    console.log('[SYNC] Downloaded dataset count:', people.length);

    await replaceAllPeople(people);
    console.log('[SYNC] Local dataset replaced with latest from Sheets');

    // Step 3: Update ITS list and cache
    const allITS = people.map((p) => p.EjamaatID);
    await setAllowedITS(allITS);
    invalidateSearchCache();

    // Step 4: Update meta
    const now = Date.now();
    await updateSyncMeta({ lastSync: now, lastSyncStatus: 'success' });

    onStatus?.('success', `Synced at ${new Date(now).toLocaleTimeString()}`);
    console.log('[SYNC] Completed successfully at', new Date(now).toISOString());

    return true;
  } catch (error) {
    console.error('[SYNC] Error during sync:', error);
    const meta = await getSyncMeta();
    await updateSyncMeta({ ...meta, lastSyncStatus: 'failed' });
    onStatus?.('failed', error instanceof Error ? error.message : 'Sync failed');
    return false;
  }
}


export function startSyncScheduler(loggedInITS: number, onStatus?: SyncCallback): void {
  if (syncIntervalId) return; // Already running

  syncIntervalId = setInterval(async () => {
    if (!isInSyncWindow()) return;

    const now = Date.now();
    if (now - lastSyncAttempt < SYNC_RETRY_INTERVAL) return;

    if (!navigator.onLine) {
      console.warn('[SYNC] Skipped sync — offline');
      return;
    }

    lastSyncAttempt = now;
    await performSync(loggedInITS, onStatus);
  }, SYNC_CHECK_INTERVAL);
}

export function stopSyncScheduler(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('[SYNC] Scheduler stopped');
  }
}
