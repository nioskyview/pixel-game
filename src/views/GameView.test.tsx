import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameView } from './GameView';

vi.mock('../contexts/AudioContext', () => ({
    useAudio: () => ({
        playCorrect: vi.fn(),
        playWrong: vi.fn(),
        playHover: vi.fn(),
        playClick: vi.fn(),
    })
}));

const mockQuestions = [
    {
        id: '1',
        question: 'First Question?',
        options: [
            { key: 'A', value: 'Option A' },
            { key: 'B', value: 'Option B' }
        ],
        answer: 'A'
    },
    {
        id: '2',
        question: 'Second Question?',
        options: [
            { key: 'A', value: 'Option A' },
            { key: 'B', value: 'Option B' }
        ],
        answer: 'B'
    }
];

describe('GameView Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('renders initial state with score 0 and first question', () => {
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        expect(screen.getByText('STAGE 1/2')).toBeInTheDocument();
        expect(screen.getByText('SCORE: 0')).toBeInTheDocument();
        expect(screen.getByText('First Question?')).toBeInTheDocument();
    });

    it('advances to next question and increments score on correct answer', () => {
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        // Click correct answer A
        fireEvent.click(screen.getByText('A. Option A'));

        // At this point score goes up, but stage doesn't advance immediately (1.2s timeout)
        expect(screen.getByText('SCORE: 1')).toBeInTheDocument();
        expect(screen.getByText('First Question?')).toBeInTheDocument();

        // Fast forward 1200ms
        act(() => {
            vi.advanceTimersByTime(1200);
        });

        // Now we should be on question 2
        expect(screen.getByText('STAGE 2/2')).toBeInTheDocument();
        expect(screen.getByText('Second Question?')).toBeInTheDocument();
    });

    it('advances to next question without incrementing score on wrong answer', () => {
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        // Click wrong answer B
        fireEvent.click(screen.getByText('B. Option B'));

        expect(screen.getByText('SCORE: 0')).toBeInTheDocument();

        // Fast forward 1200ms
        act(() => {
            vi.advanceTimersByTime(1200);
        });

        // Still 0 score, but advanced to second question
        expect(screen.getByText('STAGE 2/2')).toBeInTheDocument();
        expect(screen.getByText('SCORE: 0')).toBeInTheDocument();
    });

    it('triggers onGameEnd when the last question is answered', () => {
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        // Question 1 (Correct)
        fireEvent.click(screen.getByText('A. Option A'));
        act(() => { vi.advanceTimersByTime(1200); });

        // Question 2 (Wrong)
        fireEvent.click(screen.getByText('A. Option A'));
        act(() => { vi.advanceTimersByTime(1200); });

        // End of game reached, expecting score 1
        expect(handleGameEnd).toHaveBeenCalledWith(1);
    });
});
