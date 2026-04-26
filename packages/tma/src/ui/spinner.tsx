import { RefreshCw } from 'lucide-react';
import type { ComponentProps } from 'react';

export interface LoadingSpinnerProps extends Omit<ComponentProps<typeof RefreshCw>, 'color'> {
  color?: string;
}

export function LoadingSpinner({ size = 24, color = '#1A1A1A', className = '', ...props }: LoadingSpinnerProps) {
  return <RefreshCw size={size} color={color} strokeWidth={2.5} className={`animate-spin ${className}`} {...props} />;
}
