import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultView } from './ResultView';

vi.mock('../audio/AudioManager', () => ({
    useAudio: () => ({
        playGameOver: vi.fn(),
        playCorrect: vi.fn(),
        playHover: vi.fn(),
        playClick: vi.fn(),
    })
}));

describe('ResultView Component', () => {
    it('renders STAGE CLEAR! when score meets the threshold', () => {
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={vi.fn()} onViewLeaderboard={vi.fn()} onSubmitScore={vi.fn()} />);

        expect(screen.getByText('STAGE CLEAR!')).toBeInTheDocument();
    });

    it('handles nickname input and submission', async () => {
        const handleSubmit = vi.fn().mockResolvedValue(undefined);
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={vi.fn()} onViewLeaderboard={vi.fn()} onSubmitScore={handleSubmit} />);

        const input = screen.getByPlaceholderText('PLAYER_ID');
        fireEvent.change(input, { target: { value: 'hero' } });
        expect(input).toHaveValue('HERO'); // Check auto-uppercase

        const submitButton = screen.getByText('SAVE SCORE');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(handleSubmit).toHaveBeenCalledWith('HERO');
        expect(screen.getByText('DATA SYNCHRONIZED ✓')).toBeInTheDocument();
    });

    it('triggers onViewLeaderboard when leaderboard is clicked', () => {
        const handleViewLeaderboard = vi.fn();
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={vi.fn()} onViewLeaderboard={handleViewLeaderboard} onSubmitScore={vi.fn()} />);

        fireEvent.click(screen.getByText('RANKS'));
        expect(handleViewLeaderboard).toHaveBeenCalled();
    });

    it('triggers onRetry when try again is clicked', () => {
        const handleRetry = vi.fn();
        render(<ResultView score={3} totalQuestions={5} threshold={3} onRetry={handleRetry} onViewLeaderboard={vi.fn()} onSubmitScore={vi.fn()} />);

        fireEvent.click(screen.getByText('REBOOT'));
        expect(handleRetry).toHaveBeenCalledTimes(1);
    });
});
