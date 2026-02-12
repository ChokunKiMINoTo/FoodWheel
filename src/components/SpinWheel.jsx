import { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const COLORS = [
    '#0097E6', '#E74C3C', '#F4D03F', '#2ECC71', '#9B59B6',
    '#E67E22', '#1ABC9C', '#3498DB', '#E91E63', '#00BCD4',
    '#FF9800', '#8BC34A', '#FF5722', '#607D8B', '#795548',
];

const WHEEL_SIZE = 420;

export default function SpinWheel({ candidates, onResult, spinning, setSpinning }) {
    const canvasRef = useRef(null);
    const [currentRotation, setCurrentRotation] = useState(0);
    const animRef = useRef(null);

    // Set canvas DPR once (and on resize)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = WHEEL_SIZE * dpr;
        canvas.height = WHEEL_SIZE * dpr;
        canvas.getContext('2d').scale(dpr, dpr);
    }, []);

    // Draw wheel
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = WHEEL_SIZE / 2;
        const cy = WHEEL_SIZE / 2;
        const r = WHEEL_SIZE / 2 - 8;
        const count = candidates.length || 1;
        const arc = (2 * Math.PI) / count;

        ctx.save();
        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
        ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

        // Shadow for the wheel
        ctx.save();
        ctx.shadowColor = 'rgba(0, 151, 230, 0.25)';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        if (candidates.length === 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, 2 * Math.PI);
            ctx.fillStyle = '#dfe6e9';
            ctx.fill();
            ctx.strokeStyle = '#b2bec3';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#636e72';
            ctx.font = '600 16px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText('No restaurants match', cx, cy - 8);
            ctx.fillText('your filters', cx, cy + 14);
            ctx.restore();
            return;
        }

        const rot = (currentRotation * Math.PI) / 180;

        candidates.forEach((item, i) => {
            const startAngle = rot + i * arc - Math.PI / 2;
            const endAngle = startAngle + arc;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(startAngle + arc / 2);
            ctx.fillStyle = '#fff';
            ctx.font = `600 ${Math.min(14, 160 / count)}px Outfit`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const name = item.name.length > 16 ? item.name.substring(0, 15) + '…' : item.name;
            ctx.fillText(name, r - 18, 0);
            ctx.restore();
        });

        // Center circle (Doraemon nose)
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#E74C3C';
        ctx.fill();
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Shine on nose
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 8, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();

        // Outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 151, 230, 0.3)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();
    }, [candidates, currentRotation]);

    const spin = useCallback(() => {
        if (spinning || candidates.length === 0) return;
        setSpinning(true);

        const spins = 5 + Math.random() * 5;
        const extraDeg = Math.random() * 360;
        const totalDeg = spins * 360 + extraDeg;
        const startRot = currentRotation;
        const endRot = startRot + totalDeg;
        const duration = 3000;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const cur = startRot + totalDeg * eased;
            setCurrentRotation(cur);

            if (progress < 1) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                setCurrentRotation(endRot);
                setSpinning(false);

                const finalAngle = ((endRot % 360) + 360) % 360;
                const segmentAngle = 360 / candidates.length;
                const winnerIndex = Math.floor(((360 - finalAngle) % 360) / segmentAngle);
                const safeIndex = ((winnerIndex % candidates.length) + candidates.length) % candidates.length;
                onResult(candidates[safeIndex]);
            }
        };

        animRef.current = requestAnimationFrame(animate);
    }, [spinning, candidates, currentRotation, setSpinning, onResult]);

    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <div className="wheel-center">
            <div className="wheel-container">
                <div className="wheel-pointer" aria-hidden="true" />
                <canvas
                    ref={canvasRef}
                    style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: '50%' }}
                    aria-label={`Spinning wheel with ${candidates.length} restaurant options`}
                    role="img"
                />
            </div>
            <button
                className="spin-button"
                onClick={spin}
                disabled={spinning || candidates.length === 0}
                aria-live="polite"
            >
                {spinning ? '🎲 Spinning...' : candidates.length === 0 ? '😿 No Candidates' : '🎯 SPIN!'}
            </button>
        </div>
    );
}

SpinWheel.propTypes = {
    candidates: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    })).isRequired,
    onResult: PropTypes.func.isRequired,
    spinning: PropTypes.bool.isRequired,
    setSpinning: PropTypes.func.isRequired,
};
