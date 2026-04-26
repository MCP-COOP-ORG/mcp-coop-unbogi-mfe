import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BottomNav, type BottomNavTab } from './index';

// Mock the store and libs
vi.mock('@/store', () => ({
  SCREENS: { MAIN: 'MAIN' },
  useNavigationStore: () => vi.fn(),
}));

vi.mock('@/lib', () => ({
  tg: {
    haptic: vi.fn(),
  },
  withHaptic: <T extends (...args: unknown[]) => unknown>(fn: T) => fn, // Just return the function directly to make testing easier
}));

describe('BottomNav', () => {
  const mockTabs: BottomNavTab<string>[] = [
    { strategy: 'strat1', id: 'tab1', icon: 'Gift', label: 'Tab 1', variant: 'lime' },
    { strategy: 'strat2', id: 'tab2', icon: 'Library', label: 'Tab 2', variant: 'cyan' },
  ];

  it('renders all buttons', () => {
    render(
      <BottomNav
        tabs={mockTabs}
        activeTabId="tab1"
        onTabChange={vi.fn()}
        onInviteClick={vi.fn()}
        onSendClick={vi.fn()}
      />,
    );

    // Left button
    expect(screen.getByLabelText('Profile or Invite')).toBeInTheDocument();

    // Center tabs
    expect(screen.getByLabelText('Tab 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Tab 2')).toBeInTheDocument();

    // Right button
    expect(screen.getByLabelText('Send Gift')).toBeInTheDocument();
  });

  it('handles tab clicks and calls onTabChange', () => {
    const onTabChange = vi.fn();
    render(
      <BottomNav
        tabs={mockTabs}
        activeTabId="tab1"
        onTabChange={onTabChange}
        onInviteClick={vi.fn()}
        onSendClick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('Tab 2'));
    expect(onTabChange).toHaveBeenCalledWith('strat2');
  });

  it('handles side button clicks', () => {
    const onInviteClick = vi.fn();
    const onSendClick = vi.fn();

    render(
      <BottomNav
        tabs={mockTabs}
        activeTabId="tab1"
        onTabChange={vi.fn()}
        onInviteClick={onInviteClick}
        onSendClick={onSendClick}
      />,
    );

    fireEvent.click(screen.getByLabelText('Profile or Invite'));
    expect(onInviteClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Send Gift'));
    expect(onSendClick).toHaveBeenCalledTimes(1);
  });
});
