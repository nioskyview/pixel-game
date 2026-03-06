import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameView } from './GameView';

vi.mock('../../shared/contexts/AudioContext', () => ({
    useAudio: () => ({
        playCorrect: vi.fn(),
        playGameOver: vi.fn(),
        playHover: vi.fn(),
        playClick: vi.fn(),
    })
}));

describe('GameView Component', () => {
    const mockQuestions = [
        {
            id: 1,
            question: 'What is 1 + 1?',
            options: [
                { key: 'A', value: '1' },
                { key: 'B', value: '2' }
            ],
            answer: 'B'
        },
        {
            id: 2,
            question: 'What is 2 + 2?',
            options: [
                { key: 'A', value: '4' },
                { key: 'B', value: '5' }
            ],
            answer: 'A'
        }
    ];

    it('renders the first question', () => {
        render(<GameView questions={mockQuestions} onGameEnd={vi.fn()} />);

        expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
        expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    it('handles correct answer and advances', async () => {
        vi.useFakeTimers();
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        const optionB = screen.getByText(/2/);
        fireEvent.click(optionB);

        // Wait for potential delays/stagger
        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
        vi.useRealTimers();
    });

    it('calls onGameEnd after all questions', async () => {
        vi.useFakeTimers();
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        // Q1
        fireEvent.click(screen.getByText(/2/));
        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        // Q2
        fireEvent.click(screen.getByText(/4/));
        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        expect(handleGameEnd).toHaveBeenCalledWith(2);
        vi.useRealTimers();
    });
});
