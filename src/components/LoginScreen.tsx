import { useState, useCallback } from 'react';
import { isITSAllowed, setLoggedInITS, getAllPeople, replaceAllPeople, setAllowedITS } from '../services/db';
import { fetchFullDataset } from '../services/sync';
import { APPS_SCRIPT_URL } from '../config';

interface LoginScreenProps {
    onLogin: (its: number) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function LoginScreen({ onLogin, showToast }: LoginScreenProps) {
    const [itsInput, setItsInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const its = parseInt(itsInput.trim(), 10);
        if (isNaN(its) || itsInput.trim().length === 0) {
            setError('Please enter a valid ITS number');
            return;
        }

        setLoading(true);

        try {
            // Check if ITS is allowed (local check first)
            const allowed = await isITSAllowed(its);
            if (!allowed) {
                setError('ITS number not authorized');
                setLoading(false);
                return;
            }

            // Check if data already exists locally
            const existingPeople = await getAllPeople();

            if (existingPeople.length === 0 && APPS_SCRIPT_URL) {
                // First login — download full dataset
                try {
                    const people = await fetchFullDataset();
                    await replaceAllPeople(people);
                    const allITS = people.map(p => p.EjamaatID);
                    await setAllowedITS(allITS);

                    // Re-check if the ITS is in the full dataset
                    if (!allITS.includes(its)) {
                        setError('ITS number not found in the database');
                        setLoading(false);
                        return;
                    }
                } catch {
                    // If fetch fails, allow login with seed ITS
                    if (!allowed) {
                        setError('Cannot connect to server and ITS not in seed list');
                        setLoading(false);
                        return;
                    }
                    showToast('Logged in with cached data (offline)', 'info');
                }
            }

            await setLoggedInITS(its);
            onLogin(its);
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [itsInput, onLogin, showToast]);

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <h1 className="login-title">Quran Status Update</h1>
                <p className="login-subtitle">Enter your ITS number to continue</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            id="its-input"
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="ITS Number"
                            value={itsInput}
                            onChange={(e) => {
                                setItsInput(e.target.value);
                                setError('');
                            }}
                            className={`login-input ${error ? 'input-error' : ''}`}
                            disabled={loading}
                            autoFocus
                            autoComplete="off"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-login" disabled={loading || !itsInput.trim()}>
                        {loading ? (
                            <span className="btn-loading">
                                <span className="spinner spinner-sm" />
                                <span>Connecting...</span>
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
