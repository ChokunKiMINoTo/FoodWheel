import { memo } from 'react';
import PropTypes from 'prop-types';

function HistoryBar({ history }) {
    if (!history || history.length === 0) return null;

    const formatTime = (iso) => {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="history-bar" role="log" aria-label="Recent restaurant picks">
            <div className="history-title">🕐 Recent Picks</div>
            <div className="history-scroll">
                {history.map((item, i) => (
                    <div className="history-item" key={`${item.id}-${item.pickedAt}`}>
                        <div>{item.name}</div>
                        <div className="pick-time">{formatTime(item.pickedAt)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

HistoryBar.propTypes = {
    history: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string.isRequired,
            pickedAt: PropTypes.string.isRequired,
        })
    ),
};

HistoryBar.defaultProps = {
    history: [],
};

export default memo(HistoryBar);
