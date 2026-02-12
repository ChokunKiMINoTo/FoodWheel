import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
    fetchRestaurantsFromServer,
    saveRestaurantsToServer,
    importCSV,
    exportCSV,
} from '../store/restaurantStore';

// ─── Reducer ───────────────────────────

const ActionTypes = {
    SET_RESTAURANTS: 'SET_RESTAURANTS',
    ADD_RESTAURANT: 'ADD_RESTAURANT',
    UPDATE_RESTAURANT: 'UPDATE_RESTAURANT',
    DELETE_RESTAURANT: 'DELETE_RESTAURANT',
    SET_HISTORY: 'SET_HISTORY',
    CLEAR_HISTORY: 'CLEAR_HISTORY',
    SET_EXCLUDED: 'SET_EXCLUDED',
    CLEAR_EXCLUDED: 'CLEAR_EXCLUDED',
    SET_LOADING: 'SET_LOADING',
};

function reducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_LOADING:
            return { ...state, loading: action.payload };
        case ActionTypes.SET_RESTAURANTS:
            return { ...state, restaurants: action.payload, loading: false };
        case ActionTypes.ADD_RESTAURANT:
            return { ...state, restaurants: [...state.restaurants, action.payload] };
        case ActionTypes.UPDATE_RESTAURANT:
            return {
                ...state,
                restaurants: state.restaurants.map((r) =>
                    r.id === action.payload.id ? { ...r, ...action.payload.data, id: r.id } : r
                ),
            };
        case ActionTypes.DELETE_RESTAURANT:
            return {
                ...state,
                restaurants: state.restaurants.filter((r) => r.id !== action.payload),
            };
        case ActionTypes.SET_HISTORY:
            return { ...state, history: action.payload };
        case ActionTypes.CLEAR_HISTORY:
            return { ...state, history: [] };
        case ActionTypes.SET_EXCLUDED:
            return { ...state, excluded: action.payload };
        case ActionTypes.CLEAR_EXCLUDED:
            return { ...state, excluded: [] };
        default:
            return state;
    }
}

// Helper: persist to server (fire-and-forget with error logging)
function persistToServer(restaurants) {
    saveRestaurantsToServer(restaurants).catch((err) =>
        console.error('Failed to persist to server:', err)
    );
}

// ─── Context ───────────────────────────

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, {
        restaurants: [],
        history: [],
        excluded: [],
        loading: true,
    });

    // Fetch restaurants from server on mount
    useEffect(() => {
        fetchRestaurantsFromServer()
            .then((list) => {
                dispatch({ type: ActionTypes.SET_RESTAURANTS, payload: list });
            })
            .catch((err) => {
                console.error('Failed to load restaurants:', err);
                dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            });
    }, []);

    const addRestaurant = useCallback((data) => {
        const item = { ...data, id: uuidv4() };
        dispatch({ type: ActionTypes.ADD_RESTAURANT, payload: item });
        // Persist: we need the updated list, so we build it
        const updated = [...state.restaurants, item];
        persistToServer(updated);
        return item;
    }, [state.restaurants]);

    const updateRestaurant = useCallback((id, data) => {
        dispatch({ type: ActionTypes.UPDATE_RESTAURANT, payload: { id, data } });
        const updated = state.restaurants.map((r) =>
            r.id === id ? { ...r, ...data, id } : r
        );
        persistToServer(updated);
    }, [state.restaurants]);

    const deleteRestaurant = useCallback((id) => {
        dispatch({ type: ActionTypes.DELETE_RESTAURANT, payload: id });
        const updated = state.restaurants.filter((r) => r.id !== id);
        persistToServer(updated);
    }, [state.restaurants]);

    const addToHistory = useCallback((restaurant) => {
        const newHistory = [
            { ...restaurant, pickedAt: new Date().toISOString() },
            ...state.history,
        ].slice(0, 50);
        dispatch({ type: ActionTypes.SET_HISTORY, payload: newHistory });
        return newHistory;
    }, [state.history]);

    const clearHistory = useCallback(() => {
        dispatch({ type: ActionTypes.CLEAR_HISTORY });
    }, []);

    const addExcluded = useCallback((id) => {
        const newEx = [...state.excluded, id];
        dispatch({ type: ActionTypes.SET_EXCLUDED, payload: newEx });
        return newEx;
    }, [state.excluded]);

    const clearExcluded = useCallback(() => {
        dispatch({ type: ActionTypes.CLEAR_EXCLUDED });
    }, []);

    const importRestaurants = useCallback((csvText) => {
        const imported = importCSV(csvText);
        if (imported.length === 0) return { success: false, count: 0 };
        const merged = [...state.restaurants, ...imported];
        dispatch({ type: ActionTypes.SET_RESTAURANTS, payload: merged });
        persistToServer(merged);
        return { success: true, count: imported.length };
    }, [state.restaurants]);

    const handleExportCSV = useCallback(() => {
        return exportCSV(state.restaurants);
    }, [state.restaurants]);

    const value = {
        restaurants: state.restaurants,
        history: state.history,
        excluded: state.excluded,
        loading: state.loading,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        addToHistory,
        clearHistory,
        addExcluded,
        clearExcluded,
        importRestaurants,
        exportCSV: handleExportCSV,
    };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
}

RestaurantProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useRestaurants() {
    const ctx = useContext(RestaurantContext);
    if (!ctx) throw new Error('useRestaurants must be used within <RestaurantProvider>');
    return ctx;
}
