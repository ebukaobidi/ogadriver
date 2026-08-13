import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to monitoring service if available
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: { errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
                <p className="text-slate-400">An unexpected error occurred while rendering this page</p>
              </div>
            </div>

            <details className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800">
              <summary className="text-sm font-bold text-slate-300 cursor-pointer hover:text-white transition-colors">
                View error details
              </summary>
              <div className="mt-4 space-y-2">
                {this.state.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-xs font-mono text-red-400">{this.state.error.toString()}</p>
                  </div>
                )}
                {this.state.errorInfo && (
                  <pre className="text-xs text-slate-500 overflow-x-auto whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-brandMint text-corporateNavy font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} /> Go Home
              </button>
            </div>

            <p className="text-xs text-slate-600 text-center mt-4">
              Error ID: {Date.now().toString(36)}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
