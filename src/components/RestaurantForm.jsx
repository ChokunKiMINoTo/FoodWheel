import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CUISINE_OPTIONS, PRICE_LEVELS, DINE_OPTIONS, DIET_TAGS, SPICE_LEVELS } from '../store/sampleData';

export default function RestaurantForm({ restaurant, onSave, onCancel }) {
    const isEdit = Boolean(restaurant?.id);

    const [form, setForm] = useState({
        name: restaurant?.name || '',
        cuisineTypes: restaurant?.cuisineTypes || [],
        priceRange: restaurant?.priceRange || '$$',
        location: restaurant?.location || '',
        timeToServe: restaurant?.timeToServe || 15,
        minPeople: restaurant?.minPeople || 1,
        maxPeople: restaurant?.maxPeople || 4,
        isOpenNow: restaurant?.isOpenNow ?? true,
        dineOptions: restaurant?.dineOptions || ['Dine-in'],
        dietTags: restaurant?.dietTags || [],
        spiceLevel: restaurant?.spiceLevel || 'None',
        rating: restaurant?.rating || 3,
        notes: restaurant?.notes || '',
        linkGoogleMaps: restaurant?.linkGoogleMaps || '',
        websiteLink: restaurant?.websiteLink || '',
        imageUrl: restaurant?.imageUrl || '',
        isFavorite: restaurant?.isFavorite || false,
    });

    const [errors, setErrors] = useState({});

    const set = useCallback((key, val) => setForm((p) => ({ ...p, [key]: val })), []);

    const toggleArray = useCallback((key, val) => {
        setForm((p) => {
            const arr = p[key];
            return { ...p, [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
        });
    }, []);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (form.cuisineTypes.length === 0) e.cuisineTypes = 'Pick at least 1 cuisine';
        if (!form.priceRange) e.priceRange = 'Price is required';
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
                            placeholder="e.g. Siam Spice Garden"
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
                        </div>
                        {errors.cuisineTypes && (
                            <small style={{ color: 'var(--dora-red)' }} role="alert">{errors.cuisineTypes}</small>
                        )}
                    </div>

                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label" id="price-label">Price Range *</label>
                        <div className="chip-group" role="radiogroup" aria-labelledby="price-label">
                            {PRICE_LEVELS.map((p) => (
                                <button
                                    type="button"
                                    key={p}
                                    className={`chip${form.priceRange === p ? ' active' : ''}`}
                                    onClick={() => set('priceRange', p)}
                                    role="radio"
                                    aria-checked={form.priceRange === p}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="restaurant-location">Location</label>
                        <input
                            id="restaurant-location"
                            className="form-input"
                            value={form.location}
                            onChange={(e) => set('location', e.target.value)}
                            placeholder="e.g. Sukhumvit Soi 11"
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

                    {/* Diet Tags */}
                    <div className="form-group">
                        <label className="form-label" id="diet-label">Dietary Tags</label>
                        <div className="chip-group" role="group" aria-labelledby="diet-label">
                            {DIET_TAGS.map((d) => (
                                <button
                                    type="button"
                                    key={d}
                                    className={`chip${form.dietTags.includes(d) ? ' active' : ''}`}
                                    onClick={() => toggleArray('dietTags', d)}
                                    aria-pressed={form.dietTags.includes(d)}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Spice Level */}
                    <div className="form-group">
                        <label className="form-label" id="spice-label">Spice Level</label>
                        <div className="chip-group" role="radiogroup" aria-labelledby="spice-label">
                            {SPICE_LEVELS.map((s) => (
                                <button
                                    type="button"
                                    key={s}
                                    className={`chip${form.spiceLevel === s ? ' active' : ''}`}
                                    onClick={() => set('spiceLevel', s)}
                                    role="radio"
                                    aria-checked={form.spiceLevel === s}
                                >
                                    {s === 'None' ? '😊' : s === 'Mild' ? '🌶️' : s === 'Medium' ? '🌶️🌶️' : '🔥'} {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="form-group">
                        <label className="form-label">Personal Rating</label>
                        <div className="star-rating" role="radiogroup" aria-label="Personal rating">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span
                                    key={s}
                                    className={`star${s <= form.rating ? ' filled' : ''}`}
                                    onClick={() => set('rating', s)}
                                    role="radio"
                                    aria-checked={s === form.rating}
                                    aria-label={`${s} star${s !== 1 ? 's' : ''}`}
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set('rating', s); } }}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Open Now */}
                    <div className="form-group">
                        <div className="toggle-container">
                            <span className="toggle-label" id="open-toggle-label">Open Now</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={form.isOpenNow}
                                aria-labelledby="open-toggle-label"
                                className={`toggle${form.isOpenNow ? ' active' : ''}`}
                                onClick={() => set('isOpenNow', !form.isOpenNow)}
                            />
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
        isOpenNow: PropTypes.bool,
        dineOptions: PropTypes.arrayOf(PropTypes.string),
        dietTags: PropTypes.arrayOf(PropTypes.string),
        spiceLevel: PropTypes.string,
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
