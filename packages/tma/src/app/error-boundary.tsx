import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { Translations } from '@/lib';
import { ASSETS } from '@/lib';
import { Button, LoadingSpinner } from '@/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  t: Translations;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level error boundary for the TMA.
 *
 * Catches unhandled React rendering errors and displays a branded
 * fallback screen instead of a white-screen-of-death in production.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="flex flex-col items-center justify-center h-full w-full px-8 bg-[#1A1A1A] text-white gap-4">
          <div
            className="w-32 h-32 bg-contain bg-center bg-no-repeat opacity-40"
            style={{ backgroundImage: `url(${ASSETS.LOGO})` }}
          />
          <LoadingSpinner />
          <h2
            className="text-xl font-bold tracking-wide text-center"
            style={{ textShadow: '0 2px 8px rgba(255,255,255,0.15)' }}
          >
            {t.error.title}
          </h2>
          <p className="text-sm text-white/50 text-center max-w-[260px]">{t.error.description}</p>
          <div className="w-full max-w-[200px]">
            <Button layout="pill" variant="cyan" icon="RefreshCw" onClick={this.handleReload}>
              {t.error.reload}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
