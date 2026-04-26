import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  describe('Normal Mode', () => {
    it('renders normal button with text', () => {
      render(<Button layout="pill">Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveStyle({ cursor: 'pointer' });
    });

    it('renders normal button with icon', () => {
      render(<Button layout="circle" icon="Check" data-testid="icon-btn" />);
      const btn = screen.getByTestId('icon-btn');
      expect(btn).toBeInTheDocument();
      // An icon should be inside (we don't strictly test Lucide SVGs, just that the button mounts)
    });

    it('handles disabled state', () => {
      render(
        <Button layout="pill" disabled>
          Disabled
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveStyle({ cursor: 'not-allowed' });
    });

    it('handles loading state', () => {
      render(
        <Button layout="pill" status="loading">
          Loading
        </Button>,
      );
      const btn = screen.getByRole('button');
      // Should be disabled while loading
      expect(btn).toBeDisabled();
      // Should hide text and show spinner
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    it('applies variant styling', () => {
      render(
        <Button layout="pill" variant="red">
          Red
        </Button>,
      );
      const btn = screen.getByRole('button');
      expect(btn).toHaveStyle({ backgroundColor: 'rgb(224, 82, 82)' }); // #E05252
    });
  });

  describe('Tab Mode', () => {
    it('renders tab button without background when inactive', () => {
      render(<Button layoutId="tabs" isActive={false} icon="Check" data-testid="tab-btn" />);
      const btn = screen.getByTestId('tab-btn');
      expect(btn).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0)' });
    });

    it('renders tab button with active state', () => {
      render(<Button layoutId="tabs" isActive={true} icon="Check" data-testid="tab-active" />);
      const btn = screen.getByTestId('tab-active');
      expect(btn).toBeInTheDocument();
    });

    it('is clickable when active or inactive', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button layoutId="tabs" isActive={false} onClick={handleClick} data-testid="tab-btn" />);

      const btn = screen.getByTestId('tab-btn');
      await user.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
