import React, { useState, useEffect } from 'react';
import { PixelContainer } from '../../shared/components/PixelContainer';
import { PixelButton } from '../../shared/components/PixelButton';
import { useAudio } from '../../shared/contexts/AudioContext';
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
        <div className="result-view" style={{ textAlign: 'center' }}>
            <h1 className="stagger-1" style={{
                color: isPass ? 'var(--success-color)' : 'var(--danger-color)',
                fontSize: '3rem',
                marginBottom: '2rem'
            }}>
                {message}
            </h1>

            <PixelContainer title="RESULTS" className="stagger-2">
                <div style={{ fontSize: '1.2rem', margin: '20px 0', lineHeight: 2 }}>
                    <p>SCORE: <span style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>{score}/{total}</span></p>
                    <p>ACCURACY: <span style={{ color: 'var(--secondary-color)', fontSize: '1.5rem' }}>{percentage}%</span></p>

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
                                    outline: 'none',
                                    marginBottom: '20px'
                                }}
                            />
                            <PixelButton
                                variant="success"
                                onClick={handleSubmit}
                                disabled={!name.trim() || isSubmitting}
                            >
                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
                            </PixelButton>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', color: 'var(--success-color)' }}>
                            <p>SCORE SUBMITTED!</p>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                    <PixelButton variant="primary" onClick={onRetry}>
                        TRY AGAIN
                    </PixelButton>
                    <PixelButton variant="secondary" onClick={onViewLeaderboard}>
                        LEADERBOARD
                    </PixelButton>
                </div>
            </PixelContainer>
        </div>
    );
};
