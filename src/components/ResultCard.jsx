import { memo } from 'react';
import PropTypes from 'prop-types';
import { isOpenNow } from '../store/restaurantStore';

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

    return (
        <div className="result-panel">
            <div className="dora-card result-card" role="alert" aria-live="polite">
                <div className="restaurant-name">🎉 {restaurant.name}</div>

                <div className="cuisine-chips">
                    {restaurant.cuisineTypes?.map((c) => (
                        <span key={c} className="cuisine-chip">{c}</span>
                    ))}
                </div>

                {restaurant.priceRange && (
                    <div className="detail-row">
                        <span className="icon" aria-hidden="true">💰</span>
                        ฿{restaurant.priceRange}
                    </div>
                )}

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

                {restaurant.openHours && (
                    <div className="detail-row">
                        <span className="icon" aria-hidden="true">🕐</span>
                        {restaurant.openHours}
                        <span style={{ marginLeft: 8, fontWeight: 600, color: isOpenNow(restaurant) ? '#2ecc71' : 'var(--dora-red)' }}>
                            {isOpenNow(restaurant) ? '(Open)' : '(Closed)'}
                        </span>
                    </div>
                )}

                <div className="detail-row">
                    <span className="icon" aria-hidden="true">⭐</span>
                    <span style={{ fontWeight: 700 }}>{(restaurant.rating || 0).toFixed(1)}</span>
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
        openHours: PropTypes.string,
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
