import React, { useState, useEffect } from 'react';
import { PixelContainer } from '../components/PixelContainer';
import { PixelButton } from '../components/PixelButton';
import { Avatar } from '../components/Avatar';
import { PixelParticles } from '../components/PixelParticles';
import { Question } from '../services/api';

interface GameViewProps {
    questions: Question[];
    onGameEnd: (score: number) => void;
}

export const GameView: React.FC<GameViewProps> = ({ questions, onGameEnd }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const [particlePos, setParticlePos] = useState<{ x: number, y: number } | null>(null);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // eslint-disable-next-line security/detect-object-injection
    const currentQuestion = questions[currentIndex];

    useEffect(() => {
        if (currentIndex >= questions.length) {
            onGameEnd(score);
        }
    }, [currentIndex, questions.length, score, onGameEnd]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!currentQuestion) return null;

    const handleAnswer = (key: string, event?: React.MouseEvent | React.TouchEvent) => {
        if (selectedAnswer || isAnimating) return; // Prevent double clicking

        setSelectedAnswer(key);
        setIsAnimating(true);

        const isCorrect = key === currentQuestion.answer;
        if (isCorrect) {
            setScore(prev => prev + 1);
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 500);
        }

        // Trigger particles
        if (event) {
            let x = 0;
            let y = 0;
            if ('clientX' in event) {
                x = event.clientX;
                y = event.clientY;
            } else if (event.touches && event.touches.length > 0) {
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            }
            if (x !== 0 || y !== 0) {
                setParticlePos({ x, y });
            }
        }

        // Wait for animation then proceed
        timeoutRef.current = setTimeout(() => {
            setSelectedAnswer(null);
            setIsAnimating(false);
            setCurrentIndex(prev => prev + 1);
            timeoutRef.current = null;
        }, 1200);
    };

    const isBlinking = (key: string) => {
        return selectedAnswer !== null && key === currentQuestion.answer;
    };

    const getButtonVariant = (key: string) => {
        if (!selectedAnswer) return 'primary';

        if (key === currentQuestion.answer) {
            return 'success';
        }

        if (key === selectedAnswer && key !== currentQuestion.answer) {
            return 'danger';
        }

        return 'primary';
    };

    return (
        <div className={`game-view ${isAnimating && selectedAnswer !== currentQuestion.answer ? 'shake-effect glitch' : ''}`}>
            {showFlash && <div className="flash-success-overlay" />}
            {particlePos && (
                <PixelParticles
                    x={particlePos.x}
                    y={particlePos.y}
                    color={selectedAnswer === currentQuestion.answer ? 'var(--success-color)' : 'var(--danger-color)'}
                    onComplete={() => setParticlePos(null)}
                />
            )}
            <div className="stagger-1" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--secondary-color)' }}>
                <span>STAGE {currentIndex + 1}/{questions.length}</span>
                <span>SCORE: {score}</span>
            </div>

            <PixelContainer title="BOSS ENCOUNTER" className="stagger-2">
                <Avatar seed={currentQuestion.id.toString() + currentQuestion.question} />

                <div style={{
                    backgroundColor: 'var(--bg-color)',
                    padding: '15px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '20px',
                    minHeight: '80px',
                    textAlign: 'left'
                }}>
                    {currentQuestion.question}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {currentQuestion.options.map(option => (
                        <PixelButton
                            key={option.key}
                            variant={getButtonVariant(option.key)}
                            isBlinking={isBlinking(option.key)}
                            onClick={(e) => handleAnswer(option.key, e)}
                            style={{ margin: 0, padding: '15px 10px', fontSize: '0.9rem' }}
                        >
                            {option.key}. {option.value}
                        </PixelButton>
                    ))}
                </div>
            </PixelContainer>
        </div>
    );
};
