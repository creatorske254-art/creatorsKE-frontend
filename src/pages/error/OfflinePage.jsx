import { IconWifiOff, IconRefresh } from '@tabler/icons-react';

/**
 * Full-screen takeover shown while the browser itself has no network
 * connection (see useOnlineStatus) — mounted at the app root in main.jsx, in
 * front of everything else, since almost nothing in Creatorske works without
 * connectivity anyway. Disappears automatically the moment the browser
 * reports it's back online.
 */
export default function OfflinePage() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--page-bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--black)', marginBottom: 40 }}>
        Creatorske<span style={{ color: 'var(--purple-500)' }}>.</span>
      </div>

      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: 'var(--grey-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}>
        <IconWifiOff size={24} color="var(--grey-500)" />
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--black)', marginBottom: 12 }}>
        You're offline
      </h1>
      <p style={{ fontSize: 14, color: 'var(--grey-500)', maxWidth: 360, lineHeight: 1.7, marginBottom: 32 }}>
        Check your internet connection. Creatorske will reconnect automatically once you're back online.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
          borderRadius: 8, background: 'var(--black)', color: 'white', fontSize: 13.5,
          fontWeight: 500, border: 'none', cursor: 'pointer',
        }}
      >
        <IconRefresh size={14} /> Try again
      </button>
    </div>
  );
}
