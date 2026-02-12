import { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    getRestaurants as loadRestaurants,
    saveRestaurants as persistRestaurants,
    addRestaurant as storeAdd,
    updateRestaurant as storeUpdate,
    deleteRestaurant as storeDelete,
    getHistory as loadHistory,
    addToHistory as storeAddHistory,
    clearHistory as storeClearHistory,
    getExcluded as loadExcluded,
    addExcluded as storeAddExcluded,
    clearExcluded as storeClearExcluded,
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
};

function reducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_RESTAURANTS:
            return { ...state, restaurants: action.payload };
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

// ─── Context ───────────────────────────

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, null, () => ({
        restaurants: loadRestaurants(),
        history: loadHistory(),
        excluded: loadExcluded(),
    }));

    const addRestaurant = useCallback((data) => {
        const item = storeAdd(data);
        dispatch({ type: ActionTypes.ADD_RESTAURANT, payload: item });
        return item;
    }, []);

    const updateRestaurant = useCallback((id, data) => {
        storeUpdate(id, data);
        dispatch({ type: ActionTypes.UPDATE_RESTAURANT, payload: { id, data } });
    }, []);

    const deleteRestaurant = useCallback((id) => {
        storeDelete(id);
        dispatch({ type: ActionTypes.DELETE_RESTAURANT, payload: id });
    }, []);

    const addToHistory = useCallback((restaurant) => {
        const newHistory = storeAddHistory(restaurant);
        dispatch({ type: ActionTypes.SET_HISTORY, payload: newHistory });
        return newHistory;
    }, []);

    const clearHistory = useCallback(() => {
        storeClearHistory();
        dispatch({ type: ActionTypes.CLEAR_HISTORY });
    }, []);

    const addExcluded = useCallback((id) => {
        const newEx = storeAddExcluded(id);
        dispatch({ type: ActionTypes.SET_EXCLUDED, payload: [...newEx] });
        return newEx;
    }, []);

    const clearExcluded = useCallback(() => {
        storeClearExcluded();
        dispatch({ type: ActionTypes.CLEAR_EXCLUDED });
    }, []);

    const importRestaurants = useCallback((csvText) => {
        const imported = importCSV(csvText);
        if (imported.length === 0) return { success: false, count: 0 };
        const merged = [...loadRestaurants(), ...imported];
        persistRestaurants(merged);
        dispatch({ type: ActionTypes.SET_RESTAURANTS, payload: merged });
        return { success: true, count: imported.length };
    }, []);

    const handleExportCSV = useCallback(() => {
        return exportCSV(state.restaurants);
    }, [state.restaurants]);

    const value = {
        restaurants: state.restaurants,
        history: state.history,
        excluded: state.excluded,
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
