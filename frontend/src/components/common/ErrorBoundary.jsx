import { Component } from 'react';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">
              The application encountered an unexpected error. Please refresh or return to the
              dashboard.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 text-xs text-slate-400">{this.state.error.message}</p>
            )}
            <Button className="mt-6" onClick={this.handleReset}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
