import { useState, useCallback, useRef, useEffect } from 'react';
import { searchPeople } from '../services/search';
import type { Person } from '../types';
import SearchResults from './SearchResults';

interface SearchBarProps {
    onSelectPerson: (person: Person) => void;
}

export default function SearchBar({ onSelectPerson }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Person[]>([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback((value: string) => {
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!value.trim()) {
            setResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        debounceRef.current = setTimeout(async () => {
            const res = await searchPeople(value);
            setResults(res);
            setSearching(false);
        }, 150);
    }, []);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    id="search-input"
                    type="text"
                    inputMode="search"
                    placeholder="Search by name, ITS, row, or seat..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                    autoComplete="off"
                />
                {query && (
                    <button
                        className="search-clear"
                        onClick={() => handleSearch('')}
                        aria-label="Clear search"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {searching && (
                <div className="search-loading">
                    <span className="spinner spinner-sm" />
                    <span>Searching...</span>
                </div>
            )}

            {!searching && query && results.length === 0 && (
                <div className="search-empty">
                    <p>No results found for "{query}"</p>
                </div>
            )}

            {results.length > 0 && (
                <SearchResults results={results} onSelect={onSelectPerson} />
            )}
        </div>
    );
}
