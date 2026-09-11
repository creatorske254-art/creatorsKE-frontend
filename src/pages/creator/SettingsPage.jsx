import { useState } from "react";
import { usePageMeta } from '@/lib/usePageMeta';

// Page-scoped styles
// Every value below reads from the global index.css tokens (--purple-*,
// --grey-*, --status-*, --radius-*, --space-*, --text-*, --shadow-*).
// Nothing here redefines a token or a color; index.css is the single
// source of truth, this file only adds the handful of component patterns
// index.css doesn't already ship (tabs, toggle, field labels, bento grid,
// notification/payment rows, danger zone, save bar). Everything else
// (.card, .btn-*, .input, .tag, .avatar, .stat-card…) is used as-is from
// the global stylesheet.
const css = `
  /* This page sits inside the dashboard's content area, which already
     supplies var(--page-bg). No background here, and no min-height/100vh
     this is a nested panel, not a standalone page. It fills the content
     area edge to edge; the dashboard shell owns the outer gutter. */
  .settings-page {
    font-family: var(--font-body);
    color: var(--black);
    font-size: var(--text-body-size);
    line-height: 1.6;
  }

  /* Header */
  .settings-header { margin-bottom: var(--space-24); }
  .settings-sub { font-size: var(--text-body-sm-size); color: var(--grey-500); margin-top: var(--space-2); }

  /* Tabs (pill track, per component library §Navigation) */
  .settings-tabs {
    display: flex;
    gap: 2px;
    background: var(--white);
    border: 0.5px solid var(--grey-100);
    box-shadow: var(--shadow-xs);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-24);
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
  }
  .settings-tab {
    display: flex;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-8) var(--space-16);
    border-radius: var(--radius-md);
    border: none;
    background: none;
    font-family: var(--font-body);
    font-size: var(--text-body-sm-size);
    font-weight: 500;
    color: var(--grey-500);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }
  .settings-tab:hover { color: var(--black); background: var(--page-bg); }
  .settings-tab.active { background: var(--purple-600); color: var(--white); }
  .settings-tab.active:hover { background: var(--purple-600); color: var(--white); }
  .settings-tab i { font-size: var(--size-icon-md); }

  /* Bento grid utilities */
  /* Content fills the full width of the content area, no max-width cap,
     and reflows into single column once it can't fit two/three/four up. */
  .bento-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-16); align-items: start; }
  .bento-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-16); align-items: start; }
  .bento-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-16); align-items: start; }
  .bento-span-2 { grid-column: span 2; }
  .settings-stack { display: flex; flex-direction: column; gap: var(--space-16); }

  /* Field */
  .field { display: flex; flex-direction: column; gap: var(--space-6); }
  .field-label {
    font-size: var(--text-caption-size);
    font-weight: 500;
    letter-spacing: var(--text-caption-tracking);
    text-transform: uppercase;
    color: var(--grey-600);
  }
  .field-required::after { content: ' *'; color: var(--status-error); }
  .field-hint { font-size: 12px; color: var(--grey-400); line-height: 1.5; margin-top: var(--space-2); }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); }
  .field-divider { height: 0.5px; background: var(--grey-100); margin: var(--space-2) 0; }

  /* index.css positions the icon glyph (.input-icon / .left / .right) but
     doesn't yet ship the matching input padding, added here so the icon
     never overlaps typed text. */
  .input-icon-left { padding-left: 40px !important; }
  .input-icon-right { padding-right: 40px !important; }
  .textarea { resize: vertical; min-height: 100px; line-height: 1.6; }

  /* This page packs in far more fields than a typical form, so the default
     .input border (meant for a single isolated field) reads as a grid of
     boxes when repeated dozens of times. Swap resting-state emphasis from
     border to a faint fill, and let the border do its job only on focus,
     surface shading over stacked outlines, per standard "too many borders"
     UI guidance. */
  .settings-page .input,
  .settings-page .select-wrapper select {
    border-color: var(--grey-100) !important;
    background: var(--page-bg) !important;
    transition: all var(--transition-fast);
  }
  .settings-page .input:hover,
  .settings-page .select-wrapper select:hover {
    border-color: var(--grey-200) !important;
  }
  .settings-page .input:focus,
  .settings-page .select-wrapper select:focus {
    border-color: var(--purple-600) !important;
    background: var(--white) !important;
  }

  /* Toggle switch (per component library §Forms) */
  .settings-toggle {
    width: 44px;
    height: 24px;
    border-radius: var(--radius-pill);
    background: var(--grey-200);
    position: relative;
    cursor: pointer;
    transition: background var(--transition-fast);
    flex-shrink: 0;
    border: none;
    padding: 0;
  }
  .settings-toggle.on { background: var(--purple-600); }
  .settings-toggle::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--white);
    box-shadow: var(--shadow-xs);
    transition: transform var(--transition-fast);
  }
  .settings-toggle.on::after { transform: translateX(20px); }

  .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-12); }
  .toggle-row-text .toggle-row-label { font-size: var(--text-body-sm-size); font-weight: 500; }

  /* Notification row */
  .notif-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-16); padding: var(--space-12) 0; }
  .notif-row:not(:last-child) { border-bottom: 0.5px solid var(--grey-100); }
  .notif-row-label { font-size: var(--text-body-sm-size); font-weight: 500; }
  .notif-row-desc { font-size: 12px; color: var(--grey-400); margin-top: var(--space-2); }

  /* Payment method row */
  .pay-row {
    display: flex;
    align-items: center;
    gap: var(--space-12);
    padding: var(--space-12) 14px;
    border: 0.5px solid transparent;
    border-radius: var(--radius-lg);
    background: var(--page-bg);
    transition: all var(--transition-fast);
  }
  .pay-row.connected { background: var(--white); border-color: var(--grey-100); box-shadow: var(--shadow-xs); }
  .pay-icon { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: var(--text-h4-size); flex-shrink: 0; }
  .pay-info { flex: 1; min-width: 0; }
  .pay-name { font-size: var(--text-body-sm-size); font-weight: 500; }
  .pay-desc { font-size: 11.5px; color: var(--grey-400); margin-top: 1px; }

  /* Selectable option card (theme / layout pickers) */
  .option-card {
    padding: var(--space-12);
    border: 0.5px solid transparent;
    border-radius: var(--radius-lg);
    background: var(--page-bg);
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
  }
  .option-card:hover { background: var(--grey-100); }
  .option-card.selected { border-color: var(--black); background: var(--white); box-shadow: var(--shadow-xs); }
  .option-card-label { font-size: var(--text-body-sm-size); }
  .option-card.selected .option-card-label { font-weight: 600; }

  /* Accent swatches */
  .accent-swatch { width: 26px; height: 26px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all var(--transition-fast); flex-shrink: 0; }
  .accent-swatch.selected { border-color: var(--black); box-shadow: 0 0 0 2px var(--white) inset; }

  /* Danger zone */
  .danger-zone { border: 0.5px solid rgba(239,68,68,0.15); background: var(--status-error-bg); border-radius: var(--radius-xl); padding: var(--space-20); }
  .danger-zone-title { font-family: var(--font-display); font-size: var(--text-h5-size); font-weight: 600; color: var(--status-error-text); margin-bottom: var(--space-4); }
  .danger-zone-desc { font-size: 12.5px; color: var(--status-error-text); opacity: 0.85; margin-bottom: var(--space-16); }

  /* Save bar: floats above the bottom edge with its own card surface,
     instead of bleeding flush into the content above and the viewport
     below. The gap above is what makes it read as a separate, persistent
     control rather than the last item in the stack. */
  .settings-savebar {
    background: var(--white);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-xl);
    padding: var(--space-12) var(--space-20);
    position: sticky;
    bottom: var(--space-16);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-8);
    margin-top: var(--space-24);
    box-shadow: var(--shadow-md);
  }
  .settings-savebar-hint { font-size: 12px; color: var(--grey-400); }

  /* Responsive */
  @media (max-width: 900px) {
    .bento-4 { grid-template-columns: repeat(2, 1fr); }
    .bento-3 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .bento-2, .bento-3, .bento-4 { grid-template-columns: 1fr; }
    .bento-span-2 { grid-column: span 1; }
    .field-row { grid-template-columns: 1fr; }
    .settings-tabs { width: 100%; }
  }
`;

const TABS = [
  { id: "profile", label: "Profile", icon: "ti-user" },
  { id: "notifications", label: "Notifications", icon: "ti-bell" },
  { id: "payments", label: "Payments", icon: "ti-wallet" },
  { id: "appearance", label: "Appearance", icon: "ti-palette" },
  { id: "account", label: "Account", icon: "ti-shield-lock" },
];

const ACCENT_COLORS = [
  { hex: "#534AB7", label: "Purple" },
  { hex: "#0D0D0C", label: "Ink" },
  { hex: "#0F6E56", label: "Forest" },
  { hex: "#854F0B", label: "Amber" },
  { hex: "#185FA5", label: "Ocean" },
  { hex: "#993556", label: "Rose" },
  { hex: "#993C1D", label: "Rust" },
];

// Sub-components

function Toggle({ on, onChange }) {
  return (
    <button
      className={`settings-toggle${on ? " on" : ""}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    />
  );
}

function ToggleRow({ label, desc, on, onChange }) {
  return (
    <div className="toggle-row">
      <div className="toggle-row-text">
        <div className="toggle-row-label">{label}</div>
        {desc && <p className="field-hint">{desc}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

// Tab panels

function ProfileTab() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-stack">
      {/* Avatar & name */}
      <div className="card card-p-lg">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span className="card-title" style={{ marginBottom: 0 }}>Public profile</span>
          <span className="tag tag-success">
            <span className="sdot" style={{ background: "var(--status-success)" }} />
            Live
          </span>
        </div>

        <div className="settings-stack">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="avatar avatar-lg avatar-purple">AO</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="btn btn-secondary btn-sm">
                <i className="ti ti-upload" style={{ fontSize: 12 }} />
                Upload photo
              </button>
              <p className="field-hint" style={{ marginTop: 0 }}>JPG or PNG · max 2 MB</p>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">First name</label>
              <input className="input input-md" defaultValue="Amara" />
            </div>
            <div className="field">
              <label className="field-label field-required">Last name</label>
              <input className="input input-md" defaultValue="Osei" />
            </div>
          </div>

          <div className="field">
            <label className="field-label field-required">Creator handle</label>
            <div className="input-wrapper">
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: "var(--grey-400)",
                  pointerEvents: "none",
                }}
              >
                @
              </span>
              <input className="input input-md" style={{ paddingLeft: 26 }} defaultValue="amaracreates" />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Bio</label>
            <textarea
              className="input input-md textarea"
              rows={3}
              defaultValue="Lifestyle & travel creator based in Nairobi, partnering with brands that align with authentic storytelling."
            />
            <p className="field-hint">Appears on your public rate card. Keep it under 120 characters.</p>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Location</label>
              <div className="input-wrapper">
                <i className="ti ti-map-pin input-icon left" />
                <input className="input input-md input-icon-left" defaultValue="Nairobi, Kenya" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Category</label>
              <div className="select-wrapper">
                <select className="input input-md">
                  <option>Lifestyle & Travel</option>
                  <option>Fashion & Beauty</option>
                  <option>Food & Wellness</option>
                  <option>Tech & Gaming</option>
                  <option>Finance & Business</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audience stats: bento of stat-cards, mirrors the dashboard KPI pattern */}
      <div>
        <div className="field-label" style={{ marginBottom: 12 }}>Audience stats</div>
        <div className="bento-4">
          <div className="stat-card">
            <div className="stat-card-label">Total followers</div>
            <div className="stat-card-value">240K</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Avg engagement</div>
            <div className="stat-card-value">4.8%</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Avg reach / post</div>
            <div className="stat-card-value">18K</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Primary platform</div>
            <div className="select-wrapper" style={{ marginTop: 6 }}>
              <select className="input input-sm">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>YouTube</option>
                <option>Twitter / X</option>
              </select>
            </div>
          </div>
        </div>
        <p className="field-hint" style={{ marginTop: 8 }}>Shown on your public rate card.</p>
      </div>

      {/* Social links */}
      <div className="card card-p-lg">
        <span className="card-title">Social platforms</span>
        <div className="settings-stack" style={{ gap: 14, marginTop: 14 }}>
          <div className="field">
            <label className="field-label">Instagram</label>
            <div className="input-wrapper">
              <i className="ti ti-brand-instagram input-icon left" />
              <input className="input input-md input-icon-left" defaultValue="instagram.com/amaracreates" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">TikTok</label>
              <div className="input-wrapper">
                <i className="ti ti-brand-tiktok input-icon left" />
                <input className="input input-md input-icon-left" defaultValue="tiktok.com/@amaracreates" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">YouTube</label>
              <div className="input-wrapper">
                <i className="ti ti-brand-youtube input-icon left" />
                <input className="input input-md input-icon-left" placeholder="youtube.com/…" />
              </div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Twitter / X</label>
              <div className="input-wrapper">
                <i className="ti ti-brand-twitter input-icon left" />
                <input className="input input-md input-icon-left" placeholder="x.com/…" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">WhatsApp business</label>
              <div className="input-wrapper">
                <i className="ti ti-brand-whatsapp input-icon left" style={{ color: "var(--status-success)" }} />
                <input className="input input-md input-icon-left" type="tel" defaultValue="+254 712 345 678" />
              </div>
            </div>
          </div>
          <p className="field-hint">WhatsApp number is used for the "Enquire" button on your rate card.</p>
        </div>
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  );
}

function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    newEnquiry: true,
    bookingConfirmed: true,
    paymentReceived: true,
    weeklyDigest: false,
    cardViews: false,
    productUpdates: true,
  });

  function toggle(key) {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const [saved, setSaved] = useState(false);
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-stack">
      <div className="bento-2">
        <div className="card card-p-lg">
          <span className="card-title">Email notifications</span>
          <div style={{ marginTop: 10 }}>
            <div className="notif-row">
              <div>
                <div className="notif-row-label">New enquiry</div>
                <div className="notif-row-desc">When a brand submits an enquiry from your rate card</div>
              </div>
              <Toggle on={notifs.newEnquiry} onChange={() => toggle("newEnquiry")} />
            </div>
            <div className="notif-row">
              <div>
                <div className="notif-row-label">Booking confirmed</div>
                <div className="notif-row-desc">When a client books and pays for a package</div>
              </div>
              <Toggle on={notifs.bookingConfirmed} onChange={() => toggle("bookingConfirmed")} />
            </div>
            <div className="notif-row">
              <div>
                <div className="notif-row-label">Payment received</div>
                <div className="notif-row-desc">Each time a payment lands in your account</div>
              </div>
              <Toggle on={notifs.paymentReceived} onChange={() => toggle("paymentReceived")} />
            </div>
            <div className="notif-row" style={{ borderBottom: "none" }}>
              <div>
                <div className="notif-row-label">Weekly performance digest</div>
                <div className="notif-row-desc">Views, enquiries, and earnings summary every Monday</div>
              </div>
              <Toggle on={notifs.weeklyDigest} onChange={() => toggle("weeklyDigest")} />
            </div>
          </div>
        </div>

        <div className="settings-stack">
          <div className="card card-p-lg">
            <span className="card-title">More notifications</span>
            <div style={{ marginTop: 10 }}>
              <div className="notif-row">
                <div>
                  <div className="notif-row-label">Card view milestones</div>
                  <div className="notif-row-desc">Notify me at 100, 500, 1K+ views</div>
                </div>
                <Toggle on={notifs.cardViews} onChange={() => toggle("cardViews")} />
              </div>
              <div className="notif-row" style={{ borderBottom: "none" }}>
                <div>
                  <div className="notif-row-label">Product updates</div>
                  <div className="notif-row-desc">New features and platform announcements</div>
                </div>
                <Toggle on={notifs.productUpdates} onChange={() => toggle("productUpdates")} />
              </div>
            </div>
          </div>

          <div className="card card-p-lg">
            <span className="card-title">Notification email</span>
            <div className="field" style={{ marginTop: 10 }}>
              <label className="field-label">Send notifications to</label>
              <div className="input-wrapper">
                <i className="ti ti-mail input-icon left" />
                <input className="input input-md input-icon-left" type="email" defaultValue="amara@example.com" />
              </div>
              <p className="field-hint">We'll also send receipts and important account info here.</p>
            </div>
          </div>
        </div>
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  );
}

function PaymentsTab() {
  const [methods, setMethods] = useState({
    mpesa: true,
    stripe: false,
    bank: false,
  });

  return (
    <div className="settings-stack">
      <div className="card card-p-lg">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span className="card-title" style={{ marginBottom: 0 }}>Payment methods</span>
          <p className="field-hint" style={{ margin: 0 }}>Accept payments from brands directly</p>
        </div>
        <div className="settings-stack" style={{ gap: 12, marginTop: 16 }}>
          {/* M-Pesa */}
          <div className={`pay-row${methods.mpesa ? " connected" : ""}`}>
            <div className="pay-icon" style={{ background: "var(--tint-green-bg)", color: "var(--tint-green-text)" }}>
              <i className="ti ti-device-mobile" />
            </div>
            <div className="pay-info">
              <div className="pay-name">M-Pesa</div>
              <div className="pay-desc">
                {methods.mpesa ? "+254 712 345 678 · Till 123456" : "Connect your M-Pesa till or paybill"}
              </div>
            </div>
            {methods.mpesa ? (
              <span className="tag tag-success">
                <span className="sdot" style={{ background: "var(--status-success)" }} />
                Connected
              </span>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setMethods((p) => ({ ...p, mpesa: true }))}>
                Connect
              </button>
            )}
          </div>

          {/* Stripe */}
          <div className={`pay-row${methods.stripe ? " connected" : ""}`}>
            <div className="pay-icon" style={{ background: "var(--purple-50)", color: "var(--purple-600)" }}>
              <i className="ti ti-credit-card" />
            </div>
            <div className="pay-info">
              <div className="pay-name">Stripe</div>
              <div className="pay-desc">
                {methods.stripe ? "Account connected · Visa / Mastercard" : "Accept card payments internationally"}
              </div>
            </div>
            {methods.stripe ? (
              <span className="tag tag-success">
                <span className="sdot" style={{ background: "var(--status-success)" }} />
                Connected
              </span>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setMethods((p) => ({ ...p, stripe: true }))}>
                Connect
              </button>
            )}
          </div>

          {/* Bank */}
          <div className={`pay-row${methods.bank ? " connected" : ""}`}>
            <div className="pay-icon" style={{ background: "var(--page-bg)", color: "var(--grey-600)" }}>
              <i className="ti ti-building-bank" />
            </div>
            <div className="pay-info">
              <div className="pay-name">Bank transfer</div>
              <div className="pay-desc">
                {methods.bank ? "Equity Bank · ****4821" : "Local bank account (KES)"}
              </div>
            </div>
            {methods.bank ? (
              <span className="tag tag-success">
                <span className="sdot" style={{ background: "var(--status-success)" }} />
                Connected
              </span>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setMethods((p) => ({ ...p, bank: true }))}>
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card card-p-lg">
        <span className="card-title">Payout settings</span>
        <div className="settings-stack" style={{ marginTop: 14 }}>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Default payout method</label>
              <div className="select-wrapper">
                <select className="input input-md">
                  <option>M-Pesa</option>
                  <option>Bank transfer</option>
                  <option>Stripe</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Payout currency</label>
              <div className="select-wrapper">
                <select className="input input-md">
                  <option>KES – Kenyan Shilling</option>
                  <option>USD – US Dollar</option>
                  <option>EUR – Euro</option>
                </select>
              </div>
            </div>
          </div>
          <ToggleRow
            label="Auto-withdraw earnings"
            desc="Transfer balance to M-Pesa when it hits KES 5,000"
            on={true}
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [selectedAccent, setSelectedAccent] = useState("#534AB7");
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-stack">
      <div className="card card-p-lg">
        <span className="card-title">Interface theme</span>
        <div className="bento-3" style={{ marginTop: 14 }}>
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`option-card${theme === t ? " selected" : ""}`}
              style={{ padding: "14px 8px" }}
            >
              <i
                className={`ti ${t === "light" ? "ti-sun" : t === "dark" ? "ti-moon" : "ti-device-laptop"}`}
                style={{ fontSize: 18 }}
              />
              <span className="option-card-label">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bento-2">
        <div className="card card-p-lg">
          <span className="card-title">Accent colour</span>
          <p className="field-hint" style={{ marginBottom: 14 }}>Applied to buttons, highlights, and your rate card theme.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ACCENT_COLORS.map(({ hex, label }) => (
              <div key={hex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div
                  className={`accent-swatch${selectedAccent === hex ? " selected" : ""}`}
                  style={{ background: hex }}
                  onClick={() => setSelectedAccent(hex)}
                  title={label}
                />
                <span style={{ fontSize: 10, color: "var(--grey-400)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-p-lg">
          <span className="card-title">Rate card layout</span>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {["Classic", "Minimal"].map((layout) => (
              <div
                key={layout}
                className={`option-card${layout === "Classic" ? " selected" : ""}`}
                style={{ flex: 1, alignItems: "stretch" }}
              >
                <div
                  style={{
                    height: 52,
                    background: "var(--white)",
                    border: "0.5px solid var(--grey-100)",
                    borderRadius: 6,
                    padding: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                >
                  <div style={{ height: 5, background: "var(--purple-50)", borderRadius: 2, width: "60%" }} />
                  <div style={{ height: 3, background: "var(--grey-100)", borderRadius: 2 }} />
                  <div style={{ height: 3, background: "var(--grey-100)", borderRadius: 2, width: "75%" }} />
                  <div style={{ height: 3, background: "var(--grey-100)", borderRadius: 2, width: "50%" }} />
                </div>
                <span className="option-card-label" style={{ textAlign: "center", width: "100%" }}>{layout}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  );
}

function AccountTab() {
  const [saved, setSaved] = useState(false);
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-stack">
      <div className="card card-p-lg">
        <span className="card-title">Login details</span>
        <div className="settings-stack" style={{ gap: 12, marginTop: 14 }}>
          <div className="field">
            <label className="field-label field-required">Email address</label>
            <div className="input-wrapper">
              <i className="ti ti-mail input-icon left" />
              <input className="input input-md input-icon-left" type="email" defaultValue="amara@example.com" />
            </div>
          </div>
          <div className="field-divider" />
          <div className="field">
            <label className="field-label">Current password</label>
            <div className="input-wrapper">
              <i className="ti ti-lock input-icon left" />
              <input className="input input-md input-icon-left" type="password" placeholder="Enter current password" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">New password</label>
              <input className="input input-md" type="password" placeholder="Min. 8 characters" />
            </div>
            <div className="field">
              <label className="field-label">Confirm new password</label>
              <input className="input input-md" type="password" placeholder="Repeat password" />
            </div>
          </div>
        </div>
      </div>

      <div className="bento-2">
        <div className="card card-p-lg">
          <span className="card-title">Two-factor authentication</span>
          <div style={{ marginTop: 14 }}>
            <ToggleRow
              label="Enable 2FA"
              desc="Protect your account with an authenticator app"
              on={false}
              onChange={() => {}}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm">
              <i className="ti ti-shield-check" style={{ fontSize: 13 }} />
              Set up authenticator
            </button>
          </div>
        </div>

        <div className="card card-p-lg">
          <span className="card-title">Privacy</span>
          <div className="settings-stack" style={{ gap: 13, marginTop: 14 }}>
            <ToggleRow
              label="Show profile in Creatorske directory"
              desc="Let brands find you via the platform search"
              on={true}
              onChange={() => {}}
            />
            <div className="field-divider" />
            <ToggleRow
              label="Share anonymised analytics with Creatorske"
              desc="Helps us improve the platform, no personal data shared"
              on={false}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>

      <div className="danger-zone">
        <div className="danger-zone-title">Danger zone</div>
        <div className="danger-zone-desc">
          These actions are permanent and cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-danger btn-sm">
            <i className="ti ti-eye-off" style={{ fontSize: 12 }} />
            Unpublish all cards
          </button>
          <button className="btn btn-danger btn-sm">
            <i className="ti ti-trash" style={{ fontSize: 12 }} />
            Delete account
          </button>
        </div>
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  );
}

function SaveBar({ saved, onSave }) {
  return (
    <div className="settings-savebar">
      <span className="settings-savebar-hint">
        {saved ? (
          <span style={{ color: "var(--status-success-text)", display: "flex", alignItems: "center", gap: 5 }}>
            <i className="ti ti-check" style={{ fontSize: 13 }} />
            Changes saved
          </span>
        ) : (
          "Unsaved changes"
        )}
      </span>
      <div style={{ display: "flex", gap: 7 }}>
        <button className="btn btn-ghost">Discard</button>
        <button className="btn btn-primary" onClick={onSave}>
          <i className="ti ti-check" style={{ fontSize: 13 }} />
          Save changes
        </button>
      </div>
    </div>
  );
}

// Main component

export default function SettingsPage() {
  usePageMeta('Settings', 'Manage your Creatorske account, profile, and payment settings.');
  const [activeTab, setActiveTab] = useState("profile");

  const panels = {
    profile: <ProfileTab />,
    notifications: <NotificationsTab />,
    payments: <PaymentsTab />,
    appearance: <AppearanceTab />,
    account: <AccountTab />,
  };

  return (
    <>
      <style>{css}</style>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
      />
      <div className="settings-page">
        <div className="settings-header">
          <h3>Settings</h3>
          <p className="settings-sub">Manage your profile, payments, and account preferences.</p>
        </div>

        <div className="settings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`ti ${tab.icon}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {panels[activeTab]}
      </div>
    </>
  );
}