import { Component } from 'react';

/**
 * Root-level crash catcher, mounted in main.jsx around the entire provider
 * tree (AuthProvider, NotificationProvider, AppRouter). React Router's own
 * `errorElement` (wired per route group in routes/index.jsx) already catches
 * render/loader errors *inside* the router - this class component is the
 * backstop for anything above it, like a crash in AuthProvider itself, where
 * the router may not even be mounted yet.
 *
 * Its fallback UI is deliberately self-contained (no react-router hooks or
 * <Link>) - if the crash happened before the router mounted, anything that
 * depends on router context would itself throw, defeating the boundary.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] caught:', error, info);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 32, textAlign: 'center', background: 'var(--page-bg, #F2F2F2)',
        fontFamily: 'var(--font-body, sans-serif)',
      }}>
        <div style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 20, fontWeight: 600, color: 'var(--black, #000)', marginBottom: 40 }}>
          Creatorske<span style={{ color: 'var(--purple-500, #665DC7)' }}>.</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: 24, fontWeight: 600, color: 'var(--black, #000)', marginBottom: 12 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 14, color: 'var(--grey-500, #808080)', maxWidth: 380, lineHeight: 1.7, marginBottom: 32 }}>
          Creatorske hit an unexpected error and couldn't continue. Reloading the page usually fixes this.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px', borderRadius: 8, background: 'var(--black, #000)', color: 'var(--white, #fff)',
            fontSize: 13.5, fontWeight: 500, border: 'none', cursor: 'pointer',
          }}
        >
          Reload page
        </button>
      </div>
    );
  }
}
