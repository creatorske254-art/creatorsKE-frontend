import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEnquiries } from '@/features/enquiry/hooks/useEnquiries';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationList } from '@/features/notifications';
import { getInitials } from '@/lib/utils';

// The mockup loads icons via a <link> tag in <head>, not a package import —
// this effect injects that same stylesheet once, so the "ti ti-*" classes
// used below actually have glyphs to render. Safe to call from multiple
// mounts; it no-ops if the link already exists.
const TABLER_ICONS_URL = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css';
function useTablerIcons() {
  useEffect(() => {
    if (document.getElementById('tabler-icons-cdn')) return;
    const link = document.createElement('link');
    link.id = 'tabler-icons-cdn';
    link.rel = 'stylesheet';
    link.href = TABLER_ICONS_URL;
    document.head.appendChild(link);
  }, []);
}

// Component-library chrome (.navbar, .sidebar, .nav-link, .sidebar-link, ...)
// lives in index.css, ported 1:1 from the Creatorske Component Library §05
// (Navigation) — those are shared primitives other pages can reuse too.
//
// The rules below are NOT shared — they're this page's own layout plumbing
// (sticky positioning, scroll regions, the 860px/600px breakpoints), so they
// stay scoped here rather than polluting the global stylesheet. They still
// pull from the shared token set (--navbar-height, --space-*, --z-navbar)
// rather than repeating magic numbers — --navbar-height in particular was a
// "hole": 60px used to be hand-typed in three separate places here.
const DASHBOARD_SHELL_STYLES = `
.dashboard-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.dashboard-shell__navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-navbar);
}

.dashboard-shell__body {
  flex: 1;
  display: flex;
  min-height: calc(100vh - var(--navbar-height));
}

.dashboard-shell__sidebar {
  border-top: 0.5px solid var(--grey-100);
  position: sticky;
  top: var(--navbar-height);
  height: calc(100vh - var(--navbar-height));
  overflow-y: auto;
}

.dashboard-shell__main {
  flex: 1;
  padding: var(--space-28);
  overflow-y: auto;
  min-width: 0;
  background: var(--page-bg);
}

/* Divider above Log out — the section labels above already separate those
   groups, so this is the only divider the sidebar needs. */
.dashboard-shell__sidebar-divider {
  height: 0.5px;
  background: var(--grey-100);
  margin: var(--space-10) var(--space-10) var(--space-4);
}

.dashboard-shell__menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: transparent;
}

.dashboard-shell__backdrop {
  position: fixed;
  inset: 0;
  top: var(--navbar-height);
  background: rgba(0, 0, 0, 0.4);
  z-index: 240;
}

@media (max-width: 860px) {
  .dashboard-shell__menu-btn {
    display: inline-flex;
  }

  .dashboard-shell__sidebar {
    display: none;
  }

  .dashboard-shell__sidebar.mobile-open {
    display: flex;
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    height: calc(100vh - var(--navbar-height));
    width: min(280px, 80vw);
    z-index: 250;
    box-shadow: var(--shadow-xl);
  }
}

@media (max-width: 600px) {
  .dashboard-shell__main {
    padding: var(--space-16) var(--space-12);
  }
}
`;

// Sidebar — grouped sections. Per the library's "Dashboard Shell" pattern,
// the logo lives in the navbar only and every nav link lives in the sidebar
// only (the dashboard navbar itself carries no .nav-link items — just logo,
// search, bell, avatar).
// `badgeKey` maps to a key on useEnquiries()'s pipelineCounts.
// Items for pages that don't exist yet (Client list, Invoices) are left out
// entirely rather than shown as disabled placeholders — add them back once
// those routes exist.
const SIDEBAR_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/creator/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard', end: true },
      { to: '/creator/portfolio', label: 'Portfolio', icon: 'ti-user-circle' },
      { to: '/creator/rate-card', label: 'Rate cards', icon: 'ti-id-badge' },
    ],
  },
  {
    label: 'Clients',
    items: [
      { to: '/creator/enquiries', label: 'Enquiries', icon: 'ti-inbox', badgeKey: 'new' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/creator/money', label: 'Money account', icon: 'ti-wallet' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/creator/settings', label: 'Settings', icon: 'ti-settings' },
    ],
  },
];

export default function CreatorLayout() {
  useTablerIcons();
  const { user, logout } = useAuth();
  const { pipelineCounts } = useEnquiries();
  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = getInitials(
    user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : ''
  );

  return (
    <>
      <style>{DASHBOARD_SHELL_STYLES}</style>
      <div className="dashboard-shell">
        <nav className="navbar dashboard-shell__navbar" aria-label="Primary">
          <button
            type="button"
            className="btn btn-square btn-icon-style dashboard-shell__menu-btn"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            <i className={`ti ${drawerOpen ? 'ti-x' : 'ti-menu-2'}`} style={{ fontSize: '22px' }} aria-hidden="true" />
          </button>

          <NavLink to="/creator/dashboard" className="navbar-logo">
            Creatorske<span>.</span>
          </NavLink>

          {/* Visual-only: no search.service.js exists yet in the codebase.
              Wire up onSubmit/onChange once directory search lands. */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div className="input-wrapper" style={{ maxWidth: 'var(--navbar-search-max-width)', width: '100%' }}>
              <i className="ti ti-search input-icon left" style={{ fontSize: 'var(--size-icon-sm)' }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search…"
                className="search-input"
                style={{
                  width: '100%',
                  fontSize: 'var(--text-body-sm-size)',
                  paddingTop: 'var(--space-7)',
                  paddingBottom: 'var(--space-7)',
                }}
              />
            </div>
          </div>

          {/* Swapped in literal component-library markup here instead of
              abstracted NotificationBell/Avatar components so the topbar
              matches the mockup 1:1. */}
          <div className="navbar-actions">
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-square btn-icon-style"
                aria-label="Notifications"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
              >
                <i className="ti ti-bell" style={{ fontSize: 'var(--size-icon-md)' }} aria-hidden="true" />
              </button>
              {unreadCount > 0 && (
                <span
                  className="badge badge-red"
                  style={{ position: 'absolute', top: 'var(--badge-overlap)', right: 'var(--badge-overlap)' }}
                >
                  {unreadCount}
                </span>
              )}
              {notifOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 260 }}>
                  <div className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
                    <NotificationList onClose={() => setNotifOpen(false)} />
                  </div>
                </div>
              )}
            </div>

            <div className="nav-avatar" title="Account">{initials}</div>
          </div>
        </nav>

        {notifOpen && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 255 }}
            onClick={() => setNotifOpen(false)}
          />
        )}

        {drawerOpen && (
          <div className="dashboard-shell__backdrop" onClick={() => setDrawerOpen(false)} />
        )}

        <div className="dashboard-shell__body">
          <aside
            className={`sidebar dashboard-shell__sidebar${drawerOpen ? ' mobile-open' : ''}`}
            aria-label="Creator sections"
          >
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.label}>
                <div className="sidebar-section">{section.label}</div>

                {section.items.map((item) => {
                  const badgeCount = item.badgeKey ? pipelineCounts?.[item.badgeKey] : null;

                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.end}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `sidebar-link${isActive ? ' active' : ''}`
                      }
                    >
                      <i className={`ti ${item.icon}`} aria-hidden="true" />
                      {item.label}
                      {!!badgeCount && (
                        <span className="sidebar-badge">{badgeCount}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}

            {/* Log out — pinned to the bottom of the sidebar via the
                divider's margin-top: auto — with the error-red treatment,
                matching the mockup. */}
            <div className="dashboard-shell__sidebar-divider" style={{ marginTop: 'auto' }} />
            <button
              type="button"
              className="sidebar-link"
              style={{ color: 'var(--status-error-text)' }}
              onClick={logout}
            >
              <i className="ti ti-logout" style={{ color: 'var(--status-error)' }} aria-hidden="true" />
              Log out
            </button>
          </aside>

          <main className="dashboard-shell__main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}