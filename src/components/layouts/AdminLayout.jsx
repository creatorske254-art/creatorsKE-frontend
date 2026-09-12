import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDisputes } from '@/features/admin/hooks/useDisputes';
import { useFlaggedAccounts } from '@/features/admin/hooks/useFlaggedAccounts';
import { useAdmin } from '@/features/admin/hooks/useAdmin';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationList } from '@/features/notifications';
import { getInitials } from '@/lib/utils';
import { IconBell, IconChartBar, IconFlag, IconLockDollar, IconLogout, IconMailForward, IconMenu2, IconScale, IconSearch, IconUserExclamation, IconUserMinus, IconX } from '@tabler/icons-react';


// ─────────────────────────────────────────────────────────────────────────
// Navbar/sidebar shape and color both come from index.css as-is - no local
// palette (the previous slate accent, dark navbar fill, and red/amber
// hex values are gone; everything below resolves through existing tokens).
// This matches the component library's "Dashboard Navbar" pattern exactly:
// logo · search · bell · avatar, no nav links in the navbar (Overview,
// Disputes, Accounts, Reviews all already live in the sidebar).
//
// The bell and avatar are inlined directly with .btn/.badge/.nav-avatar
// (all defined in index.css) rather than imported from shared components,
// since those aren't rendering yet.
//
// What's scoped here is only page-level layout - sticky positioning, scroll
// regions, responsive breakpoints - plus a sidebar divider and a small
// margin-left wrapper for the urgency badges, neither of which has a
// library equivalent.
// ─────────────────────────────────────────────────────────────────────────
const LAYOUT_STYLES = `
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-layout .navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-navbar);
}

.admin-layout__body {
  flex: 1;
  display: flex;
  min-height: calc(100vh - var(--navbar-height));
}

.admin-layout .sidebar {
  position: sticky;
  top: var(--navbar-height);
  height: calc(100vh - var(--navbar-height));
  overflow-y: auto;
}

.admin-layout__search {
  flex: 1;
  display: flex;
  justify-content: center;
}

.admin-layout__search .input-wrapper {
  max-width: var(--navbar-search-max-width);
  width: 100%;
}

.admin-layout__search .search-input {
  width: 100%;
  padding-left: var(--space-32);
}

.admin-layout__search .input-icon.left {
  left: var(--space-12);
}

.admin-layout__main {
  flex: 1;
  padding: var(--gutter-dashboard);
  overflow-y: auto;
  min-width: 0;
}

/* Sidebar divider between groups - no library equivalent. */
.admin-layout__sidebar-divider {
  height: 0.5px;
  background: var(--grey-100);
  margin: var(--space-12) var(--space-12) var(--space-4);
}

/* Positions an urgency .badge at the end of a sidebar row - .badge itself
   has no margin-left rule since it's also used inline (e.g. the navbar bell). */
.admin-layout__sidebar-badge-slot {
  margin-left: auto;
}

.admin-layout__menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: transparent;
}

.admin-layout__backdrop {
  position: fixed;
  inset: 0;
  top: var(--navbar-height);
  background: rgba(0, 0, 0, 0.4);
  z-index: 240;
}

@media (max-width: 860px) {
  .admin-layout__menu-btn {
    display: inline-flex;
  }

  .admin-layout .sidebar {
    display: none;
  }

  .admin-layout .sidebar.mobile-open {
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
  .admin-layout__search {
    display: none;
  }
}
`;

// Sidebar - grouped by operational domain, matching admin journeys.
// `badgeVariant` maps to an existing index.css badge color:
//   'urgent'  → badge-red     (open disputes / flagged accounts - binding decisions)
//   'pending' → badge-warning (flagged reviews - queued, not yet time-critical)
// `badgeCount` keys below are read off the live hook data in AdminLayout().
const SIDEBAR_SECTIONS = [
  {
    label: 'Platform',
    items: [
      { to: '/admin', label: 'Overview', icon: IconChartBar, end: true },
    ],
  },
  {
    label: 'Moderation',
    items: [
      {
        to: '/admin/disputes',
        label: 'Disputes',
        icon: IconScale,
        badgeVariant: 'urgent',
        badgeKey: 'openDisputeCount',
      },
      {
        to: '/admin/accounts',
        label: 'Flagged accounts',
        icon: IconUserExclamation,
        badgeVariant: 'urgent',
        badgeKey: 'flaggedAccountCount',
      },
      {
        to: '/admin/reviews',
        label: 'Flagged reviews',
        icon: IconFlag,
        badgeVariant: 'pending',
        badgeKey: 'flaggedReviewCount',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      // Placeholder items for operational views that sit outside the four
      // MVP pages but are referenced in the admin journeys (escaped escrow,
      // creator abandonment cases, deletion request queue).
      { label: 'Escrow cases',      icon: IconLockDollar,   disabled: true },
      { label: 'Deletion requests', icon: IconUserMinus,    disabled: true },
      { label: 'Re-engagement',     icon: IconMailForward,  disabled: true },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { openDisputeCount } = useDisputes();
  const { flaggedAccountCount } = useFlaggedAccounts();
  const { flaggedReviewCount } = useAdmin();
  const { unreadCount } = useNotifications();

  const badgeCounts = { openDisputeCount, flaggedAccountCount, flaggedReviewCount };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    navigate(`/admin/accounts?q=${encodeURIComponent(q)}`);
  }

  const initials = getInitials(
    user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : ''
  );

  function handleLogout() {
    logout();
  }

  return (
    <>
      <style>{LAYOUT_STYLES}</style>
      <div className="admin-layout">

        {/* ── Navbar: logo · search · bell · avatar (no links - sidebar owns those) ── */}
        <nav className="navbar" aria-label="Admin primary">
          <button
            type="button"
            className="btn btn-square btn-icon-style admin-layout__menu-btn"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? <IconX className="icon-lg" aria-hidden="true" /> : <IconMenu2 className="icon-lg" aria-hidden="true" />}
          </button>

          <NavLink to="/admin" className="navbar-logo">
            Creatorske<span>.</span>
          </NavLink>

          {/* Submits to the accounts moderation list, which reads ?q= */}
          <form className="admin-layout__search" role="search" onSubmit={handleSearchSubmit}>
            <div className="input-wrapper">
              <IconSearch className="icon-sm input-icon left" aria-hidden="true" />
              <input
                className="search-input"
                type="text"
                placeholder="Search accounts…"
                aria-label="Search accounts"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </form>

          <div className="navbar-actions">
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-square btn-icon-style"
                aria-label="Notifications"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((v) => !v)}
              >
                <IconBell className="icon-md" aria-hidden="true" />
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

            <div className="nav-avatar">{initials}</div>
          </div>
        </nav>

        {notifOpen && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 255 }}
            onClick={() => setNotifOpen(false)}
          />
        )}

        {drawerOpen && (
          <div className="admin-layout__backdrop" onClick={() => setDrawerOpen(false)} />
        )}

        {/* ── Body ────────────────────────────────────────── */}
        <div className="admin-layout__body">

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className={`sidebar${drawerOpen ? ' mobile-open' : ''}`} aria-label="Admin sections">
            {SIDEBAR_SECTIONS.map((section, si) => (
              <div key={section.label} className="admin-layout__sidebar-group">
                <div
                  className="sidebar-section"
                  style={si === 0 ? { marginTop: 'var(--space-4)' } : undefined}
                >
                  {section.label}
                </div>

                {section.items.map((item) => {

                  // Disabled stub - not yet built
                  if (item.disabled) {
                    return (
                      <span
                        key={item.label}
                        className="sidebar-link disabled"
                        title="Coming soon"
                      >
                        <item.icon className="icon-md" aria-hidden="true" />
                        {item.label}
                      </span>
                    );
                  }

                  const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : null;
                  const showBadge = !!badgeCount;
                  const badgeClass = item.badgeVariant === 'urgent' ? 'badge-red' : 'badge-warning';

                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      end={item.end ?? false}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `sidebar-link${isActive ? ' active' : ''}`
                      }
                    >
                      <item.icon className="icon-md" aria-hidden="true" />
                      {item.label}
                      {showBadge && (
                        <span
                          className={`admin-layout__sidebar-badge-slot badge ${badgeClass}`}
                          aria-label={`${badgeCount} items`}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}

            <div className="admin-layout__sidebar-divider" style={{ marginTop: 'auto' }} />
            <button
              type="button"
              className="sidebar-link"
              style={{ color: 'var(--status-error-text)' }}
              onClick={handleLogout}
            >
              <IconLogout className="icon-sm" style={{ color: 'var(--status-error)' }} aria-hidden="true" />
              Log out
            </button>
          </aside>

          {/* ── Page content ──────────────────────────────── */}
          <main className="admin-layout__main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}