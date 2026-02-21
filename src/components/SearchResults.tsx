import type { Person } from '../types';

interface SearchResultsProps {
    results: Person[];
    onSelect: (person: Person) => void;
}

export default function SearchResults({ results, onSelect }: SearchResultsProps) {
    return (
        <div className="search-results">
            {results.map((person) => (
                <button
                    key={person.EjamaatID}
                    className={`result-card ${person.Is_Updated ? 'result-updated' : ''}`}
                    onClick={() => onSelect(person)}
                    id={`result-${person.EjamaatID}`}
                >
                    <div className="result-header">
                        <div className="result-name">{person.Full_Name || 'Unknown'}</div>
                        {person.Is_Updated && (
                            <span className="updated-badge" title="Updated">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                Updated
                            </span>
                        )}
                    </div>
                    <div className="result-details">
                        <span className="result-its">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {person.EjamaatID}
                        </span>
                        <span className="result-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Row {person.ROW} · Seat {person.SEAT}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}
