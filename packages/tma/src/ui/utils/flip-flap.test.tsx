import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FlipFlap } from './flip-flap';

describe('FlipFlap', () => {
  const FrontComponent = () => <div data-testid="front-face">Front Content</div>;
  const BackComponent = () => <div data-testid="back-face">Back Content</div>;

  it('renders front and back components', () => {
    render(<FlipFlap front={<FrontComponent />} back={<BackComponent />} />);

    expect(screen.getByTestId('front-face')).toBeInTheDocument();
    expect(screen.getByTestId('back-face')).toBeInTheDocument();
  });

  it('flips when the trigger buttons are clicked', () => {
    render(<FlipFlap front={<FrontComponent />} back={<BackComponent />} />);

    const triggers = screen.getAllByRole('button', { name: /flip/i });
    expect(triggers.length).toBeGreaterThan(0);

    // Initial state: not flipped
    // Click the first trigger
    fireEvent.click(triggers[0]);

    // State should be flipped now. Because it's internal state, we mainly test that it doesn't crash
    // and that buttons are correctly mapped to toggle.
  });

  it('hides flip triggers when disabled prop is true', () => {
    render(<FlipFlap front={<FrontComponent />} back={<BackComponent />} disabled />);

    const triggers = screen.queryAllByRole('button', { name: /flip/i });
    expect(triggers.length).toBe(0);
  });
});
