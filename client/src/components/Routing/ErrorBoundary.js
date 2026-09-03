import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[UI ERROR]", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--cs-surface)] px-6">
          <div className="max-w-md w-full bg-[var(--cs-surface-elevated)] border border-[var(--cs-border)] rounded-3xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-triangle-exclamation text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold text-[var(--cs-ink)] mb-2">Something went wrong</h1>
            <p className="text-sm text-[var(--cs-ink-muted)] mb-6">Please refresh the page. If the problem persists, try logging out and back in.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-[var(--cs-brand)] hover:bg-[var(--cs-brand-hover)] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
