import { memo } from 'react';
import PropTypes from 'prop-types';

function FilterPanel({ filters, setFilters, candidateCount, onReset, availableCuisines, availableLocations }) {
    const toggleChip = (key, value) => {
        setFilters((prev) => {
            const arr = prev[key] || [];
            return {
                ...prev,
                [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
            };
        });
    };

    const toggleBool = (key) => {
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="filter-panel">
            <div className="dora-card">
                {/* People Count */}
                <div className="filter-section">
                    <div className="filter-section-title" id="people-filter-label">👥 People Count</div>
                    <div className="stepper" role="group" aria-labelledby="people-filter-label">
                        <button
                            className="stepper-btn"
                            disabled={!filters.peopleCount || filters.peopleCount <= 1}
                            onClick={() =>
                                setFilters((p) => ({
                                    ...p,
                                    peopleCount: Math.max(1, (p.peopleCount || 1) - 1),
                                }))
                            }
                            aria-label="Decrease people count"
                        >
                            −
                        </button>
                        <span className="stepper-value" aria-live="polite">{filters.peopleCount || '—'}</span>
                        <button
                            className="stepper-btn"
                            onClick={() =>
                                setFilters((p) => ({
                                    ...p,
                                    peopleCount: (p.peopleCount || 0) + 1,
                                }))
                            }
                            aria-label="Increase people count"
                        >
                            +
                        </button>
                        {filters.peopleCount && (
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setFilters((p) => ({ ...p, peopleCount: null }))}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Cuisine */}
                <div className="filter-section">
                    <div className="filter-section-title" id="cuisine-filter-label">🍜 Cuisine</div>
                    <div className="chip-group" role="group" aria-labelledby="cuisine-filter-label" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                        {availableCuisines.map((c) => (
                            <button
                                key={c}
                                className={`chip${(filters.cuisines || []).includes(c) ? ' active' : ''}`}
                                onClick={() => toggleChip('cuisines', c)}
                                aria-pressed={(filters.cuisines || []).includes(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location */}
                {availableLocations.length > 0 && (
                    <div className="filter-section">
                        <div className="filter-section-title" id="location-filter-label">📍 Location</div>
                        <div className="chip-group" role="group" aria-labelledby="location-filter-label" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                            {availableLocations.map((loc) => (
                                <button
                                    key={loc}
                                    className={`chip${(filters.locations || []).includes(loc) ? ' active' : ''}`}
                                    onClick={() => toggleChip('locations', loc)}
                                    aria-pressed={(filters.locations || []).includes(loc)}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Max Time */}
                <div className="filter-section">
                    <div className="filter-section-title">⏱️ Max Time (minutes)</div>
                    <div className="flex items-center gap-8">
                        <input
                            type="range"
                            min={5}
                            max={60}
                            step={5}
                            value={filters.maxTime || 60}
                            onChange={(e) =>
                                setFilters((p) => ({
                                    ...p,
                                    maxTime: parseInt(e.target.value) === 60 ? null : parseInt(e.target.value),
                                }))
                            }
                            aria-label="Maximum time in minutes"
                        />
                        <span style={{ fontWeight: 700, color: 'var(--dora-blue)', minWidth: 50 }} aria-live="polite">
                            {filters.maxTime ? `${filters.maxTime}m` : 'Any'}
                        </span>
                    </div>
                </div>

                {/* Toggles */}
                <div className="filter-section">
                    <div className="toggle-container">
                        <span className="toggle-label" id="open-now-label">🟢 Open Now</span>
                        <button
                            role="switch"
                            aria-checked={filters.openNow}
                            aria-labelledby="open-now-label"
                            className={`toggle${filters.openNow ? ' active' : ''}`}
                            onClick={() => toggleBool('openNow')}
                        />
                    </div>
                    <div className="toggle-container">
                        <span className="toggle-label" id="fav-only-label">⭐ Favorites Only</span>
                        <button
                            role="switch"
                            aria-checked={filters.favoritesOnly}
                            aria-labelledby="fav-only-label"
                            className={`toggle${filters.favoritesOnly ? ' active' : ''}`}
                            onClick={() => toggleBool('favoritesOnly')}
                        />
                    </div>
                </div>

                {/* Candidate count + Reset */}
                <div className="candidate-count" aria-live="polite">
                    <span>{candidateCount}</span> restaurants available
                </div>
                <button
                    className="btn btn-secondary mt-12"
                    style={{ width: '100%' }}
                    onClick={onReset}
                >
                    🔄 Reset Filters
                </button>
            </div>
        </div>
    );
}

FilterPanel.propTypes = {
    filters: PropTypes.shape({
        cuisines: PropTypes.arrayOf(PropTypes.string),
        locations: PropTypes.arrayOf(PropTypes.string),
        maxTime: PropTypes.number,
        peopleCount: PropTypes.number,
        openNow: PropTypes.bool,
        favoritesOnly: PropTypes.bool,
    }).isRequired,
    setFilters: PropTypes.func.isRequired,
    candidateCount: PropTypes.number.isRequired,
    onReset: PropTypes.func.isRequired,
    availableCuisines: PropTypes.arrayOf(PropTypes.string).isRequired,
    availableLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default memo(FilterPanel);
