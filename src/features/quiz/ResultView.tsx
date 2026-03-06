import React, { useState, useEffect } from 'react';
import { PixelContainer } from '../../shared/components/PixelContainer';
import { PixelButton } from '../../shared/components/PixelButton';
import { useAudio } from '../audio/AudioManager';
import { getQuizSummary } from '../../domain/quiz/quizDomain';

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
    totalQuestions: total,
    threshold,
    onRetry,
    onViewLeaderboard,
    onSubmitScore
}) => {
    const [name, setName] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { playGameOver, playCorrect } = useAudio();
    const { isPass, percentage, message } = getQuizSummary({ score, total, threshold });

    useEffect(() => {
        if (isPass) {
            playCorrect();
        } else {
            playGameOver();
        }
    }, [isPass, playGameOver, playCorrect]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsSubmitting(true);
        await onSubmitScore(name);
        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    return (
        <div className="result-view" style={{ textAlign: 'center', padding: '20px 0' }}>
            <h1 className={`stagger-1 neon-text-primary ${isPass ? 'pop-effect' : 'glitch'}`} style={{
                color: isPass ? 'var(--success-color)' : 'var(--danger-color)',
                fontSize: '3.5rem',
                marginBottom: '2rem',
                filter: isPass ? 'drop-shadow(0 0 15px var(--success-color))' : 'drop-shadow(0 0 15px var(--danger-color))'
            }}>
                {message}
            </h1>

            <PixelContainer title="MISSION COMPLETE" variant="glass" className="stagger-2">
                <div style={{ fontSize: '1.2rem', margin: '20px 0', lineHeight: 2 }}>
                    <div style={{
                        margin: '20px auto',
                        width: 'fit-content',
                        padding: '10px 30px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid var(--secondary-color)',
                        boxShadow: 'var(--cyan-glow)',
                        borderRadius: '4px'
                    }}>
                        <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-color)', letterSpacing: '2px' }}>FINAL SCORE</p>
                        <p style={{
                            margin: 0,
                            color: 'var(--secondary-color)',
                            fontSize: '3rem',
                            fontFamily: 'var(--font-heading)',
                            textShadow: 'var(--cyan-glow)'
                        }}>{score}/{total}</p>
                    </div>

                    <p className="neon-text-secondary">ACCURACY: {percentage}%</p>

                    {!isSubmitted ? (
                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                            <p style={{ fontSize: '0.8rem', marginBottom: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>ENTER IDENTITY FOR HALL OF FAME:</p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 12))}
                                placeholder="PLAYER_ID"
                                style={{
                                    width: '100%',
                                    maxWidth: '300px',
                                    padding: '12px',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    color: 'var(--secondary-color)',
                                    border: '1px solid var(--secondary-color)',
                                    boxShadow: 'inset 0 0 10px rgba(0, 243, 255, 0.2)',
                                    fontFamily: 'var(--font-heading)',
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                    outline: 'none',
                                    marginBottom: '20px',
                                    borderRadius: '4px'
                                }}
                            />
                            <br />
                            <PixelButton
                                variant="success"
                                onClick={handleSubmit}
                                disabled={!name.trim() || isSubmitting}
                                style={{ width: '100%', maxWidth: '300px' }}
                            >
                                {isSubmitting ? 'UPLOADING...' : 'SAVE SCORE'}
                            </PixelButton>
                        </div>
                    ) : (
                        <div style={{
                            marginTop: '20px',
                            color: 'var(--success-color)',
                            padding: '15px',
                            border: '1px solid var(--success-color)',
                            backgroundColor: 'rgba(0, 255, 102, 0.05)',
                            borderRadius: '4px'
                        }}>
                            <p className="neon-text-primary">DATA SYNCHRONIZED ✓</p>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                    <PixelButton variant="primary" onClick={onRetry}>
                        REBOOT
                    </PixelButton>
                    <PixelButton variant="secondary" onClick={onViewLeaderboard}>
                        RANKS
                    </PixelButton>
                </div>
            </PixelContainer>
        </div>
    );
};
