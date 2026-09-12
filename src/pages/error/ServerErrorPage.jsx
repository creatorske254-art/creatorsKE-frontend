import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { IconRefresh, IconHome, IconAlertTriangle } from '@tabler/icons-react';

/**
 * Generic crash / unexpected-error fallback. Wired as the `errorElement` on
 * every top-level route group in routes/index.jsx, so a render crash or a
 * loader/action error anywhere in the tree shows this instead of a blank
 * white screen. Deliberately has no data fetching and as few dependencies as
 * possible - this is the last line of defense, it must not be able to throw
 * itself.
 */
export default function ServerErrorPage() {
  const error = useRouteError();

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error('[ServerErrorPage] caught:', error);
  }

  const status = isRouteErrorResponse(error) ? error.status : null;
  const isNotFound = status === 404;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 'var(--space-32)', textAlign: 'center', background: 'var(--page-bg)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-40)' }}>
        Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
      </div>

      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: 'var(--status-error-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-20)',
      }}>
        <IconAlertTriangle size={24} color="var(--status-error-text)" />
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--black)', marginBottom: 'var(--space-12)' }}>
        {isNotFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p style={{ fontSize: 14, color: 'var(--grey-500)', maxWidth: 380, lineHeight: 1.7, marginBottom: 'var(--space-32)' }}>
        {isNotFound
          ? "The page you're looking for doesn't exist or may have moved."
          : "We hit an unexpected error loading this page. Try reloading. If it keeps happening, let us know."}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-12) var(--space-20)',
            borderRadius: 8, border: '0.5px solid var(--grey-200)', background: 'var(--white)',
            color: 'var(--black)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <IconRefresh size={14} /> Reload page
        </button>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8)', padding: 'var(--space-12) var(--space-20)',
            borderRadius: 8, background: 'var(--black)', color: 'var(--white)', fontSize: 13.5,
            fontWeight: 500, textDecoration: 'none',
          }}
        >
          <IconHome size={14} /> Go to homepage
        </Link>
      </div>
    </div>
  );
}
