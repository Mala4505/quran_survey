// Search service — fast in-memory partial match across 5000+ records

import { getAllPeople } from './db';
import type { Person } from '../types';

let cachedPeople: Person[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

async function getCachedPeople(): Promise<Person[]> {
    const now = Date.now();
    if (!cachedPeople || now - cacheTimestamp > CACHE_TTL) {
        cachedPeople = await getAllPeople();
        cacheTimestamp = now;
    }
    return cachedPeople;
}

export function invalidateSearchCache(): void {
    cachedPeople = null;
}

export async function searchPeople(query: string): Promise<Person[]> {
    if (!query || query.trim().length === 0) return [];

    const people = await getCachedPeople();
    const q = query.trim().toLowerCase();
    const results: Person[] = [];

    for (const person of people) {
        if (results.length >= 50) break;

        const itsStr = String(person.EjamaatID);
        const name = (person.Full_Name || '').toLowerCase();
        const row = (person.ROW || '').toLowerCase();
        const seat = (person.SEAT || '').toLowerCase();

        if (
            itsStr.includes(q) ||
            name.includes(q) ||
            row.includes(q) ||
            seat.includes(q)
        ) {
            results.push(person);
        }
    }

    return results;
}
