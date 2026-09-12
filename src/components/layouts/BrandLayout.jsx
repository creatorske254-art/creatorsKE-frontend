import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useBrandDashboard } from '@/features/brand-dashboard/hooks/useBrandDashboard';
import { useEnquiries } from '@/features/enquiry';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationList } from '@/features/notifications';
import { getInitials } from '@/lib/utils';
import { IconBell, IconBookmark, IconClockHour4, IconInbox, IconLayoutDashboard, IconLogout, IconMenu2, IconReceipt2, IconReportMoney, IconRocket, IconSearch, IconSettings, IconWorldSearch, IconX } from '@tabler/icons-react';


// ─────────────────────────────────────────────────────────────────────────
// Navbar/sidebar shape and color both come from index.css as-is - no local
// palette. This matches the component library's "Dashboard Navbar" pattern
// exactly: logo · search · bell · avatar, with no nav links in the navbar
// (Dashboard, Campaigns and Shortlist already live in the sidebar below,
// so a duplicate set of top links isn't needed).
//
// What's scoped here is only page-level layout - sticky positioning, scroll
// regions, responsive breakpoints - plus two small brand-only widgets that
// have no equivalent in the library: the "Brand" role pill and the live
// green status dot on "Active campaigns". Both reuse existing index.css
// tokens (--purple-*, --status-success) rather than introducing new colors.
// ─────────────────────────────────────────────────────────────────────────
const LAYOUT_STYLES = `
.brand-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.brand-layout .navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-navbar);
}

.brand-layout__body {
  flex: 1;
  display: flex;
  min-height: calc(100vh - var(--navbar-height));
}

.brand-layout .sidebar {
  position: sticky;
  top: var(--navbar-height);
  height: calc(100vh - var(--navbar-height));
  overflow-y: auto;
}

.brand-layout__search {
  flex: 1;
  display: flex;
  justify-content: center;
}

.brand-layout__search .input-wrapper {
  max-width: var(--navbar-search-max-width);
  width: 100%;
}

.brand-layout__search .search-input {
  width: 100%;
  padding-left: var(--space-32);
}

.brand-layout__search .input-icon.left {
  left: var(--space-12);
}

.brand-layout__main {
  flex: 1;
  padding: var(--gutter-dashboard);
  overflow-y: auto;
  min-width: 0;
}

/* Divider above Log out - section labels already separate the groups
   above it, so this is the only divider the sidebar needs. */
.brand-layout__sidebar-divider {
  height: 0.5px;
  background: var(--grey-100);
  margin: var(--space-12) var(--space-12) var(--space-4);
}

/* Live status dot for "Active campaigns" - distinct from .sidebar-badge
   (a count, not a status indicator), so it's brand-only. Reuses the
   existing success token. */
.brand-layout__sidebar-status {
  margin-left: auto;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--status-success);
  flex-shrink: 0;
}

.brand-layout__menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  background: transparent;
}

.brand-layout__backdrop {
  position: fixed;
  inset: 0;
  top: var(--navbar-height);
  background: rgba(0, 0, 0, 0.4);
  z-index: 240;
}

@media (max-width: 860px) {
  .brand-layout__menu-btn {
    display: inline-flex;
  }

  .brand-layout .sidebar {
    display: none;
  }

  .brand-layout .sidebar.mobile-open {
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
  .brand-layout__search {
    display: none;
  }
}
`;

// Sidebar - grouped by workflow stage matching brand journeys in the product spec.
// Discovery → Campaigns → Payments → Account
//
// `disabled` items are stubs for pages not yet built - they keep the sidebar
// readable without creating dead links.
// `hasActiveDot` renders a small green dot when the brand has live campaigns
// (wire to `activeCampaignCount > 0` once useBrandDashboard exists).
const SIDEBAR_SECTIONS = [
  {
    label: 'Discovery',
    items: [
      { to: '/brand/dashboard',  label: 'Dashboard',  icon: IconLayoutDashboard, end: true },
      { to: '/brand/shortlist',  label: 'Shortlist',  icon: IconBookmark },
      { to: '/directory', label: 'Creator directory', icon: IconWorldSearch },
    ],
  },
  {
    label: 'Campaigns',
    items: [
      { to: '/brand/enquiries',         label: 'Enquiries',          icon: IconInbox,         badgeKey: 'new' },
      { to: '/brand/campaigns',         label: 'Active campaigns',   icon: IconRocket,        hasActiveDot: true },
      { to: '/brand/campaigns?filter=history', label: 'Campaign history', icon: IconClockHour4 },
    ],
  },
  {
    label: 'Payments',
    items: [
      { to: '/brand/billing',      label: 'Billing & invoices',  icon: IconReceipt2 },
      { to: '/brand/transactions', label: 'Transaction history', icon: IconReportMoney },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/brand/settings', label: 'Settings', icon: IconSettings },
    ],
  },
];

export default function BrandLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeCampaignCount } = useBrandDashboard();
  const { pipelineCounts } = useEnquiries();
  const { unreadCount } = useNotifications();

  const initials = getInitials(
    user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : ''
  );

  const [searchValue, setSearchValue] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    // Reuses the public creator directory - there's no brand-only search route.
    navigate(`/directory?q=${encodeURIComponent(query)}`);
  }

  function handleLogout() {
    logout();
  }

  return (
    <>
      <style>{LAYOUT_STYLES}</style>
      <div className="brand-layout">

        {/* ── Navbar: logo · search · bell · avatar (no links - sidebar owns those) ── */}
        <nav className="navbar" aria-label="Primary">
          <button
            type="button"
            className="btn btn-square btn-icon-style brand-layout__menu-btn"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? <IconX className="icon-lg" aria-hidden="true" /> : <IconMenu2 className="icon-lg" aria-hidden="true" />}
          </button>

          <NavLink to="/brand/dashboard" className="navbar-logo">
            Creatorske<span>.</span>
          </NavLink>

          <form className="brand-layout__search" onSubmit={handleSearchSubmit} role="search">
            <div className="input-wrapper">
              <IconSearch className="icon-sm input-icon left" aria-hidden="true" />
              <input
                className="search-input"
                type="text"
                placeholder="Search…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Search"
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
          <div className="brand-layout__backdrop" onClick={() => setDrawerOpen(false)} />
        )}

        {/* ── Body ────────────────────────────────────────── */}
        <div className="brand-layout__body">

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className={`sidebar${drawerOpen ? ' mobile-open' : ''}`} aria-label="Brand sections">
            {SIDEBAR_SECTIONS.map((section, si) => (
              <div key={section.label} className="brand-layout__sidebar-group">
                <div
                  className="sidebar-section"
                  style={si === 0 ? { marginTop: 'var(--space-4)' } : undefined}
                >
                  {section.label}
                </div>

                {section.items.map((item) => {

                  // Disabled stub - inert placeholder for pages not yet built
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

                  const showDot = item.hasActiveDot && activeCampaignCount > 0;
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
                      <item.icon className="icon-md" aria-hidden="true" />
                      {item.label}
                      {!!badgeCount && (
                        <span className="sidebar-badge">{badgeCount}</span>
                      )}
                      {showDot && (
                        <span
                          className="brand-layout__sidebar-status"
                          title={`${activeCampaignCount} active`}
                          aria-label={`${activeCampaignCount} active campaigns`}
                        />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}

            <div className="brand-layout__sidebar-divider" style={{ marginTop: 'auto' }} />
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
          <main className="brand-layout__main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}