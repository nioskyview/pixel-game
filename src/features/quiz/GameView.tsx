import React, { useState, useEffect, useCallback } from 'react';

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

    // eslint-disable-next-line security/detect-object-injection
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

    const getTimerColor = (time: number) => {
        if (time > 10) return "#00f3ff";
        if (time > 5) return "#fbbf24";
        return "#ef4444";
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

            <div className="stadium-bg" />

            {/* Header Row: Title on Left, HUD & Maiden on Right */}
            <div className="game-header-row">
                <div className="quest-header" style={{ marginBottom: 0 }}>
                    <div className="quest-title">BOSS ENCOUNTER</div>
                </div>

                <div className="header-right-side">
                    <div className="hud-horizontal">
                        <div className="hud-stat-group">
                            <span className="hud-label">STAGE</span>
                            <span className="hud-value tabular-nums">{currentIndex + 1}/{questions.length}</span>
                            <span className="hud-label" style={{ marginLeft: '10px' }}>SCORE</span>
                            <span className="hud-value tabular-nums" style={{ color: '#fbbf24' }}>{score.toString().padStart(6, '0')}</span>
                            {combo > 1 && (
                                <div className="combo-badge tabular-nums" style={{ marginLeft: '10px' }}>X{combo}</div>
                            )}
                        </div>

                        <div className="hud-stat-group">
                            <span className="hud-label">LIVES</span>
                            <div className="hearts-display" style={{ display: 'flex', gap: '4px' }}>
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={i < lives ? 'heart-active' : ''} style={{ opacity: i < lives ? 1 : 0.2, filter: i < lives ? 'none' : 'grayscale(100%)', width: '16px', height: '16px', transform: 'translateY(1px)' }} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                ))}
                            </div>

                            <div style={{ position: 'relative', width: '40px', height: '40px', marginLeft: '15px' }}>
                                <svg width="40" height="40" viewBox="0 0 70 70">
                                    <circle cx="35" cy="35" r="30" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="4" />
                                    <circle
                                        cx="35" cy="35" r="30" fill="none"
                                        stroke={getTimerColor(timeLeft)}
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
                                        fill={getTimerColor(timeLeft)}
                                        style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', textShadow: '0 0 5px currentColor' }}
                                    >
                                        {timeLeft}
                                    </text>
                                </svg>
                            </div>
                        </div>
                        <div style={{ flex: 1, backgroundColor: '#111827', height: '6px', border: '1px solid #334155', borderRadius: '3px', overflow: 'hidden', marginTop: '5px' }}>
                            <div style={{
                                width: `${(currentIndex / questions.length) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #00f3ff, #ff00ff)',
                                transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }} />
                        </div>
                    </div>

                    <div className={`maiden-mini ${maidenEmotion === 'sad' ? 'maiden-glitch' : ''}`}>
                        <PixelMaiden emotion={maidenEmotion} />
                    </div>
                </div>
            </div>

            {/* Main Content: Question and full-width options */}
            <div className="game-quest-row">
                <div className="quest-content-wrapper-full" style={{ padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                        <div style={{ flexShrink: 0, filter: 'drop-shadow(0 0 10px rgba(0, 243, 255, 0.3))' }}>
                            <Avatar seed={currentQuestion.id.toString() + (currentQuestion.question || '')} />
                        </div>
                        <div style={{
                            flex: 1,
                            backgroundColor: 'var(--surface-raised)',
                            borderLeft: '4px solid var(--border-color)',
                            padding: '28px 32px',
                            fontSize: '1.05rem',
                            lineHeight: '1.8',
                            color: 'var(--text-color)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                            fontWeight: 500
                        }}>
                            {currentQuestion.question}
                        </div>
                    </div>

                    <div className="options-grid">
                        {currentQuestion.options.map(option => (
                            <PixelButton
                                key={option.key}
                                variant={getButtonVariant(option.key)}
                                isBlinking={isBlinking(option.key)}
                                onClick={(e) => handleAnswer(option.key, e)}
                                style={{ margin: 0, padding: '20px 24px', fontSize: '0.95rem', textAlign: 'left', minHeight: '64px' }}
                            >
                                [{option.key}] {option.value}
                            </PixelButton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
