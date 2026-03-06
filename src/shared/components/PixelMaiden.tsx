import React, { useState, useEffect } from 'react';

export type EmotionState = 'neutral' | 'happy' | 'sad';

interface PixelMaidenProps {
    emotion: EmotionState;
    className?: string;
}

/**
 * PixelMaiden Component
 * Handles the animated sprite for the game mascot.
 * Sprite sheet structure (from pixel_maiden.png):
 * - Row 1 (0): Neutral
 * - Row 2 (1): Happy
 * - Row 3 (2): Sad
 */
export const PixelMaiden: React.FC<PixelMaidenProps> = ({ emotion, className = "" }) => {
    const [frame, setFrame] = useState(0);

    // Idle animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setFrame(f => (f + 1) % 6); // Each row has 6 frames
        }, 150);
        return () => clearInterval(interval);
    }, []);

    const getRowOffset = () => {
        switch (emotion) {
            case 'happy': return 1;
            case 'sad': return 2;
            default: return 0;
        }
    };

    // We'll use object-fit and a container for pixel-perfect cropping
    return (
        <div className={`pixel-maiden-container ${className}`} style={{
            width: '128px',
            height: '128px',
            overflow: 'hidden',
            position: 'relative',
            display: 'inline-block',
            imageRendering: 'pixelated'
        }}>
            <img
                src="/pixel_maiden.png"
                alt="Pixel Maiden"
                style={{
                    position: 'absolute',
                    width: '600%', // 6 frames wide
                    height: '300%', // 3 rows high
                    left: `-${frame * 100}%`,
                    top: `-${getRowOffset() * 100}%`,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};
