import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

describe('Select', () => {
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
  ];

  it('renders basic select', () => {
    render(<Select options={options} data-testid="select" />);
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Select options={options} placeholder="Choose fruit" defaultValue="" data-testid="select" />);
    expect(screen.getByText('Choose fruit')).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Select options={options} error="Selection required" />);
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<Select options={options} icon={<span data-testid="select-icon">I</span>} />);
    expect(screen.getByTestId('select-icon')).toBeInTheDocument();
  });

  it('allows option selection', async () => {
    const user = userEvent.setup();
    render(<Select options={options} data-testid="select" />);
    const select = screen.getByTestId('select');

    await user.selectOptions(select, 'banana');
    expect(select).toHaveValue('banana');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Select options={options} disabled data-testid="select" />);
    expect(screen.getByTestId('select')).toBeDisabled();
  });
});
