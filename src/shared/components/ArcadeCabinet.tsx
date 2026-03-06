import React from 'react';
import './ArcadeCabinet.css';

interface ArcadeCabinetProps {
    children: React.ReactNode;
}

/**
 * ArcadeCabinet component provides a physical-looking frame around the game viewport.
 * It simulates a retro arcade machine with a bezel, headers, and dashboard details.
 */
export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({ children }) => {
    return (
        <div className="arcade-cabinet-exterior">
            {/* Top Marquee */}
            <div className="arcade-marquee">
                <div className="marquee-text neon-pulse">NEON BATTLE QUIZ</div>
            </div>

            {/* Main Screen Area */}
            <div className="arcade-screen-container">
                <div className="arcade-bezel">
                    <div className="arcade-viewport">
                        {children}
                        {/* CRT Overlay is global but we can add local reflections here if needed */}
                        <div className="screen-reflection" />
                    </div>
                </div>
            </div>

            {/* Control Panel / Dashboard */}
            <div className="arcade-dashboard">
                <div className="dashboard-joystick">
                    <div className="joystick-base" />
                    <div className="joystick-shaft" />
                    <div className="joystick-ball red-glow" />
                </div>
                <div className="dashboard-buttons">
                    <div className="arcade-btn btn-red" />
                    <div className="arcade-btn btn-blue" />
                    <div className="arcade-btn btn-green" />
                    <div className="arcade-btn btn-yellow" />
                </div>
                <div className="coin-slot">
                    <div className="slot-indicator neon-flicker">INSERT COIN</div>
                </div>
            </div>
        </div>
    );
};
