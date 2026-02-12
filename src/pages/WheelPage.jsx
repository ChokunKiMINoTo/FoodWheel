import { useState, useMemo, useCallback } from 'react';
import SpinWheel from '../components/SpinWheel';
import FilterPanel from '../components/FilterPanel';
import ResultCard from '../components/ResultCard';
import HistoryBar from '../components/HistoryBar';
import { useRestaurants } from '../context/RestaurantContext';
import { filterRestaurants } from '../store/restaurantStore';

const defaultFilters = {
    cuisines: [],
    maxTime: null,
    peopleCount: null,
    openNow: false,
    favoritesOnly: false,
};

export default function WheelPage() {
    const { restaurants, history, excluded, addToHistory, addExcluded, clearExcluded } = useRestaurants();
    const [filters, setFilters] = useState(defaultFilters);
    const [result, setResult] = useState(null);
    const [spinning, setSpinning] = useState(false);

    const candidates = useMemo(() => {
        return filterRestaurants(restaurants, {
            ...filters,
            excludeIds: excluded,
        });
    }, [restaurants, filters, excluded]);

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
