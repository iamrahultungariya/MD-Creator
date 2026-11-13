import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Ignore third-party extension errors so app component tree is never destroyed
    const isExtensionError = 
      error?.message?.includes('chrome-extension://') ||
      error?.message?.includes('moz-extension://') ||
      error?.message?.includes('safari-extension://');
    if (isExtensionError) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('__last_react_error__', JSON.stringify({
          message: error?.message,
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
        }));
      }
    } catch {}

    this.setState({ componentStack: errorInfo?.componentStack ?? undefined });

    // Completely ignore third-party browser extensions errors (never trigger auto-reloads)
    const isExtensionError = 
      error?.message?.includes('chrome-extension://') ||
      error?.message?.includes('moz-extension://') ||
      error?.message?.includes('safari-extension://') ||
      errorInfo?.componentStack?.includes('chrome-extension://');

    if (isExtensionError) {
      return;
    }

    // Auto-reload if dynamic chunk failed to load due to a new deployment (strictly throttled)
    const isChunkLoadError = 
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Loading CSS chunk');

    if (isChunkLoadError && typeof window !== 'undefined') {
      const reloadKey = 'md_writer_chunk_reload_attempt';
      const lastAttempt = Number(sessionStorage.getItem(reloadKey) || '0');
      const now = Date.now();
      // Strict 60-second cooldown so it can NEVER loop reload
      if (now - lastAttempt > 60000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] text-[#1B1626] dark:text-[#EDEAF5] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#15111E] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                A component encountered an unexpected error. Your documents stored in local IndexedDB are safe and intact.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 max-w-full text-left max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                <div className="font-semibold text-rose-500 mb-1">{this.state.error.message}</div>
                {this.state.componentStack && (
                  <div className="text-[10px] opacity-75 mt-1 border-t border-neutral-200 dark:border-neutral-800 pt-1">
                    {this.state.componentStack}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer shadow-xs active:translate-y-[1px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
