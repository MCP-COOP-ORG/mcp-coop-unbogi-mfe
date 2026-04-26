import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders basic textarea', () => {
    render(<Textarea placeholder="Type something" />);
    expect(screen.getByPlaceholderText('Type something')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Textarea error="Too long" />);
    expect(screen.getByText('Too long')).toBeInTheDocument();
  });

  it('displays character count when currentLength and maxLength are provided', () => {
    render(<Textarea maxLength={100} currentLength={50} />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('does not display character count if only maxLength is provided', () => {
    render(<Textarea maxLength={100} />);
    // There shouldn't be a generic regex matching X / Y text
    expect(screen.queryByText(/ \/ /)).not.toBeInTheDocument();
  });

  it('allows text input', async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');

    await user.type(textarea, 'long text');
    expect(textarea).toHaveValue('long text');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });
});
