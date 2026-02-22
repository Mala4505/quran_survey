import { useState, useEffect, useCallback, useRef } from 'react';
import LoginScreen from './components/LoginScreen';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import RecordView from './components/RecordView';
import Toast from './components/Toast';
import SyncStatus from './components/SyncStatus';
import { getLoggedInITS, setLoggedInITS, getPendingChangeCount } from './services/db';
import { startSyncScheduler, stopSyncScheduler, performSync, isInSyncWindow } from './services/sync';
import { APPS_SCRIPT_URL } from './config';
import type { Person } from './types';

export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [currentITS, setCurrentITS] = useState<number | null>(null);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [syncState, setSyncState] = useState<{ status: string; message?: string }>({ status: 'idle' });
    const [pendingCount, setPendingCount] = useState(0);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const syncStartedRef = useRef(false);

    // Check auth state on mount
    useEffect(() => {
        (async () => {
            const its = await getLoggedInITS();
            if (its) {
                setCurrentITS(its);
                setLoggedIn(true);
            }
            setCheckingAuth(false);
        })();
    }, []);

    // Refresh pending count periodically
    useEffect(() => {
        if (!loggedIn) return;
        const refresh = async () => {
            const count = await getPendingChangeCount();
            setPendingCount(count);
        };
        refresh();
        const id = setInterval(refresh, 10_000);
        return () => clearInterval(id);
    }, [loggedIn, selectedPerson]);

    // Start sync scheduler when logged in
    useEffect(() => {
        if (!loggedIn || !currentITS || syncStartedRef.current) return;
        syncStartedRef.current = true;

        const onSyncStatus = (status: string, message?: string) => {
            setSyncState({ status, message });
            if (status === 'success') {
                showToast('Data synced successfully', 'success');
                getPendingChangeCount().then(setPendingCount);
            } else if (status === 'failed') {
                showToast(message || 'Sync failed', 'error');
            }
        };

        startSyncScheduler(currentITS, onSyncStatus);

        return () => {
            stopSyncScheduler();
            syncStartedRef.current = false;
        };
    }, [loggedIn, currentITS]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'warning') => {
        setToast({ message, type });
    }, []);

    const handleLogin = useCallback(async (its: number) => {
        setCurrentITS(its);
        await setLoggedInITS(its);
        setLoggedIn(true);
        showToast('Logged in successfully', 'success');
    }, [showToast]);

    const handleLogout = useCallback(async () => {
        await setLoggedInITS(null);
        setCurrentITS(null);
        setLoggedIn(false);
        setSelectedPerson(null);
        stopSyncScheduler();
        syncStartedRef.current = false;
    }, []);

    const handleSelectPerson = useCallback((person: Person) => {
        setSelectedPerson(person);
    }, []);

    const handleBack = useCallback(() => {
        setSelectedPerson(null);
    }, []);

    const handleSaved = useCallback(() => {
        showToast('Saved offline', 'success');
        getPendingChangeCount().then(setPendingCount);
    }, [showToast]);

    const handleManualSync = useCallback(async () => {
        if (!currentITS || !APPS_SCRIPT_URL) {
            showToast('Sync endpoint not configured', 'error');
            return;
        }
        if (!navigator.onLine) {
            showToast('No internet connection', 'error');
            return;
        }
        await performSync(currentITS, (status, message) => {
            setSyncState({ status, message });
            if (status === 'success') {
                showToast('Data synced successfully', 'success');
                getPendingChangeCount().then(setPendingCount);
            } else if (status === 'failed') {
                showToast(message || 'Sync failed', 'error');
            }
        });
    }, [currentITS, showToast]);

    if (checkingAuth) {
        return (
            <div className="app-loading">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!loggedIn) {
        return (
            <>
                <LoginScreen onLogin={handleLogin} showToast={showToast} />
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-top">
                    <h1 className="app-title">Quran Survey</h1>
                    <button className="btn-logout" onClick={handleLogout} title="Logout">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16,17 21,12 16,7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
                <SyncStatus
                    syncState={syncState}
                    pendingCount={pendingCount}
                    onManualSync={handleManualSync}
                />
            </header>

            <main className="app-main">
                {selectedPerson ? (
                    <RecordView
                        person={selectedPerson}
                        onBack={handleBack}
                        onSaved={handleSaved}
                    />
                ) : (
                    <>
                        <SearchBar onSelectPerson={handleSelectPerson} />
                    </>
                )}
            </main>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
