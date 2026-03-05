import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultView } from './ResultView';

vi.mock('../contexts/AudioContext', () => ({
    useAudio: () => ({
        playGameOver: vi.fn(),
        playHover: vi.fn(),
        playClick: vi.fn(),
    })
}));

describe('ResultView Component', () => {
    it('renders STAGE CLEAR when score meets the threshold', () => {
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={vi.fn()} onViewLeaderboard={vi.fn()} onSubmitScore={vi.fn()} />);

        expect(screen.getByText('STAGE CLEAR!')).toBeInTheDocument();
    });

    it('handles nickname input and submission', async () => {
        const handleSubmit = vi.fn().mockResolvedValue(undefined);
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={vi.fn()} onViewLeaderboard={vi.fn()} onSubmitScore={handleSubmit} />);

        const input = screen.getByPlaceholderText('PLAYER NAME');
        fireEvent.change(input, { target: { value: 'hero' } });
        expect(input).toHaveValue('HERO'); // Check auto-uppercase

        const submitButton = screen.getByText('SUBMIT TO ARENA');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(handleSubmit).toHaveBeenCalledWith('HERO');
        expect(screen.getByText('RANKED SUCCESSFULLY!')).toBeInTheDocument();
    });

    it('triggers onViewLeaderboard after successful submission', async () => {
        const handleViewLeaderboard = vi.fn();
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={vi.fn()} onViewLeaderboard={handleViewLeaderboard} onSubmitScore={vi.fn().mockResolvedValue(undefined)} />);

        const input = screen.getByPlaceholderText('PLAYER NAME');
        fireEvent.change(input, { target: { value: 'hero' } });

        await act(async () => {
            fireEvent.click(screen.getByText('SUBMIT TO ARENA'));
        });

        fireEvent.click(screen.getByText('VIEW HALL OF FAME'));
        expect(handleViewLeaderboard).toHaveBeenCalled();
    });

    it('triggers onRetry when play again is clicked', () => {
        const handleRetry = vi.fn();
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={handleRetry} onViewLeaderboard={vi.fn()} onSubmitScore={vi.fn()} />);

        fireEvent.click(screen.getByText('PLAY AGAIN'));
        expect(handleRetry).toHaveBeenCalledTimes(1);
    });
});
