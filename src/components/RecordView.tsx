import { useState, useCallback, useEffect } from 'react';
import { QURAN_SANAD_OPTIONS, TALIM_OPTIONS } from '../config';
import { savePendingChange, getPerson } from '../services/db';
import { invalidateSearchCache } from '../services/search';
import type { Person } from '../types';

interface RecordViewProps {
    person: Person;
    onBack: () => void;
    onSaved: () => void;
}

export default function RecordView({ person, onBack, onSaved }: RecordViewProps) {
    const [quranSanad, setQuranSanad] = useState(person.Quran_Sanad || '');
    const [talim, setTalim] = useState(person.Talim || '');
    const [contactNo, setContactNo] = useState(person.Contact_No || '');
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Refresh person data from DB (might have been updated)
    useEffect(() => {
        (async () => {
            const fresh = await getPerson(person.EjamaatID);
            if (fresh) {
                setQuranSanad(fresh.Quran_Sanad || '');
                setTalim(fresh.Talim || '');
                setContactNo(fresh.Contact_No || '');
            }
        })();
    }, [person.EjamaatID]);

    const isNoSanad = quranSanad === 'No Sanad';
    const isUpdated = person.Is_Updated;

    const handleQuranSanadChange = useCallback((value: string) => {
        setQuranSanad(value);
        setHasChanges(true);
        // Clear Talim if not "No Sanad"
        if (value !== 'No Sanad') {
            setTalim('');
        }
    }, []);

    const handleTalimChange = useCallback((value: string) => {
        setTalim(value);
        setHasChanges(true);
    }, []);

    const handleContactChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setContactNo(e.target.value);
        setHasChanges(true);
    }, []);

    const handleSave = useCallback(async () => {
        if (!quranSanad || !contactNo.trim()) return;

        setSaving(true);
        try {
            await savePendingChange({
                EjamaatID: person.EjamaatID,
                Quran_Sanad: quranSanad,
                Talim: isNoSanad ? talim : '',
                Contact_No: contactNo.trim(),
                Is_Updated: true,
                timestamp: Date.now(),
            });
            invalidateSearchCache();
            setHasChanges(false);
            onSaved();
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    }, [person.EjamaatID, quranSanad, talim, contactNo, isNoSanad, onSaved]);

    return (
        <div className="record-view">
            <button className="btn-back" onClick={onBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6" />
                </svg>
                Back to Search
            </button>

            {/* Is_Updated Indicator at the top */}
            {isUpdated && (
                <div className="updated-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                    </svg>
                    <span>Record Already Updated</span>
                </div>
            )}

            {/* Person Info Card */}
            <div className="person-card">
                <div className="person-avatar">
                    {(person.Full_Name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="person-info">
                    <div className="name-wrapper">
                        <h2 className="person-name">{person.Full_Name || 'Unknown'}</h2>
                        {isUpdated && <span className="updated-icon-inline" title="Updated">✓</span>}
                    </div>
                    <div className="person-meta">
                        <div className="meta-item">
                            <span className="meta-label">ITS</span>
                            <span className="meta-value">{person.EjamaatID}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Row</span>
                            <span className="meta-value">{person.ROW || '—'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Seat</span>
                            <span className="meta-value">{person.SEAT || '—'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact No Field */}
            <div className="field-section">
                <h3 className="field-title">Contact Number</h3>
                <input
                    type="tel"
                    className="contact-input"
                    placeholder="Enter mobile number"
                    value={contactNo}
                    onChange={handleContactChange}
                />
                {!contactNo.trim() && <span className="field-error">Required before saving</span>}
            </div>

            {/* Quran Sanad Selection */}
            <div className="field-section">
                <h3 className="field-title">Quran Sanad</h3>
                <div className="radio-grid">
                    {QURAN_SANAD_OPTIONS.map((option) => (
                        <label
                            key={option}
                            className={`radio-option ${quranSanad === option ? 'radio-selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="quran_sanad"
                                value={option}
                                checked={quranSanad === option}
                                onChange={() => handleQuranSanadChange(option)}
                            />
                            <span className="radio-label">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Talim (conditional) */}
            <div className={`field-section ${!isNoSanad ? 'field-disabled' : ''}`}>
                <h3 className="field-title">
                    Talim
                    {!isNoSanad && <span className="field-hint"> (select "No Sanad" to enable)</span>}
                </h3>
                <div className="radio-grid radio-grid-small">
                    {TALIM_OPTIONS.map((option) => (
                        <label
                            key={option}
                            className={`radio-option ${talim === option ? 'radio-selected' : ''} ${!isNoSanad ? 'radio-disabled' : ''}`}
                        >
                            <input
                                type="radio"
                                name="talim"
                                value={option}
                                checked={talim === option}
                                onChange={() => handleTalimChange(option)}
                                disabled={!isNoSanad}
                            />
                            <span className="radio-label">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving || !quranSanad || !contactNo.trim() || (!hasChanges && isUpdated)}
                id="save-button"
            >
                {saving ? (
                    <span className="btn-loading">
                        <span className="spinner spinner-sm spinner-white" />
                        <span>Saving...</span>
                    </span>
                ) : (
                    <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17,21 17,13 7,13 7,21" />
                            <polyline points="7,3 7,8 15,8" />
                        </svg>
                        Save Update
                    </>
                )}
            </button>
        </div>
    );
}
