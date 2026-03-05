import React, { useEffect, useState } from 'react';
import { PixelContainer } from '../components/PixelContainer';
import { PixelButton } from '../components/PixelButton';
import { fetchLeaderboard, LeaderboardEntry } from '../services/api';

interface LeaderboardViewProps {
    onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRanking = async () => {
            const data = await fetchLeaderboard();
            setEntries(data);
            setLoading(false);
        };
        loadRanking();
    }, []);

    const getRankColor = (index: number) => {
        if (index === 0) return '#FFD700'; // Gold
        if (index === 1) return '#C0C0C0'; // Silver
        if (index === 2) return '#CD7F32'; // Bronze
        return 'var(--text-color)';
    };

    return (
        <div className="leaderboard-view">
            <h2 className="glitch" style={{ marginBottom: '2rem' }}>Hall of Fame</h2>

            <PixelContainer style={{ padding: '20px', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
                {loading ? (
                    <div className="blink" style={{ textAlign: 'center', padding: '20px' }}>LOADING RANKINGS...</div>
                ) : entries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>NO RECORDS YET</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
                        <thead>
                            <tr style={{ color: 'var(--secondary-color)', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ padding: '10px' }}>RANK</th>
                                <th style={{ padding: '10px' }}>PLAYER</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, index) => (
                                <tr key={index} style={{ color: getRankColor(index), borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <td style={{ padding: '12px 10px' }}>#{index + 1}</td>
                                    <td style={{ padding: '12px 10px' }}>{entry.name}</td>
                                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>{entry.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </PixelContainer>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PixelButton onClick={onBack}>BACK TO MENU</PixelButton>
            </div>
        </div>
    );
};
