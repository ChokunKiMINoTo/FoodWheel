import { v4 as uuidv4 } from 'uuid';
import { sampleRestaurants } from './sampleData';

const STORAGE_KEY = 'foodwheel_restaurants';
const HISTORY_KEY = 'foodwheel_history';
const EXCLUDED_KEY = 'foodwheel_excluded';

// ──────── Helpers ────────

function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ──────── Restaurants CRUD ────────

export function getRestaurants() {
    let list = loadFromStorage(STORAGE_KEY, null);
    if (list === null) {
        list = sampleRestaurants;
        saveToStorage(STORAGE_KEY, list);
    }
    return list;
}

export function saveRestaurants(list) {
    saveToStorage(STORAGE_KEY, list);
}

export function addRestaurant(data) {
    const list = getRestaurants();
    const newItem = { ...data, id: uuidv4() };
    list.push(newItem);
    saveRestaurants(list);
    return newItem;
}

export function updateRestaurant(id, data) {
    const list = getRestaurants();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, id };
    saveRestaurants(list);
    return list[idx];
}

export function deleteRestaurant(id) {
    let list = getRestaurants();
    list = list.filter((r) => r.id !== id);
    saveRestaurants(list);
    return list;
}

// ──────── History ────────

export function getHistory() {
    return loadFromStorage(HISTORY_KEY, []);
}

export function addToHistory(restaurant) {
    const history = getHistory();
    history.unshift({
        ...restaurant,
        pickedAt: new Date().toISOString(),
    });
    if (history.length > 50) history.length = 50;
    saveToStorage(HISTORY_KEY, history);
    return history;
}

export function clearHistory() {
    saveToStorage(HISTORY_KEY, []);
}

// ──────── Excluded (session) ────────

export function getExcluded() {
    return loadFromStorage(EXCLUDED_KEY, []);
}

export function addExcluded(id) {
    const ex = getExcluded();
    if (!ex.includes(id)) ex.push(id);
    saveToStorage(EXCLUDED_KEY, ex);
    return ex;
}

export function clearExcluded() {
    saveToStorage(EXCLUDED_KEY, []);
}

// ──────── Filters ────────

export function filterRestaurants(restaurants, filters) {
    const {
        priceLevels = [],
        cuisines = [],
        maxTime = null,
        peopleCount = null,
        openNow = false,
        favoritesOnly = false,
        excludeIds = [],
    } = filters;

    return restaurants.filter((r) => {
        if (excludeIds.includes(r.id)) return false;
        if (priceLevels.length > 0 && !priceLevels.includes(r.priceRange)) return false;
        if (cuisines.length > 0 && !r.cuisineTypes.some((c) => cuisines.includes(c))) return false;
        if (maxTime !== null && r.timeToServe > maxTime) return false;
        if (peopleCount !== null) {
            if (peopleCount < r.minPeople || peopleCount > r.maxPeople) return false;
        }
        if (openNow && !r.isOpenNow) return false;
        if (favoritesOnly && !r.isFavorite) return false;
        return true;
    });
}

// ──────── CSV Export / Import ────────

export function exportCSV(restaurants) {
    const headers = [
        'name', 'cuisineTypes', 'priceRange', 'location', 'timeToServe',
        'minPeople', 'maxPeople', 'isOpenNow', 'dineOptions', 'dietTags',
        'spiceLevel', 'rating', 'notes', 'linkGoogleMaps', 'websiteLink',
    ];
    const rows = restaurants.map((r) =>
        headers.map((h) => {
            const val = r[h];
            if (Array.isArray(val)) return `"${val.join(', ')}"`;
            if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
            return val ?? '';
        }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}

export function importCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^,]+|(?<=,)(?=,))/g) || [];
        const obj = { id: uuidv4() };
        headers.forEach((h, idx) => {
            let val = (values[idx] || '').replace(/^"|"$/g, '').trim();
            if (['cuisineTypes', 'dineOptions', 'dietTags'].includes(h)) {
                obj[h] = val ? val.split(',').map((s) => s.trim()) : [];
            } else if (['timeToServe', 'minPeople', 'maxPeople', 'rating'].includes(h)) {
                obj[h] = parseInt(val, 10) || 0;
            } else if (h === 'isOpenNow') {
                obj[h] = val === 'true';
            } else {
                obj[h] = val;
            }
        });
        // defaults
        obj.isFavorite = obj.isFavorite || false;
        obj.lastVisitedDate = obj.lastVisitedDate || null;
        obj.imageUrl = obj.imageUrl || '';
        results.push(obj);
    }
    return results;
}
