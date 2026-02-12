import { v4 as uuidv4 } from 'uuid';

// ──────── Open Hours Helper ────────

/**
 * Determine if a restaurant is currently open based on its openHours string.
 * Supports formats like "10:00-22:00" and overnight like "17:00-00:00" or "22:00-04:00".
 * Returns false if openHours is empty or unparseable.
 */
export function isOpenNow(restaurant) {
    const hours = restaurant?.openHours;
    if (!hours || typeof hours !== 'string') return false;

    const match = hours.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (!match) return false;

    const openMin = parseInt(match[1]) * 60 + parseInt(match[2]);
    const closeMin = parseInt(match[3]) * 60 + parseInt(match[4]);

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    if (closeMin <= openMin) {
        return nowMin >= openMin || nowMin < closeMin;
    }
    return nowMin >= openMin && nowMin < closeMin;
}

// ──────── CSV Export / Import ────────

const CSV_HEADERS = [
    'name', 'cuisineTypes', 'priceRange', 'location', 'timeToServe',
    'minPeople', 'maxPeople', 'openHours', 'dineOptions', 'rating',
    'notes', 'linkGoogleMaps', 'websiteLink',
];

export function exportCSV(restaurants) {
    const rows = restaurants.map((r) =>
        CSV_HEADERS.map((h) => {
            const val = r[h];
            if (Array.isArray(val)) return `"${val.join(', ')}"`;
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) return `"${val.replace(/"/g, '""')}"`;
            return val ?? '';
        }).join(',')
    );
    return [CSV_HEADERS.join(','), ...rows].join('\n');
}

export function importCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // skip empty lines
        const values = lines[i].match(/(\".*?\"|[^,]+|(?<=,)(?=,))/g) || [];
        const obj = { id: uuidv4() };
        headers.forEach((h, idx) => {
            let val = (values[idx] || '').replace(/^"|"$/g, '').trim();
            if (['cuisineTypes', 'dineOptions'].includes(h)) {
                obj[h] = val ? val.split(',').map((s) => s.trim()) : [];
            } else if (['timeToServe', 'minPeople', 'maxPeople'].includes(h)) {
                obj[h] = parseInt(val, 10) || 0;
            } else if (h === 'rating') {
                obj[h] = parseFloat(val) || 0;
            } else {
                obj[h] = val;
            }
        });
        obj.isFavorite = obj.isFavorite || false;
        obj.lastVisitedDate = obj.lastVisitedDate || null;
        obj.imageUrl = obj.imageUrl || '';
        obj.openHours = obj.openHours || '';
        results.push(obj);
    }
    return results;
}

// ──────── API helpers ────────

export async function fetchRestaurantsFromServer() {
    const res = await fetch('/api/restaurants');
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    const csvText = await res.text();
    return importCSV(csvText);
}

export async function saveRestaurantsToServer(restaurants) {
    const csvText = exportCSV(restaurants);
    const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: csvText,
    });
    if (!res.ok) throw new Error('Failed to save restaurants');
}

// ──────── Filters ────────

export function filterRestaurants(restaurants, filters) {
    const {
        cuisines = [],
        locations = [],
        maxTime = null,
        peopleCount = null,
        openNow = false,
        favoritesOnly = false,
        excludeIds = [],
    } = filters;

    return restaurants.filter((r) => {
        if (excludeIds.includes(r.id)) return false;
        if (cuisines.length > 0 && !r.cuisineTypes.some((c) => cuisines.includes(c))) return false;
        if (locations.length > 0 && !locations.includes(r.location)) return false;
        if (maxTime !== null && r.timeToServe > maxTime) return false;
        if (peopleCount !== null) {
            if (peopleCount < r.minPeople || peopleCount > r.maxPeople) return false;
        }
        if (openNow && !isOpenNow(r)) return false;
        if (favoritesOnly && !r.isFavorite) return false;
        return true;
    });
}
