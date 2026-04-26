import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Postcard } from './postcard';

describe('Postcard', () => {
  it('renders correctly with an image', () => {
    render(<Postcard imageUrl="https://example.com/test.jpg" />);

    // The component wrapper has title="Postcard"
    const container = screen.getByTitle('Postcard');
    expect(container).toBeInTheDocument();

    // Test the image background
    const imageContainer = container.firstChild as HTMLElement;
    expect(imageContainer).toHaveStyle('background-image: url(https://example.com/test.jpg)');
  });

  it('renders additional metadata', () => {
    render(
      <Postcard
        imageUrl="https://example.com/test.jpg"
        additionalInfo={{ from: 'Alice', date: new Date('2026-01-01T00:00:00.000Z') }}
      />,
    );

    // Check if the from text is displayed
    expect(screen.getByText(/from Alice/i)).toBeInTheDocument();
  });

  it('renders only from if date is missing', () => {
    render(<Postcard imageUrl="https://example.com/test.jpg" additionalInfo={{ from: 'Bob' }} />);

    expect(screen.getByText(/from Bob/i)).toBeInTheDocument();
  });

  it('renders only date if from is missing', () => {
    const testDate = new Date('2026-01-01T00:00:00.000Z');
    render(<Postcard imageUrl="https://example.com/test.jpg" additionalInfo={{ date: testDate }} />);

    // Format is handled by lib, we just ensure the component doesn't crash
    // and renders the span
    const container = screen.getByTitle('Postcard');
    expect(container.textContent).toBeTruthy();
  });

  it('renders image overlay if provided', () => {
    render(
      <Postcard imageUrl="https://example.com/test.jpg" imageOverlay={<div data-testid="overlay">Overlay</div>} />,
    );

    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });
});
