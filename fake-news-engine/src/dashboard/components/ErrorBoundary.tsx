import React from 'react';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="chart-container" style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#ff3b30', fontSize: '0.85rem' }}>⚠ Component failed to render</p>
          <p style={{ color: '#555', fontSize: '0.75rem' }}>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
