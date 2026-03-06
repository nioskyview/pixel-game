import { useState, useCallback } from 'react';
import { Question, fetchQuestions, submitScore } from '../services/api';

export type GameState = 'LOGIN' | 'LOADING' | 'QUIZ' | 'RESULTS' | 'LEADERBOARD' | 'ERROR';

export interface User {
    id: string;
}

export const useGameState = () => {
    const [state, setState] = useState<GameState>('LOGIN');
    const [user, setUser] = useState<User | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [score, setScore] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (userId: string) => {
        setUser({ id: userId });
        setState('LOADING');
        try {
            const questionCount = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5');
            const data = await fetchQuestions(questionCount);
            setQuestions(data);
            setScore(0);
            setState('QUIZ');
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to load questions. Please try again.');
            setState('ERROR');
        }
    }, []);

    const completeQuiz = useCallback((finalScore: number) => {
        setScore(finalScore);
        setState('RESULTS');
    }, []);

    const handleSumbitScore = useCallback(async (playerName: string) => {
        if (!user) return;
        try {
            await submitScore({
                id: user.id,
                playerName,
                score,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error('Failed to submit score:', err);
        }
    }, [score, user]);

    const showLeaderboard = useCallback(() => {
        setState('LEADERBOARD');
    }, []);

    const restart = useCallback(() => {
        setScore(0);
        setState('LOGIN');
    }, []);

    const backToMenu = useCallback(() => {
        setState('LOGIN');
    }, []);

    return {
        state,
        user,
        questions,
        score,
        error,
        login,
        completeQuiz,
        handleSumbitScore,
        showLeaderboard,
        restart,
        backToMenu
    };
};
