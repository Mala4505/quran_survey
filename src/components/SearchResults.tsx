// import type { Person } from '../types';

// interface SearchResultsProps {
//     results: Person[];
//     onSelect: (person: Person) => void;
// }

// export default function SearchResults({ results, onSelect }: SearchResultsProps) {
//     return (
//         <div className="search-results">
//             {results.map((person) => (
//                 <button
//                     key={person.EjamaatID}
//                     className={`result-card ${person.Is_Updated ? 'result-updated' : ''}`}
//                     onClick={() => onSelect(person)}
//                     id={`result-${person.EjamaatID}`}
//                 >
//                     <div className="result-header">
//                         <div className="result-name">{person.Full_Name || 'Unknown'}</div>
//                         {(person.Is_Updated || person.Quran_Sanad || person.Talim || person.Contact_No) && (
//                             <span className="updated-badge" title="Updated">
//                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                                     <polyline points="20,6 9,17 4,12" />
//                                 </svg>
//                                 Updated
//                             </span>
//                         )}
//                     </div>
//                     <div className="result-details horizontal-compact">
//                         <span className="result-its">
//                             ITS: {person.EjamaatID}
//                         </span>
//                         <span className="divider">|</span>
//                         <span className="result-row">
//                             Row: {person.ROW || '—'}
//                         </span>
//                         <span className="divider">|</span>
//                         <span className="result-seat">
//                             Seat: {person.SEAT || '—'}
//                         </span>
//                     </div>
//                 </button>
//             ))}
//         </div>
//     );
// }

import { RefreshCw } from 'lucide-react';
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
                    {person.Is_Updated && (
                        <span className="updated-badge" title="Updated">
                            <RefreshCw size={16} color="white" strokeWidth={2.5} />
                        </span>
                    )}

                    <div className="result-header">
                        <div className="result-name">{person.Full_Name || 'Unknown'}</div>
                    </div>

                    <div className="result-details horizontal-compact">
                        <span className="result-its">
                            ITS: {person.EjamaatID}
                        </span>
                        <span className="divider">|</span>
                        <span className="result-row">
                            Row: {person.ROW || '—'}
                        </span>
                        <span className="divider">|</span>
                        <span className="result-seat">
                            Seat: {person.SEAT || '—'}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
}