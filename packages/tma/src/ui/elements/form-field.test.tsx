import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './form-field';

describe('FormField', () => {
  it('renders children correctly', () => {
    render(
      <FormField>
        <div data-testid="child">Child content</div>
      </FormField>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(
      <FormField error="Invalid input">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });

  it('applies disabled styles', () => {
    const { container } = render(
      <FormField disabled>
        <input disabled />
      </FormField>,
    );
    // Since styles are appended as class names, we can check for the presence of typical disabled classes
    expect(container.firstChild?.firstChild).toHaveClass('opacity-60');
    expect(container.firstChild?.firstChild).toHaveClass('pointer-events-none');
  });
});
