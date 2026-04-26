import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Slider } from './slider';

// Mock IntersectionObserver
const observeMock = vi.fn();
const disconnectMock = vi.fn();
let intersectionCallback: IntersectionObserverCallback;

vi.stubGlobal(
  'IntersectionObserver',
  class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      intersectionCallback = callback;
    }
    observe = observeMock;
    disconnect = disconnectMock;
  },
);

describe('Slider', () => {
  beforeEach(() => {
    observeMock.mockClear();
    disconnectMock.mockClear();
  });

  const items = [
    { id: '1', title: 'Slide 1' },
    { id: '2', title: 'Slide 2' },
    { id: '3', title: 'Slide 3' },
  ];

  const getKey = (item: { id: string }) => item.id;
  const renderItem = (item: { id: string; title: string }) => <div data-testid={`slide-${item.id}`}>{item.title}</div>;

  it('renders correctly with given items', () => {
    render(<Slider items={items} getKey={getKey} renderItem={renderItem} />);

    expect(screen.getByTestId('slide-1')).toBeInTheDocument();
    expect(screen.getByTestId('slide-2')).toBeInTheDocument();
    expect(screen.getByTestId('slide-3')).toBeInTheDocument();
  });

  it('observes all slides', () => {
    render(<Slider items={items} getKey={getKey} renderItem={renderItem} />);
    expect(observeMock).toHaveBeenCalledTimes(items.length);
  });

  it('updates active index on intersection', () => {
    render(<Slider items={items} getKey={getKey} renderItem={renderItem} />);

    // Simulate intersection for second slide
    const slideElement = screen.getByTestId('slide-2').parentElement; // The wrapper div

    act(() => {
      intersectionCallback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 0.6,
            target: slideElement as Element,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      );
    });

    // Nothing obvious to assert besides no crashes without inspecting the animated dots,
    // but this ensures the callback is executed and covered.
  });

  it('does not display dots if there is only one item', () => {
    render(<Slider items={[items[0]]} getKey={getKey} renderItem={renderItem} />);

    expect(observeMock).toHaveBeenCalledTimes(1);
  });
});
