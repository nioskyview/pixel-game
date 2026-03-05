import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PixelButton } from './PixelButton';

vi.mock('../contexts/AudioContext', () => ({
    useAudio: () => ({
        playHover: vi.fn(),
        playClick: vi.fn(),
    })
}));

describe('PixelButton Component', () => {
    it('renders children correctly', () => {
        render(<PixelButton>Click Me!</PixelButton>);
        expect(screen.getByText('Click Me!')).toBeInTheDocument();
    });

    it('triggers onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(<PixelButton onClick={handleClick}>Click Me!</PixelButton>);

        fireEvent.click(screen.getByText('Click Me!'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies danger color style when variant is danger', () => {
        render(<PixelButton variant="danger">Danger</PixelButton>);
        const button = screen.getByText('Danger');

        // Assert inline style backgroundColor
        expect(button.style.backgroundColor).toBe('var(--danger-color)');
    });

    it('adds blink class when isBlinking is true', () => {
        render(<PixelButton isBlinking={true}>Blinking</PixelButton>);
        const button = screen.getByText('Blinking');

        expect(button).toHaveClass('blink');
    });

    it('adds pop-effect class when variant is success or danger', () => {
        const { rerender } = render(<PixelButton variant="success">Pop</PixelButton>);
        expect(screen.getByText('Pop')).toHaveClass('pop-effect');

        rerender(<PixelButton variant="danger">Pop</PixelButton>);
        expect(screen.getByText('Pop')).toHaveClass('pop-effect');

        rerender(<PixelButton variant="primary">Pop</PixelButton>);
        expect(screen.getByText('Pop')).not.toHaveClass('pop-effect');
    });
});
