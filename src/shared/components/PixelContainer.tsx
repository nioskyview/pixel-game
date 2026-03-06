import React from 'react';

interface PixelContainerProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass';
    style?: React.CSSProperties;
}

export const PixelContainer: React.FC<PixelContainerProps> = ({
    title,
    children,
    className = "",
    variant = 'default',
    style = {}
}) => {
    const isGlass = variant === 'glass';

    return (
        <div className={`pixel-container ${isGlass ? 'glass-panel' : ''} ${className}`} style={{
            padding: '20px',
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            ...(isGlass ? {
                border: 'none',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)',
                borderRadius: '8px',
                overflow: 'hidden'
            } : {
                boxShadow: 'var(--pixel-shadow)',
                backgroundColor: 'var(--card-bg)',
                border: '2px solid var(--border-color)',
            }),
            ...style
        }}>
            {isGlass && <div className="glass-edge-glow"></div>}
            {title && (
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: isGlass ? 'transparent' : 'var(--bg-color)',
                    padding: '0 15px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    color: isGlass ? 'var(--secondary-color)' : 'var(--primary-color)',
                    zIndex: 2,
                    textShadow: isGlass ? 'var(--cyan-glow)' : 'none'
                }}>
                    {title}
                </div>
            )}
            <div className="container-content" style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};
