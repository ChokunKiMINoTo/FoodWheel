import { useState, useMemo, useCallback } from 'react';
import SpinWheel from '../components/SpinWheel';
import FilterPanel from '../components/FilterPanel';
import ResultCard from '../components/ResultCard';
import HistoryBar from '../components/HistoryBar';
import { useRestaurants } from '../context/RestaurantContext';
import { filterRestaurants } from '../store/restaurantStore';

const defaultFilters = {
    cuisines: [],
    locations: [],
    maxTime: null,
    peopleCount: null,
    openNow: false,
    favoritesOnly: false,
};

export default function WheelPage() {
    const { restaurants, loading, history, excluded, addToHistory, addExcluded, clearExcluded } = useRestaurants();

    if (loading) {
        return (
            <div className="wheel-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--dora-text-light)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎡</div>
                    Loading...
                </div>
            </div>
        );
    }

    const [filters, setFilters] = useState(defaultFilters);
    const [result, setResult] = useState(null);
    const [spinning, setSpinning] = useState(false);

    const candidates = useMemo(() => {
        return filterRestaurants(restaurants, {
            ...filters,
            excludeIds: excluded,
        });
    }, [restaurants, filters, excluded]);

    const availableCuisines = useMemo(() => {
        const all = restaurants.flatMap((r) => r.cuisineTypes || []);
        return [...new Set(all)].sort();
    }, [restaurants]);

    const availableLocations = useMemo(() => {
        const all = restaurants.map((r) => r.location).filter(Boolean);
        return [...new Set(all)].sort();
    }, [restaurants]);

    const handleResult = useCallback((restaurant) => {
        setResult(restaurant);
        addToHistory(restaurant);
    }, [addToHistory]);

    const handleExclude = useCallback((id) => {
        addExcluded(id);
        setResult((prev) => (prev?.id === id ? null : prev));
    }, [addExcluded]);

    const handleReset = useCallback(() => {
        setFilters(defaultFilters);
        clearExcluded();
        setResult(null);
    }, [clearExcluded]);

    const handleSpinAgain = useCallback(() => {
        setResult(null);
    }, []);

    return (
        <>
            <div className="wheel-page">
                <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    candidateCount={candidates.length}
                    onReset={handleReset}
                    availableCuisines={availableCuisines}
                    availableLocations={availableLocations}
                />
                <SpinWheel
                    candidates={candidates}
                    onResult={handleResult}
                    spinning={spinning}
                    setSpinning={setSpinning}
                />
                <ResultCard
                    restaurant={result}
                    onSpinAgain={handleSpinAgain}
                    onExclude={handleExclude}
                    spinning={spinning}
                />
            </div>
            <HistoryBar history={history} />
        </>
    );
}
