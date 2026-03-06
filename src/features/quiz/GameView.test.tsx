import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameView } from './GameView';

vi.mock('../audio/AudioManager', () => ({
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

        expect(screen.getByText(/What is 1 \+ 1\?/i)).toBeInTheDocument();
        // The button text is "B. 2"
        expect(screen.getByText(/B\. 2/i)).toBeInTheDocument();
    });

    it('handles correct answer and advances', async () => {
        vi.useFakeTimers();
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        const optionB = screen.getByText(/B\. 2/i);
        fireEvent.click(optionB);

        // Wait for potential delays/stagger (1200ms in component)
        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        expect(screen.getByText(/What is 2 \+ 2\?/i)).toBeInTheDocument();
        vi.useRealTimers();
    });

    it('calls onGameEnd after all questions', async () => {
        vi.useFakeTimers();
        const handleGameEnd = vi.fn();
        render(<GameView questions={mockQuestions} onGameEnd={handleGameEnd} />);

        // Q1: B. 2
        fireEvent.click(screen.getByText(/B\. 2/i));
        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        // Q2: A. 4
        fireEvent.click(screen.getByText(/A\. 4/i));
        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        expect(handleGameEnd).toHaveBeenCalledWith(2);
        vi.useRealTimers();
    });
});
