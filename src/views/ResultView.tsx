import React, { useState, useEffect } from 'react';
import { PixelContainer } from '../components/PixelContainer';
import { PixelButton } from '../components/PixelButton';
import { useAudio } from '../contexts/AudioContext';

interface ResultViewProps {
    score: number;
    totalQuestions: number;
    threshold: number;
    onRetry: () => void;
    onViewLeaderboard: () => void;
    onSubmitScore: (name: string) => Promise<void>;
}

export const ResultView: React.FC<ResultViewProps> = ({
    score,
    totalQuestions,
    threshold,
    onRetry,
    onViewLeaderboard,
    onSubmitScore
}) => {
    const [name, setName] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isPass = score >= threshold;
    const { playGameOver } = useAudio();

    useEffect(() => {
        playGameOver();
    }, [playGameOver]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        await onSubmitScore(name);
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <div className="result-view" style={{ textAlign: 'center' }}>
            <h2 className="stagger-1" style={{
                color: isPass ? 'var(--success-color)' : 'var(--danger-color)',
                fontSize: '2.5rem',
                marginBottom: '2rem'
            }}>
                {isPass ? 'STAGE CLEAR!' : 'GAME OVER'}
            </h2>

            <PixelContainer title="RESULTS" className="stagger-2">
                <div style={{ fontSize: '1.2rem', margin: '20px 0', lineHeight: 2 }}>
                    <p>SCORE: <span style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>{score}/{totalQuestions}</span></p>

                    {!isSubmitted ? (
                        <div style={{ marginTop: '20px', borderTop: '2px dashed var(--border-color)', paddingTop: '20px' }}>
                            <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>ENTER YOUR NICKNAME:</p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 12))}
                                placeholder="PLAYER NAME"
                                style={{
                                    width: '80%',
                                    padding: '10px',
                                    backgroundColor: '#000',
                                    color: 'var(--primary-color)',
                                    border: '2px solid var(--border-color)',
                                    fontFamily: 'var(--font-heading)',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    outline: 'none'
                                }}
                            />
                            <PixelButton
                                onClick={handleSubmit}
                                disabled={!name.trim() || isSubmitting}
                                variant="success"
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                {isSubmitting ? 'SAVING...' : 'SUBMIT TO ARENA'}
                            </PixelButton>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', borderTop: '2px dashed var(--border-color)', paddingTop: '20px' }}>
                            <p style={{ color: 'var(--success-color)' }}>RANKED SUCCESSFULLY!</p>
                            <PixelButton
                                onClick={onViewLeaderboard}
                                variant="primary"
                                style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                                VIEW HALL OF FAME
                            </PixelButton>
                        </div>
                    )}
                </div>

                <PixelButton
                    onClick={onRetry}
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    PLAY AGAIN
                </PixelButton>
            </PixelContainer>
        </div>
    );
};
