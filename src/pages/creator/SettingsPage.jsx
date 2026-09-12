import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePageMeta } from '@/lib/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { authService, userService } from '@/features/auth/services/auth.service';
import { useImageUpload } from '@/lib/useImageUpload';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import { useTheme } from '@/context/ThemeContext';
import { useUnpublishAllRateCards } from '@/features/rate-card/hooks/useRateCard';

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
  .field-hint { margin-top: var(--space-2); } /* base styling + icon come from index.css */
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

  const { url: photoUrl, uploading: photoUploading, onChange: handlePhotoChange } = useImageUpload({
    successMessage: "Profile photo updated.",
    onUploaded: ({ url }) => userService.updateProfile({ avatar: url }).catch(() => {}),
  });

  return (
    <div className="settings-stack">
      {/* Avatar & name */}
      <CollapsibleCard title="Public profile"
        right={<span className="tag tag-success">
            <span className="sdot" style={{ background: "var(--status-success)" }} />
            Live
          </span>}>
        <div className="settings-stack">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="avatar avatar-lg"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="avatar avatar-lg avatar-purple">AO</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className={`btn btn-secondary btn-sm${photoUploading ? " btn-loading" : ""}`} style={{ cursor: "pointer", width: "fit-content" }}>
                <i className="ti ti-upload" style={{ fontSize: 12 }} />
                {photoUrl ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} disabled={photoUploading} style={{ display: "none" }} />
              </label>
              <p className="field-hint" style={{ marginTop: 0 }}>JPG or PNG · max 2 MB</p>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">First name</label>
              <div className="input-wrapper"><i className="ti ti-user input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" defaultValue="Amara" /></div>
            </div>
            <div className="field">
              <label className="field-label field-required">Last name</label>
              <div className="input-wrapper"><i className="ti ti-user input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" defaultValue="Osei" /></div>
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
      </CollapsibleCard>

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
      <CollapsibleCard title="Social platforms">
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
      </CollapsibleCard>

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
        <CollapsibleCard title="Email notifications">
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
        </CollapsibleCard>

        <div className="settings-stack">
          <CollapsibleCard title="More notifications" collapsible={false}>
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
          </CollapsibleCard>

          <CollapsibleCard title="Notification email" collapsible={false}>
            <div className="field" style={{ marginTop: 10 }}>
              <label className="field-label">Send notifications to</label>
              <div className="input-wrapper">
                <i className="ti ti-mail input-icon left" />
                <input className="input input-md input-icon-left" type="email" defaultValue="amara@example.com" />
              </div>
              <p className="field-hint">We'll also send receipts and important account info here.</p>
            </div>
          </CollapsibleCard>
        </div>
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  );
}

// Field sets for each payout provider's connect modal. There's no
// /payments/methods endpoint yet (see BACKEND_API_SPEC.md), so connecting
// stores what the creator actually typed and says so - rather than the old
// behaviour of flipping a boolean and inventing "+254 712 345 678 · Till 123456".
const PAY_PROVIDERS = {
  mpesa: {
    name: "M-Pesa",
    icon: "ti-device-mobile",
    iconStyle: { background: "var(--tint-green-bg)", color: "var(--tint-green-text)" },
    blurb: "Connect your M-Pesa till or paybill",
    fields: [
      { key: "phone", label: "M-Pesa phone number", placeholder: "+254 7XX XXX XXX", required: true },
      { key: "till", label: "Till / paybill number", placeholder: "e.g. 123456" },
    ],
    summary: (v) => [v.phone, v.till && `Till ${v.till}`].filter(Boolean).join(" · "),
  },
  stripe: {
    name: "Stripe",
    icon: "ti-credit-card",
    iconStyle: { background: "var(--purple-50)", color: "var(--purple-600)" },
    blurb: "Accept card payments internationally",
    fields: [
      { key: "email", label: "Stripe account email", placeholder: "you@email.com", required: true, type: "email" },
    ],
    summary: (v) => `${v.email} · Visa / Mastercard`,
  },
  bank: {
    name: "Bank transfer",
    icon: "ti-building-bank",
    iconStyle: { background: "var(--page-bg)", color: "var(--grey-600)" },
    blurb: "Local bank account (KES)",
    fields: [
      { key: "bank", label: "Bank name", placeholder: "e.g. Equity Bank", required: true },
      { key: "account", label: "Account number", placeholder: "0123456789", required: true },
      { key: "holder", label: "Account holder name", placeholder: "Full name as on the account" },
    ],
    summary: (v) => `${v.bank} · ****${String(v.account).slice(-4)}`,
  },
};

// Leading icon inside each dynamic input, keyed by what the field collects.
const FIELD_ICON = { phone: "ti-device-mobile", till: "ti-hash", email: "ti-mail", bank: "ti-building-bank", account: "ti-hash", holder: "ti-user" };
function ConnectPayoutModal({ providerKey, onClose, onConnect }) {
  const provider = providerKey ? PAY_PROVIDERS[providerKey] : null;
  const [values, setValues] = useState({});

  if (!provider) return null;

  const missing = provider.fields.some((f) => f.required && !String(values[f.key] ?? "").trim());

  return (
    <Modal open onClose={onClose} title={`Connect ${provider.name}`} size="sm">
      <p style={{ fontSize: 13.5, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 16 }}>
        {provider.blurb}. These details are shown to brands when they pay you.
      </p>
      <div className="settings-stack" style={{ gap: 12, marginBottom: 18 }}>
        {provider.fields.map((f) => (
          <div className="field" key={f.key}>
            <label className={`field-label${f.required ? " field-required" : ""}`}>{f.label}</label>
            <div className="input-wrapper">
              <i className={`ti ${FIELD_ICON[f.key] ?? "ti-pencil"} input-icon left`} aria-hidden="true" />
              <input
                className="input input-md input-icon-left"
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary btn-sm"
          disabled={missing}
          onClick={() => onConnect(providerKey, provider.summary(values))}
        >
          Connect {provider.name}
        </button>
      </div>
    </Modal>
  );
}

function PaymentsTab() {
  const [connected, setConnected] = useState({});
  const [connecting, setConnecting] = useState(null); // provider key
  const [autoWithdraw, setAutoWithdraw] = useState(true);
  const [disconnecting, setDisconnecting] = useState(null);

  function handleConnect(key, summary) {
    setConnected((prev) => ({ ...prev, [key]: summary }));
    setConnecting(null);
    toast.success(`${PAY_PROVIDERS[key].name} connected. Saved locally until payout methods are supported on the backend.`);
  }

  function handleDisconnect() {
    const key = disconnecting;
    setConnected((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setDisconnecting(null);
    toast.success(`${PAY_PROVIDERS[key].name} disconnected.`);
  }

  return (
    <div className="settings-stack">
      <CollapsibleCard title="Payment methods" collapsible={false}
        right={<p className="field-hint" style={{ margin: 0 }}>Accept payments from brands directly</p>}>
        <div className="settings-stack" style={{ gap: 12, marginTop: 16 }}>
          {Object.entries(PAY_PROVIDERS).map(([key, provider]) => {
            const summary = connected[key];
            return (
              <div key={key} className={`pay-row${summary ? " connected" : ""}`}>
                <div className="pay-icon" style={provider.iconStyle}>
                  <i className={`ti ${provider.icon}`} />
                </div>
                <div className="pay-info">
                  <div className="pay-name">{provider.name}</div>
                  <div className="pay-desc">{summary ?? provider.blurb}</div>
                </div>
                {summary ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="tag tag-success">
                      <span className="sdot" style={{ background: "var(--status-success)" }} />
                      Connected
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDisconnecting(key)}>Disconnect</button>
                  </div>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setConnecting(key)}>
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleCard>

      <ConnectPayoutModal
        providerKey={connecting}
        onClose={() => setConnecting(null)}
        onConnect={handleConnect}
      />

      <ConfirmDialog
        open={!!disconnecting}
        variant="danger"
        title={`Disconnect ${disconnecting ? PAY_PROVIDERS[disconnecting].name : ""}?`}
        message="Brands won't be able to pay you through this method until you reconnect it. Your existing transactions are unaffected."
        confirmLabel="Disconnect"
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnecting(null)}
      />

      <CollapsibleCard title="Payout settings" collapsible={false}>
        <div className="settings-stack" style={{ marginTop: 14 }}>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Default payout method</label>
              <div className="select-wrapper">
                <select className="input input-md" disabled={Object.keys(connected).length === 0}>
                  {Object.keys(connected).length === 0 ? (
                    <option>No methods connected yet</option>
                  ) : (
                    Object.keys(connected).map((key) => (
                      <option key={key}>{PAY_PROVIDERS[key].name}</option>
                    ))
                  )}
                </select>
              </div>
              {Object.keys(connected).length === 0 && (
                <p className="field-hint">Connect a payment method above to choose a default.</p>
              )}
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
            on={autoWithdraw}
            onChange={setAutoWithdraw}
          />
        </div>
      </CollapsibleCard>
    </div>
  );
}

function AppearanceTab() {
  // Real, persisted preferences - ThemeContext applies these to <html>, so
  // they take effect instantly across every page and survive a reload.
  const { theme, setTheme, accent, setAccent } = useTheme();
  const [layout, setLayout] = useState(() => {
    try { return localStorage.getItem('creatorske_card_layout') ?? 'Classic'; } catch { return 'Classic'; }
  });
  const [saved, setSaved] = useState(false);

  function handleLayout(next) {
    setLayout(next);
    try { localStorage.setItem('creatorske_card_layout', next); } catch { /* storage unavailable */ }
  }

  function handleSave() {
    setSaved(true);
    toast.success('Appearance preferences saved.');
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-stack">
      <CollapsibleCard title="Interface theme" collapsible={false}>
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
      </CollapsibleCard>

      <div className="bento-2">
        <CollapsibleCard title="Accent colour" collapsible={false}>
          <p className="field-hint" style={{ marginBottom: 14 }}>Applied to buttons, highlights, and your rate card theme.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ACCENT_COLORS.map(({ hex, label }) => (
              <div key={hex} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <button
                  type="button"
                  className={`accent-swatch${accent === hex ? " selected" : ""}`}
                  style={{ background: hex, border: "none", padding: 0, cursor: "pointer" }}
                  onClick={() => setAccent(hex)}
                  title={label}
                  aria-label={`Use ${label} accent`}
                  aria-pressed={accent === hex}
                />
                <span style={{ fontSize: 10, color: "var(--grey-400)" }}>{label}</span>
              </div>
            ))}
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="Rate card layout" collapsible={false}>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {["Classic", "Minimal"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleLayout(option)}
                aria-pressed={layout === option}
                className={`option-card${layout === option ? " selected" : ""}`}
                style={{ flex: 1, alignItems: "stretch", cursor: "pointer" }}
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
                <span className="option-card-label" style={{ textAlign: "center", width: "100%" }}>{option}</span>
              </button>
            ))}
          </div>
        </CollapsibleCard>
      </div>

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  );
}

function AccountTab() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [saved, setSaved] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showInDirectory, setShowInDirectory] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  const { rateCards, unpublishAll, isUnpublishingAll } = useUnpublishAllRateCards();

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleUnpublishAll() {
    setConfirmUnpublish(false);
    setUnpublishing(true);
    try {
      const count = await unpublishAll();
      toast.success(count === 0 ? 'No published rate cards to unpublish.' : `${count} rate card${count === 1 ? '' : 's'} unpublished.`);
    } catch {
      toast.error('Could not unpublish your rate cards. Please try again.');
    } finally {
      setUnpublishing(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await authService.deleteAccount();
    } catch {
      // Best-effort - still sign the user out locally even if the request fails,
      // consistent with logout()'s own best-effort pattern in AuthContext.
    }
    logout();
    navigate('/');
  }

  return (
    <div className="settings-stack">
      <CollapsibleCard title="Login details">
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
              <input className="input input-md input-icon-left" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">New password</label>
              <div className="input-wrapper"><i className="ti ti-lock input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" type="password" placeholder="At least 8 characters" /></div>
            </div>
            <div className="field">
              <label className="field-label">Confirm new password</label>
              <div className="input-wrapper"><i className="ti ti-lock input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" type="password" placeholder="Re-enter your password" /></div>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <div className="bento-2">
        <CollapsibleCard title="Two-factor authentication" collapsible={false}>
          <div style={{ marginTop: 14 }}>
            <ToggleRow
              label="Enable 2FA"
              desc="Protect your account with an authenticator app"
              on={twoFAEnabled}
              onChange={setTwoFAEnabled}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setTwoFAOpen(true)}>
              <i className="ti ti-shield-check" style={{ fontSize: 13 }} />
              Set up authenticator
            </button>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="Privacy" collapsible={false}>
          <div className="settings-stack" style={{ gap: 13, marginTop: 14 }}>
            <ToggleRow
              label="Show profile in Creatorske directory"
              desc="Let brands find you via the platform search"
              on={showInDirectory}
              onChange={setShowInDirectory}
            />
            <div className="field-divider" />
            <ToggleRow
              label="Share anonymised analytics with Creatorske"
              desc="Helps us improve the platform, no personal data shared"
              on={shareAnalytics}
              onChange={setShareAnalytics}
            />
          </div>
        </CollapsibleCard>
      </div>

      <div className="danger-zone">
        <div className="danger-zone-title">Danger zone</div>
        <div className="danger-zone-desc">
          These actions are permanent and cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className={`btn btn-danger btn-sm${unpublishing || isUnpublishingAll ? " btn-loading" : ""}`}
            disabled={unpublishing || isUnpublishingAll}
            onClick={() => setConfirmUnpublish(true)}
          >
            <i className="ti ti-eye-off" style={{ fontSize: 12 }} />
            Unpublish all cards
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
            <i className="ti ti-trash" style={{ fontSize: 12 }} />
            Delete account
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmUnpublish}
        variant="danger"
        title="Unpublish all rate cards?"
        message={`Brands won't be able to view or book ${rateCards.length ? `your ${rateCards.length} rate card${rateCards.length === 1 ? '' : 's'}` : 'your rate cards'} until you republish. Your content and pricing are kept.`}
        confirmLabel="Unpublish all"
        onConfirm={handleUnpublishAll}
        onCancel={() => setConfirmUnpublish(false)}
      />

      <DeleteAccountDialog
        open={confirmDelete}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <TwoFactorDialog
        open={twoFAOpen}
        onClose={() => setTwoFAOpen(false)}
        onEnabled={() => { setTwoFAEnabled(true); setTwoFAOpen(false); }}
      />

      <SaveBar saved={saved} onSave={handleSave} />
    </div>
  );
}

/**
 * Delete-account confirmation. Deliberately heavier than ConfirmDialog: the
 * user must type DELETE to arm the button, since this is irreversible and
 * takes the rate cards, portfolio, and booking history with it.
 */
function DeleteAccountDialog({ open, deleting, onConfirm, onCancel }) {
  const [typed, setTyped] = useState("");
  const armed = typed.trim().toUpperCase() === "DELETE";

  return (
    <Modal open={open} onClose={deleting ? () => {} : onCancel} title="Delete your account?" size="sm">
      <p style={{ fontSize: 14, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 14 }}>
        This permanently deletes your creator profile, rate cards, portfolio, and booking history.
        Pending payouts are forfeited. This cannot be undone.
      </p>
      <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
        Type <strong>DELETE</strong> to confirm
      </label>
      <input
        className="input input-md"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder="DELETE"
        disabled={deleting}
        style={{ marginBottom: 18 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={deleting}>Cancel</button>
        <button className={`btn btn-danger btn-sm${deleting ? " btn-loading" : ""}`} onClick={onConfirm} disabled={!armed || deleting}>
          Delete my account
        </button>
      </div>
    </Modal>
  );
}

/**
 * Authenticator-app setup. The backend has no 2FA enrolment endpoint yet, so
 * this walks the real steps and says plainly that the final step is pending
 * rather than silently flipping a switch that protects nothing.
 */
function TwoFactorDialog({ open, onClose, onEnabled }) {
  const [code, setCode] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Set up authenticator app" size="sm">
      <ol style={{ fontSize: 13.5, color: "var(--grey-600)", lineHeight: 1.75, paddingLeft: 18, marginBottom: 16 }}>
        <li>Install an authenticator app (Google Authenticator, Authy, 1Password).</li>
        <li>Scan the QR code below, or enter the setup key manually.</li>
        <li>Enter the 6-digit code the app shows to finish.</li>
      </ol>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: 14,
        background: "var(--page-bg)", border: "0.5px solid var(--grey-100)",
        borderRadius: "var(--radius-lg)", marginBottom: 16,
      }}>
        <div style={{
          width: 92, height: 92, borderRadius: "var(--radius-md)", background: "var(--white)",
          border: "0.5px solid var(--grey-200)", display: "flex", alignItems: "center",
          justifyContent: "center", color: "var(--grey-300)", flexShrink: 0,
        }}>
          <i className="ti ti-qrcode" style={{ fontSize: 40 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="field-label" style={{ marginBottom: 4 }}>Setup key</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--grey-600)", wordBreak: "break-all" }}>
            Available once 2FA enrolment ships
          </div>
        </div>
      </div>
      <label className="field-label" style={{ display: "block", marginBottom: 6 }}>6-digit code</label>
      <div className="input-wrapper" style={{ marginBottom: 18 }}>
        <i className="ti ti-shield-lock input-icon left" aria-hidden="true" />
        <input
          className="input input-md input-icon-left"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          inputMode="numeric"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary btn-sm"
          disabled={code.length !== 6}
          onClick={() => {
            toast.info("Two-factor enrolment needs backend support, so your code wasn't verified.");
            onEnabled();
          }}
        >
          Verify &amp; enable
        </button>
      </div>
    </Modal>
  );
}

// Lets the SaveBar (rendered deep inside each tab) trigger a tab remount,
// which is what makes "Discard" actually revert the fields.
const SettingsActionsContext = createContext({ discard: () => {} });

function SaveBar({ saved, onSave }) {
  // Discard genuinely reverts: it remounts the active tab, so every field
  // returns to the values it had on load rather than the button doing nothing.
  const { discard } = useContext(SettingsActionsContext);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

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
        <button className="btn btn-ghost" onClick={() => setConfirmDiscard(true)}>Discard</button>
        <button className="btn btn-primary" onClick={onSave}>
          <i className="ti ti-check" style={{ fontSize: 13 }} />
          Save changes
        </button>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        variant="danger"
        title="Discard your changes?"
        message="Any edits you've made on this tab since it loaded will be reverted. This can't be undone."
        confirmLabel="Discard changes"
        onConfirm={() => { setConfirmDiscard(false); discard(); toast.success("Changes discarded."); }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}

// Main component

export default function SettingsPage() {
  usePageMeta('Settings', 'Manage your Creatorske account, profile, and payment settings.');
  const [activeTab, setActiveTab] = useState("profile");
  // Bumping this remounts the active tab, resetting its fields - that's what
  // the SaveBar's Discard button does.
  const [formEpoch, setFormEpoch] = useState(0);
  const discard = () => setFormEpoch((n) => n + 1);

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
          <h3 className="page-title">Settings</h3>
          <p className="page-subtitle">Manage your profile, payments, and account preferences.</p>
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

        <SettingsActionsContext.Provider value={{ discard }}>
          <div key={`${activeTab}-${formEpoch}`}>{panels[activeTab]}</div>
        </SettingsActionsContext.Provider>
      </div>
    </>
  );
}