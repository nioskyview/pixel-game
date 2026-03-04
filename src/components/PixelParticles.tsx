import React, { useEffect, useState } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
}

interface PixelParticlesProps {
    x: number;
    y: number;
    color?: string;
    onComplete?: () => void;
}

export const PixelParticles: React.FC<PixelParticlesProps> = ({
    x,
    y,
    color = 'var(--primary-color)',
    onComplete
}) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // eslint-disable-next-line sonarjs/pseudo-random
        const numParticles = 8 + Math.floor(Math.random() * 6);
        const newParticles: Particle[] = [];

        for (let i = 0; i < numParticles; i++) {
            // eslint-disable-next-line sonarjs/pseudo-random
            const angle = Math.random() * Math.PI * 2;
            // eslint-disable-next-line sonarjs/pseudo-random
            const speed = 2 + Math.random() * 4;
            newParticles.push({
                // eslint-disable-next-line sonarjs/pseudo-random
                id: Math.random(),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                // eslint-disable-next-line sonarjs/pseudo-random
                size: 4 + Math.floor(Math.random() * 4),
                color
            });
        }

        setParticles(newParticles);

        const timer = setTimeout(() => {
            onComplete?.();
        }, 600);

        return () => clearTimeout(timer);
    }, [x, y, color, onComplete]);

    useEffect(() => {
        let animationFrame: number;

        const update = () => {
            // eslint-disable-next-line sonarjs/no-nested-functions
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.2, // Gravity
                vx: p.vx * 0.98 // Air resistance
            })));
            animationFrame = requestAnimationFrame(update);
        };

        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 100 }}>
            {
                particles.map(p => (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: p.x,
                            top: p.y,
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            boxShadow: '1px 1px 0 rgba(0,0,0,0.3)',
                            opacity: 1 - (Date.now() % 600) / 600 // Simple fade
                        }}
                    />
                ))
            }
        </div >
    );
};
