import { memo } from 'react';
import PropTypes from 'prop-types';

function ResultCard({ restaurant, onSpinAgain, onExclude, spinning }) {
    if (!restaurant) {
        return (
            <div className="result-panel">
                <div className="dora-card result-empty">
                    <div className="empty-icon" aria-hidden="true">🎡</div>
                    <p>Spin the wheel to<br />choose a restaurant!</p>
                </div>
            </div>
        );
    }

    const stars = Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`star${i < (restaurant.rating || 0) ? ' filled' : ''}`} aria-hidden="true">★</span>
    ));

    return (
        <div className="result-panel">
            <div className="dora-card result-card" role="alert" aria-live="polite">
                <div className="restaurant-name">🎉 {restaurant.name}</div>

                <div className="cuisine-chips">
                    {restaurant.cuisineTypes?.map((c) => (
                        <span key={c} className="cuisine-chip">{c}</span>
                    ))}
                </div>

                <div className="detail-row">
                    <span className="icon" aria-hidden="true">💰</span>
                    {restaurant.priceRange}
                </div>

                <div className="detail-row">
                    <span className="icon" aria-hidden="true">⏱️</span>
                    ~{restaurant.timeToServe} min
                </div>

                <div className="detail-row">
                    <span className="icon" aria-hidden="true">👥</span>
                    {restaurant.minPeople}–{restaurant.maxPeople} people
                </div>

                {restaurant.location && (
                    <div className="detail-row">
                        <span className="icon" aria-hidden="true">📍</span>
                        {restaurant.location}
                    </div>
                )}

                <div className="detail-row">
                    <span className="icon" aria-hidden="true">⭐</span>
                    <div className="star-rating" aria-label={`Rating: ${restaurant.rating || 0} out of 5`}>{stars}</div>
                </div>

                {restaurant.dineOptions?.length > 0 && (
                    <div className="detail-row">
                        <span className="icon" aria-hidden="true">🍽️</span>
                        {restaurant.dineOptions.join(', ')}
                    </div>
                )}

                {restaurant.notes && <div className="notes">"{restaurant.notes}"</div>}

                <div className="action-row">
                    <button className="btn btn-primary btn-sm" onClick={onSpinAgain} disabled={spinning}>
                        🎯 Spin Again
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onExclude(restaurant.id)}>
                        ❌ Exclude
                    </button>
                    {restaurant.linkGoogleMaps && (
                        <a
                            href={restaurant.linkGoogleMaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                        >
                            🗺️ Map
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

ResultCard.propTypes = {
    restaurant: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        cuisineTypes: PropTypes.arrayOf(PropTypes.string),
        priceRange: PropTypes.string,
        timeToServe: PropTypes.number,
        minPeople: PropTypes.number,
        maxPeople: PropTypes.number,
        location: PropTypes.string,
        rating: PropTypes.number,
        dineOptions: PropTypes.arrayOf(PropTypes.string),
        notes: PropTypes.string,
        linkGoogleMaps: PropTypes.string,
    }),
    onSpinAgain: PropTypes.func.isRequired,
    onExclude: PropTypes.func.isRequired,
    spinning: PropTypes.bool.isRequired,
};

ResultCard.defaultProps = {
    restaurant: null,
};

export default memo(ResultCard);
