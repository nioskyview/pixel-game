import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PixelParticles } from './PixelParticles';

describe('PixelParticles Component', () => {
    it('renders and calls onComplete after timeout', async () => {
        vi.useFakeTimers();
        const handleComplete = vi.fn();

        render(<PixelParticles x={100} y={100} onComplete={handleComplete} />);

        vi.advanceTimersByTime(700);
        expect(handleComplete).toHaveBeenCalled();
        vi.useRealTimers();
    });
});
