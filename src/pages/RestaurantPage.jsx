import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import RestaurantForm from '../components/RestaurantForm';
import { useRestaurants } from '../context/RestaurantContext';
import { isOpenNow } from '../store/restaurantStore';

export default function RestaurantPage() {
    const {
        restaurants,
        loading,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        importRestaurants,
        exportCSV,
    } = useRestaurants();

    if (loading) {
        return (
            <div className="restaurant-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--dora-text-light)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🍽️</div>
                    Loading restaurants...
                </div>
            </div>
        );
    }

    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null); // null | 'new' | restaurant obj
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');
    const [importResult, setImportResult] = useState(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return restaurants;
        const q = search.toLowerCase();
        return restaurants.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.cuisineTypes.some((c) => c.toLowerCase().includes(q)) ||
                (r.location || '').toLowerCase().includes(q)
        );
    }, [restaurants, search]);

    const handleSave = useCallback((formData) => {
        if (editing && editing !== 'new' && editing.id) {
            updateRestaurant(editing.id, formData);
        } else {
            addRestaurant(formData);
        }
        setEditing(null);
    }, [editing, updateRestaurant, addRestaurant]);

    const handleDelete = useCallback((id) => {
        if (confirm('Delete this restaurant?')) {
            deleteRestaurant(id);
        }
    }, [deleteRestaurant]);

    const handleExport = useCallback(() => {
        const csv = exportCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'foodwheel_restaurants.csv';
        a.click();
        URL.revokeObjectURL(url);
    }, [exportCSV]);

    const handleImport = useCallback(() => {
        try {
            const result = importRestaurants(importText);
            if (!result.success) {
                setImportResult({ success: false, message: 'No valid rows found' });
                return;
            }
            setImportResult({ success: true, message: `Imported ${result.count} restaurants!` });
            setTimeout(() => {
                setShowImport(false);
                setImportText('');
                setImportResult(null);
            }, 1500);
        } catch (err) {
            setImportResult({ success: false, message: 'Error parsing CSV: ' + err.message });
        }
    }, [importText, importRestaurants]);

    const toggleFav = useCallback((id) => {
        const target = restaurants.find((r) => r.id === id);
        if (target) {
            updateRestaurant(id, { isFavorite: !target.isFavorite });
        }
    }, [restaurants, updateRestaurant]);

    return (
        <div className="restaurant-page">
            <div className="page-header">
                <h1 className="page-title">🍽️ My Restaurants</h1>
                <div className="toolbar">
                    <div className="search-box">
                        <span className="search-icon" aria-hidden="true">🔍</span>
                        <input
                            placeholder="Search restaurants..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search restaurants"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setEditing('new')}>
                        ➕ Add New
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
                        📥 Import CSV
                    </button>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        📤 Export
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-illustration" aria-hidden="true">🍜</div>
                    <h3>{search ? 'No matches found' : "You don't have any restaurants yet"}</h3>
                    <p>{search ? 'Try a different search term' : 'Add your first restaurant to get started!'}</p>
                    {!search && (
                        <button className="btn btn-primary" onClick={() => setEditing('new')}>
                            ➕ Add your first restaurant
                        </button>
                    )}
                    {search && (
                        <button className="btn btn-secondary" onClick={() => setSearch('')}>
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <div className="restaurant-grid">
                    {filtered.map((r) => (
                        <div key={r.id} className="dora-card restaurant-card" onClick={() => setEditing(r)}>
                            <div className="card-header">
                                <div className="card-name">
                                    {r.isFavorite && <span className="fav-badge">⭐ </span>}
                                    {r.name}
                                </div>
                                <div className="card-price">{r.priceRange ? `฿${r.priceRange}` : ''}</div>
                            </div>
                            <div className="card-cuisines">
                                {r.cuisineTypes.map((c) => (
                                    <span key={c} className="chip" style={{ cursor: 'default', fontSize: '0.75rem', padding: '2px 8px' }}>{c}</span>
                                ))}
                            </div>
                            <div className="card-meta">
                                <span>⏱️ {r.timeToServe}m</span>
                                <span>👥 {r.minPeople}-{r.maxPeople}</span>
                                <span>{isOpenNow(r) ? '🟢 Open' : '🔴 Closed'}</span>
                            </div>
                            {r.location && (
                                <div className="card-meta mt-8">
                                    <span>📍 {r.location}</span>
                                </div>
                            )}
                            {r.openHours && (
                                <div className="card-meta mt-8">
                                    <span>🕐 {r.openHours}</span>
                                </div>
                            )}
                            <div className="star-rating mt-8" aria-label={`Rating: ${r.rating || 0} out of 5`}>
                                <span style={{ fontWeight: 700, color: 'var(--dora-yellow)' }}>⭐ {(r.rating || 0).toFixed(1)}</span>
                            </div>
                            <div className="card-actions">
                                <button
                                    className="btn btn-sm btn-yellow"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFav(r.id);
                                    }}
                                >
                                    {r.isFavorite ? '💔 Unfav' : '⭐ Fav'}
                                </button>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditing(r);
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(r.id);
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Drawer */}
            {editing && (
                <RestaurantForm
                    restaurant={editing === 'new' ? null : editing}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                />
            )}

            {/* Import Modal */}
            {showImport && (
                <div className="modal-overlay" onClick={() => setShowImport(false)} role="dialog" aria-modal="true" aria-label="Import CSV">
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="drawer-title">📥 Import CSV</span>
                            <button className="drawer-close" onClick={() => setShowImport(false)} aria-label="Close import dialog">✕</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 12, fontSize: '0.9rem', color: 'var(--dora-text-light)' }}>
                                Paste your CSV data below. First row should be headers:
                                <br />
                                <code style={{ fontSize: '0.75rem' }}>
                                    name,cuisineTypes,priceRange,location,timeToServe,...
                                </code>
                            </p>
                            <textarea
                                className="form-input"
                                rows={8}
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder="Paste CSV content here..."
                                aria-label="CSV content"
                            />
                            {importResult && (
                                <div
                                    role="alert"
                                    style={{
                                        marginTop: 12,
                                        padding: '10px 14px',
                                        borderRadius: 'var(--dora-radius-sm)',
                                        background: importResult.success ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                                        color: importResult.success ? '#2ecc71' : 'var(--dora-red)',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    {importResult.message}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowImport(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleImport}
                                disabled={!importText.trim()}
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
