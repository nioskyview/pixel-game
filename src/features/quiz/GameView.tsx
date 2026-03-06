import React, { useState, useEffect, useCallback } from 'react';
import { PixelContainer } from '../../shared/components/PixelContainer';
import { PixelButton } from '../../shared/components/PixelButton';
import { Avatar } from '../../shared/components/Avatar';
import { PixelParticles } from '../../shared/components/PixelParticles';
import { PixelMaiden, EmotionState } from '../../shared/components/PixelMaiden';
import { Question } from '../ranking/RankingManager';
import { useAudio } from '../audio/AudioManager';
import { checkAnswer } from '../../domain/quiz/quizDomain';
import './GameView.css';

interface GameViewProps {
    questions: Question[];
    onGameEnd: (score: number) => void;
}

export const GameView: React.FC<GameViewProps> = ({ questions, onGameEnd }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [combo, setCombo] = useState(1);
    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const [maidenEmotion, setMaidenEmotion] = useState<EmotionState>('neutral');
    const [particlePos, setParticlePos] = useState<{ x: number, y: number } | null>(null);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const { playCorrect, playWrong } = useAudio();

    const currentQuestion = questions[currentIndex];

    const nextQuestion = useCallback(() => {
        setSelectedAnswer(null);
        setIsAnimating(false);
        setMaidenEmotion('neutral');
        setTimeLeft(20);
        setCurrentIndex(prev => prev + 1);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (selectedAnswer || isAnimating || !currentQuestion) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentIndex, selectedAnswer, isAnimating, currentQuestion]);

    const handleTimeOut = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsAnimating(true); // Prevent re-triggering the timeout effect
        playWrong();
        setMaidenEmotion('sad');
        setCombo(1);
        setLives(prev => Math.max(0, prev - 1));

        timeoutRef.current = setTimeout(() => {
            nextQuestion();
        }, 1000);
    }, [nextQuestion, playWrong]);

    useEffect(() => {
        if (timeLeft === 0 && !selectedAnswer && !isAnimating) {
            handleTimeOut();
        }
    }, [timeLeft, selectedAnswer, isAnimating, handleTimeOut]);

    useEffect(() => {
        if (currentIndex >= questions.length || lives === 0) {
            onGameEnd(score);
        }
    }, [currentIndex, questions.length, lives, score, onGameEnd]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    if (!currentQuestion) return null;

    const handleAnswer = (key: string, event?: React.MouseEvent | React.TouchEvent) => {
        if (selectedAnswer || isAnimating) return;

        setSelectedAnswer(key);
        setIsAnimating(true);
        if (timerRef.current) clearInterval(timerRef.current);

        const isCorrect = checkAnswer(key, currentQuestion.answer);
        if (isCorrect) {
            playCorrect();
            setCombo(prev => {
                const newCombo = prev; // use current combo for score
                setScore(s => s + 100 * newCombo);
                return prev + 1;
            });
            setShowFlash(true);
            setMaidenEmotion('happy');
            setTimeout(() => setShowFlash(false), 500);

            timeoutRef.current = setTimeout(() => {
                nextQuestion();
                timeoutRef.current = null;
            }, 1200);
        } else {
            playWrong();
            setMaidenEmotion('sad');
            setCombo(1);
            setLives(prev => {
                const newLives = Math.max(0, prev - 1);
                timeoutRef.current = setTimeout(() => {
                    if (newLives > 0) {
                        nextQuestion();
                    }
                    timeoutRef.current = null;
                }, 1200);
                return newLives;
            });
        }

        if (event) {
            let x = 0, y = 0;
            if ('clientX' in event) { x = event.clientX; y = event.clientY; }
            else if ('touches' in event && event.touches?.length > 0) { x = event.touches[0].clientX; y = event.touches[0].clientY; }
            if (x !== 0 || y !== 0) setParticlePos({ x, y });
        }
    };

    const isBlinking = (key: string) => selectedAnswer !== null && key === currentQuestion.answer;

    const getButtonVariant = (key: string) => {
        if (!selectedAnswer) return 'primary';
        if (key === currentQuestion.answer) return 'success';
        if (key === selectedAnswer && key !== currentQuestion.answer) return 'danger';
        return 'primary';
    };

    const shouldShake = isAnimating && (selectedAnswer !== currentQuestion.answer || !selectedAnswer);

    return (
        <div className={`game-view-layout ${shouldShake ? 'screen-shake' : ''}`}>
            {showFlash && <div className="flash-success-overlay" />}
            {particlePos && (
                <PixelParticles
                    x={particlePos.x}
                    y={particlePos.y}
                    color={selectedAnswer === currentQuestion.answer ? 'var(--success-color)' : 'var(--danger-color)'}
                    onComplete={() => setParticlePos(null)}
                />
            )}

            {/* Left Pane - Physical/Info HUD */}
            <div className="left-pane">
                <div className="stadium-bg" />

                <div className={`maiden-display ${maidenEmotion === 'sad' ? 'maiden-glitch' : ''}`}>
                    <PixelMaiden emotion={maidenEmotion} />
                </div>

                <div className="hud-container">
                    <div className="hud-row">
                        <span className="hud-label">STAGE</span>
                        <span className="hud-value">{currentIndex + 1}/{questions.length}</span>
                    </div>
                    <div className="hud-row">
                        <span className="hud-label">SCORE</span>
                        <span className="hud-value" style={{ color: '#fbbf24' }}>{score.toString().padStart(6, '0')}</span>
                    </div>
                    <div className="hud-row">
                        <span className="hud-label">LIVES</span>
                        <div className="hearts-display">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={i < lives ? 'heart-active' : ''}
                                    style={{
                                        opacity: i < lives ? 1 : 0.1,
                                        filter: i < lives ? 'none' : 'grayscale(100%)',
                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    ❤️
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="hud-row" style={{ marginTop: '12px' }}>
                        <div style={{ flex: 1, backgroundColor: '#111827', height: '8px', border: '1px solid #334155', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(currentIndex / questions.length) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #00f3ff, #ff00ff)',
                                transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }} />
                        </div>
                    </div>
                    <div className="hud-row" style={{ justifyContent: 'center', marginTop: '15px' }}>
                        {combo > 1 && (
                            <div key={combo} className="combo-badge">
                                COMBO X{combo}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Pane - Question Panel */}
            <div className="right-pane">
                <div className="quest-header">
                    <div className="quest-title">BOSS ENCOUNTER</div>
                </div>

                <PixelContainer variant="glass" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <Avatar seed={currentQuestion.id.toString() + (currentQuestion.question || '')} />
                    </div>

                    <div style={{
                        backgroundColor: 'rgba(2, 6, 23, 0.7)',
                        padding: '20px',
                        border: '1px solid rgba(0, 243, 255, 0.2)',
                        borderRadius: '4px',
                        minHeight: '100px',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        marginBottom: '20px',
                        color: '#f8fafc'
                    }}>
                        {currentQuestion.question}
                    </div>

                    <div className="options-grid">
                        {currentQuestion.options.map(option => (
                            <PixelButton
                                key={option.key}
                                variant={getButtonVariant(option.key)}
                                isBlinking={isBlinking(option.key)}
                                onClick={(e) => handleAnswer(option.key, e)}
                                style={{ margin: 0, padding: '14px 15px', fontSize: '0.85rem', textAlign: 'left' }}
                            >
                                [{option.key}] {option.value}
                            </PixelButton>
                        ))}
                    </div>
                </PixelContainer>

                {/* Circular SVG Timer */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', position: 'relative' }}>
                    <svg width="70" height="70" viewBox="0 0 70 70">
                        <circle cx="35" cy="35" r="30" fill="none" stroke="rgba(0, 243, 255, 0.1)" strokeWidth="5" />
                        <circle
                            cx="35" cy="35" r="30" fill="none"
                            stroke={timeLeft > 10 ? "#00f3ff" : timeLeft > 5 ? "#fbbf24" : "#ef4444"}
                            strokeWidth="5"
                            strokeDasharray="188.4"
                            strokeDashoffset={188.4 - (188.4 * timeLeft) / 20}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
                            transform="rotate(-90 35 35)"
                        />
                        <text
                            x="50%" y="50%"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fill={timeLeft > 10 ? "#00f3ff" : timeLeft > 5 ? "#fbbf24" : "#ef4444"}
                            style={{ fontFamily: "'Press Start 2P'", fontSize: '12px', textShadow: '0 0 5px currentColor' }}
                        >
                            {timeLeft}
                        </text>
                    </svg>
                </div>
            </div>
        </div>
    );
};
