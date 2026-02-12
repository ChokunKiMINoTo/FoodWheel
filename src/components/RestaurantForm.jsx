import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CUISINE_OPTIONS, DINE_OPTIONS } from '../store/sampleData';

export default function RestaurantForm({ restaurant, onSave, onCancel }) {
    const isEdit = Boolean(restaurant?.id);

    const [form, setForm] = useState({
        name: restaurant?.name || '',
        cuisineTypes: restaurant?.cuisineTypes || [],
        priceRange: restaurant?.priceRange || '',
        location: restaurant?.location || '',
        timeToServe: restaurant?.timeToServe || 15,
        minPeople: restaurant?.minPeople || 1,
        maxPeople: restaurant?.maxPeople || 4,
        openHours: restaurant?.openHours || '',
        dineOptions: restaurant?.dineOptions || ['Dine-in'],
        rating: restaurant?.rating || 0,
        notes: restaurant?.notes || '',
        linkGoogleMaps: restaurant?.linkGoogleMaps || '',
        websiteLink: restaurant?.websiteLink || '',
        imageUrl: restaurant?.imageUrl || '',
        isFavorite: restaurant?.isFavorite || false,
    });

    const [errors, setErrors] = useState({});
    const [customCuisine, setCustomCuisine] = useState('');

    const set = useCallback((key, val) => setForm((p) => ({ ...p, [key]: val })), []);

    const toggleArray = useCallback((key, val) => {
        setForm((p) => {
            const arr = p[key];
            return { ...p, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
        });
    }, []);

    const addCustomCuisine = useCallback(() => {
        const trimmed = customCuisine.trim();
        if (trimmed && !form.cuisineTypes.includes(trimmed)) {
            setForm((p) => ({ ...p, cuisineTypes: [...p.cuisineTypes, trimmed] }));
        }
        setCustomCuisine('');
    }, [customCuisine, form.cuisineTypes]);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (form.cuisineTypes.length === 0) e.cuisineTypes = 'Pick at least 1 cuisine';
        if (form.minPeople > form.maxPeople) e.people = 'Min must be ≤ Max';
        if (form.timeToServe <= 0) e.timeToServe = 'Must be positive';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(form);
        }
    };

    return (
        <>
            <div className="drawer-overlay" onClick={onCancel} />
            <div className="drawer" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit restaurant' : 'Add restaurant'}>
                <div className="drawer-header">
                    <span className="drawer-title">{isEdit ? '✏️ Edit Restaurant' : '➕ Add Restaurant'}</span>
                    <button className="drawer-close" onClick={onCancel} aria-label="Close form">✕</button>
                </div>

                <form className="drawer-body" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-name">Restaurant Name *</label>
                        <input
                            id="restaurant-name"
                            className="form-input"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="e.g. Groove"
                        />
                        {errors.name && <small style={{ color: 'var(--dora-red)' }} role="alert">{errors.name}</small>}
                    </div>

                    {/* Cuisine */}
                    <div className="form-group">
                        <label className="form-label" id="cuisine-label">Cuisine Types *</label>
                        <div className="chip-group" role="group" aria-labelledby="cuisine-label">
                            {CUISINE_OPTIONS.map((c) => (
                                <button
                                    type="button"
                                    key={c}
                                    className={`chip${form.cuisineTypes.includes(c) ? ' active' : ''}`}
                                    onClick={() => toggleArray('cuisineTypes', c)}
                                    aria-pressed={form.cuisineTypes.includes(c)}
                                >
                                    {c}
                                </button>
                            ))}
                            {/* Show any custom cuisines not in the preset list */}
                            {form.cuisineTypes
                                .filter((c) => !CUISINE_OPTIONS.includes(c))
                                .map((c) => (
                                    <button
                                        type="button"
                                        key={c}
                                        className="chip active"
                                        onClick={() => toggleArray('cuisineTypes', c)}
                                        aria-pressed={true}
                                    >
                                        {c} ✕
                                    </button>
                                ))}
                        </div>
                        <div className="flex items-center gap-8" style={{ marginTop: 8 }}>
                            <input
                                className="form-input"
                                style={{ flex: 1 }}
                                value={customCuisine}
                                onChange={(e) => setCustomCuisine(e.target.value)}
                                placeholder="Add custom cuisine..."
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCuisine(); } }}
                            />
                            <button type="button" className="btn btn-sm btn-secondary" onClick={addCustomCuisine}>Add</button>
                        </div>
                        {errors.cuisineTypes && (
                            <small style={{ color: 'var(--dora-red)' }} role="alert">{errors.cuisineTypes}</small>
                        )}
                    </div>

                    {/* Price Range */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-price">Price Range</label>
                        <input
                            id="restaurant-price"
                            className="form-input"
                            value={form.priceRange}
                            onChange={(e) => set('priceRange', e.target.value)}
                            placeholder="e.g. 60-100"
                        />
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-location">Location</label>
                        <input
                            id="restaurant-location"
                            className="form-input"
                            value={form.location}
                            onChange={(e) => set('location', e.target.value)}
                            placeholder="e.g. Tangsin"
                        />
                    </div>

                    {/* People range */}
                    <div className="form-group">
                        <label className="form-label">Best For (People)</label>
                        <div className="flex items-center gap-8">
                            <input
                                type="number"
                                className="form-input"
                                style={{ width: 80 }}
                                min={1}
                                value={form.minPeople}
                                onChange={(e) => set('minPeople', parseInt(e.target.value) || 1)}
                                aria-label="Minimum people"
                            />
                            <span>to</span>
                            <input
                                type="number"
                                className="form-input"
                                style={{ width: 80 }}
                                min={1}
                                value={form.maxPeople}
                                onChange={(e) => set('maxPeople', parseInt(e.target.value) || 1)}
                                aria-label="Maximum people"
                            />
                            <span>people</span>
                        </div>
                        {errors.people && <small style={{ color: 'var(--dora-red)' }} role="alert">{errors.people}</small>}
                    </div>

                    {/* Time to serve */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="time-to-serve">Time to Serve (min)</label>
                        <div className="flex items-center gap-8">
                            <input
                                id="time-to-serve"
                                type="range"
                                min={1}
                                max={60}
                                value={form.timeToServe}
                                onChange={(e) => set('timeToServe', parseInt(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <span style={{ fontWeight: 700, color: 'var(--dora-blue)', minWidth: 40 }} aria-live="polite">
                                {form.timeToServe}m
                            </span>
                        </div>
                        {errors.timeToServe && (
                            <small style={{ color: 'var(--dora-red)' }} role="alert">{errors.timeToServe}</small>
                        )}
                    </div>

                    {/* Open Hours */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-hours">Open Hours</label>
                        <input
                            id="restaurant-hours"
                            className="form-input"
                            value={form.openHours}
                            onChange={(e) => set('openHours', e.target.value)}
                            placeholder="e.g. 10:00-22:00"
                        />
                    </div>

                    {/* Dine Options */}
                    <div className="form-group">
                        <label className="form-label" id="dine-label">Dine Options</label>
                        <div className="chip-group" role="group" aria-labelledby="dine-label">
                            {DINE_OPTIONS.map((d) => (
                                <button
                                    type="button"
                                    key={d}
                                    className={`chip${form.dineOptions.includes(d) ? ' active' : ''}`}
                                    onClick={() => toggleArray('dineOptions', d)}
                                    aria-pressed={form.dineOptions.includes(d)}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-rating">Rating</label>
                        <div className="flex items-center gap-8">
                            <input
                                id="restaurant-rating"
                                type="number"
                                className="form-input"
                                style={{ width: 100 }}
                                min={0}
                                max={5}
                                step={0.1}
                                value={form.rating}
                                onChange={(e) => set('rating', parseFloat(e.target.value) || 0)}
                            />
                            <span style={{ fontWeight: 700, color: 'var(--dora-yellow)', fontSize: '1.2rem' }}>
                                ⭐ {form.rating.toFixed(1)}
                            </span>
                        </div>
                    </div>

                    {/* Favorite */}
                    <div className="form-group">
                        <div className="toggle-container">
                            <span className="toggle-label" id="fav-toggle-label">⭐ Favorite</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.isFavorite}
                                aria-labelledby="fav-toggle-label"
                                className={`toggle${form.isFavorite ? ' active' : ''}`}
                                onClick={() => set('isFavorite', !form.isFavorite)}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-notes">Notes</label>
                        <textarea
                            id="restaurant-notes"
                            className="form-input"
                            rows={3}
                            value={form.notes}
                            onChange={(e) => set('notes', e.target.value)}
                            placeholder="Any personal notes..."
                        />
                    </div>

                    {/* Google Maps Link */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-maps">Google Maps Link</label>
                        <input
                            id="restaurant-maps"
                            className="form-input"
                            value={form.linkGoogleMaps}
                            onChange={(e) => set('linkGoogleMaps', e.target.value)}
                            placeholder="https://maps.google.com/..."
                        />
                    </div>

                    {/* Website Link */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-website">Website Link</label>
                        <input
                            id="restaurant-website"
                            className="form-input"
                            value={form.websiteLink}
                            onChange={(e) => set('websiteLink', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </form>

                <div className="drawer-footer">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary" onClick={handleSubmit}>{isEdit ? 'Update' : 'Add Restaurant'}</button>
                </div>
            </div>
        </>
    );
}

RestaurantForm.propTypes = {
    restaurant: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        cuisineTypes: PropTypes.arrayOf(PropTypes.string),
        priceRange: PropTypes.string,
        location: PropTypes.string,
        timeToServe: PropTypes.number,
        minPeople: PropTypes.number,
        maxPeople: PropTypes.number,
        openHours: PropTypes.string,
        dineOptions: PropTypes.arrayOf(PropTypes.string),
        rating: PropTypes.number,
        notes: PropTypes.string,
        linkGoogleMaps: PropTypes.string,
        websiteLink: PropTypes.string,
        imageUrl: PropTypes.string,
        isFavorite: PropTypes.bool,
    }),
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

RestaurantForm.defaultProps = {
    restaurant: null,
};
