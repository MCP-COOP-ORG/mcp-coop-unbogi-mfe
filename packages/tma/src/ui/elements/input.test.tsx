import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders basic input', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="Field required" />);
    expect(screen.getByText('Field required')).toBeInTheDocument();
  });

  it('renders with left and right icons', () => {
    render(
      <Input leftIcon={<span data-testid="left-icon">L</span>} rightIcon={<span data-testid="right-icon">R</span>} />,
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('allows text input', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="text-input" />);
    const input = screen.getByTestId('text-input');

    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="text-input" />);
    expect(screen.getByTestId('text-input')).toBeDisabled();
  });
});
