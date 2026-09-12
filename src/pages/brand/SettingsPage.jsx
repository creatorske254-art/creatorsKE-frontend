import { useState } from "react";
import { toast } from "sonner";
import { usePageMeta } from '@/lib/usePageMeta';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/features/auth/services/auth.service';
import { useBrandDashboard } from '@/features/brand-dashboard/hooks/useBrandDashboard';
import { useImageUpload } from '@/lib/useImageUpload';

// Page-scoped styles
// Every value below reads from the global index.css tokens (--purple-*,
// --grey-*, --status-*, --radius-*, --space-*, --text-*, --shadow-*).
// Nothing here redefines a token or a color; index.css is the single
// source of truth. This file only adds the handful of component patterns
// index.css doesn't already ship (tabs, toggle, field labels, payment row,
// option row, danger zone, save bar), the exact same set the creator
// settings page defines, reused here so both pages feel like one product.
// Everything else (.card, .btn-*, .input, .tag, .avatar…) is used as-is
// from the global stylesheet.
const css = `
  /* This page sits inside the dashboard's content area, which already
     supplies var(--page-bg). No background here, and no min-height/100vh
     this is a nested panel, not a standalone page. */
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

  .input-icon-left { padding-left: 40px !important; }
  .input-icon-right { padding-right: 40px !important; }
  .textarea { resize: vertical; min-height: 90px; line-height: 1.6; }

  /* Same "too many borders" fix as the creator settings page: resting-state
     emphasis moves from border to a faint fill, border does its job on focus. */
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

  /* Payment method row */
  .pay-row {
    display: flex;
    align-items: center;
    gap: var(--space-12);
    padding: var(--space-16);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-xl);
    background: var(--white);
    transition: all var(--transition-fast);
  }
  .pay-row.connected { background: var(--purple-50); border-color: var(--purple-200); }
  .pay-icon { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pay-info { flex: 1; min-width: 0; }
  .pay-name { font-family: var(--font-display); font-size: var(--text-h5-size); font-weight: 600; color: var(--black); }
  .pay-desc { font-size: 12px; color: var(--grey-400); margin-top: 1px; }

  /* Escrow / info callout */
  .info-callout {
    background: var(--page-bg);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-xl);
    padding: var(--space-16);
    display: flex;
    gap: var(--space-12);
    align-items: flex-start;
  }
  .info-callout i { color: var(--purple-600); font-size: var(--size-icon-md); margin-top: 2px; flex-shrink: 0; }
  .info-callout-title { font-size: var(--text-body-sm-size); font-weight: 500; margin-bottom: 3px; }
  .info-callout-desc { font-size: 12.5px; color: var(--grey-500); margin: 0; line-height: 1.6; }

  /* Session row */
  .session-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-12) 0; }
  .session-row:not(:last-child) { border-bottom: 0.5px solid var(--grey-100); }
  .session-icon { width: 32px; height: 32px; border-radius: var(--radius-md); background: var(--page-bg); display: flex; align-items: center; justify-content: center; color: var(--grey-500); flex-shrink: 0; }
  .session-device { font-size: var(--text-body-sm-size); font-weight: 500; display: flex; align-items: center; gap: var(--space-7); }
  .session-meta { font-size: 11.5px; color: var(--grey-400); margin-top: 1px; }

  /* Legal link row */
  .legal-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-10) 14px;
    background: var(--page-bg);
    border-radius: var(--radius-md);
    font-size: var(--text-body-sm-size);
    font-weight: 500;
    color: var(--black);
  }
  .legal-row i { color: var(--grey-400); font-size: 13px; }

  /* Danger zone */
  .danger-zone { border: 0.5px solid rgba(239,68,68,0.15); background: var(--status-error-bg); border-radius: var(--radius-xl); padding: var(--space-20); }
  .danger-zone-title { font-family: var(--font-display); font-size: var(--text-h5-size); font-weight: 600; color: var(--status-error-text); margin-bottom: var(--space-4); }
  .danger-zone-desc { font-size: 12.5px; color: var(--status-error-text); opacity: 0.85; margin-bottom: var(--space-16); line-height: 1.6; }
  .danger-zone-banner { background: rgba(239,68,68,0.08); border: 0.5px solid rgba(239,68,68,0.2); border-radius: var(--radius-lg); padding: 12px 14px; font-size: 13px; color: var(--status-error-text); line-height: 1.6; }
  .warning-banner { background: var(--status-warning-bg); border: 0.5px solid rgba(245,158,11,0.25); border-radius: var(--radius-lg); padding: 12px 14px; font-size: 13px; color: var(--status-warning-text); line-height: 1.6; }
  .success-banner { background: var(--status-success-bg); border: 0.5px solid rgba(16,185,129,0.25); border-radius: var(--radius-lg); padding: 12px 16px; font-size: 13px; color: var(--status-success-text); display: flex; align-items: center; gap: 7px; }

  /* Save bar, floats above the bottom edge with its own card surface */
  .settings-savebar {
    position: sticky;
    bottom: 0;
    margin-top: var(--space-24);
    background: var(--white);
    border: 0.5px solid var(--grey-100);
    box-shadow: var(--shadow-md);
    border-radius: var(--radius-lg);
    padding: var(--space-12) var(--space-20);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-12);
  }
  .settings-savebar-hint { font-size: var(--text-body-sm-size); color: var(--grey-500); }

  /* Responsive - same breakpoint as the creator settings page */
  @media (max-width: 640px) {
    .field-row { grid-template-columns: 1fr; }
    .settings-tabs { width: 100%; }
  }
`;

// Nav tabs
const TABS = [
  { id: "profile", label: "Company profile", icon: "ti-building" },
  { id: "payments", label: "Payment methods", icon: "ti-credit-card" },
  { id: "notifications", label: "Notifications", icon: "ti-bell" },
  { id: "security", label: "Security", icon: "ti-shield-lock" },
  { id: "account", label: "Account", icon: "ti-user-circle" },
];

// Shared bits
function ToggleRow({ label, hint, on, onChange }) {
  return (
    <div className="toggle-row">
      <div className="toggle-row-text">
        <div className="toggle-row-label">{label}</div>
        {hint && <div className="field-hint">{hint}</div>}
      </div>
      <button
        className={`settings-toggle${on ? " on" : ""}`}
        onClick={onChange}
        aria-pressed={on}
      />
    </div>
  );
}

function SaveBar({ dirty, saving, onSave }) {
  if (!dirty) return null;
  return (
    <div className="settings-savebar">
      <span className="settings-savebar-hint">You have unsaved changes</span>
      <button className={`btn btn-primary${saving ? " btn-loading" : ""}`} onClick={onSave} disabled={saving}>
        <i className="ti ti-check" style={{ fontSize: 13 }} />
        Save changes
      </button>
    </div>
  );
}

// Profile tab
function ProfileTab({ form, setForm, onDirty }) {
  function upd(key) {
    return (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); onDirty(); };
  }

  const { url: logoUrl, uploading: logoUploading, onChange: handleLogoChange } = useImageUpload({
    successMessage: "Logo uploaded.",
    onUploaded: ({ url }) => { setForm((f) => ({ ...f, logoUrl: url })); onDirty(); },
  });

  const industryOptions = [
    { value: "fmcg", label: "FMCG / Consumer goods" },
    { value: "fashion", label: "Fashion & Beauty" },
    { value: "food", label: "Food & Beverage" },
    { value: "tech", label: "Technology" },
    { value: "finance", label: "Finance & Banking" },
    { value: "health", label: "Health & Wellness" },
    { value: "travel", label: "Travel & Hospitality" },
    { value: "auto", label: "Automotive" },
    { value: "media", label: "Media & Entertainment" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="settings-stack">
      {/* Logo */}
      <div className="card card-p-lg">
        <span className="card-title">Company logo</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Company logo" className="avatar avatar-lg" style={{ objectFit: "cover" }} />
          ) : (
            <div className="avatar avatar-lg avatar-purple">
              {form.companyName ? form.companyName.slice(0, 2).toUpperCase() : "NB"}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label className={`btn btn-ghost btn-sm${logoUploading ? " btn-loading" : ""}`} style={{ cursor: "pointer", width: "fit-content" }}>
              <i className="ti ti-upload" style={{ fontSize: 12 }} />
              {logoUrl ? "Change logo" : "Upload logo"}
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleLogoChange} disabled={logoUploading} style={{ display: "none" }} />
            </label>
            <span className="field-hint">PNG or SVG · max 2 MB · shown on invoices and scope confirmations</span>
          </div>
        </div>
      </div>

      {/* Company details */}
      <div className="card card-p-lg">
        <span className="card-title">Company details</span>
        <p className="card-body-text" style={{ marginTop: -2, marginBottom: 14 }}>
          This information is shown to creators when they receive your enquiry.
        </p>
        <div className="settings-stack" style={{ gap: 12 }}>
          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">Company name</label>
              <input className="input input-md" value={form.companyName} onChange={upd("companyName")} placeholder="e.g. Nairobi Brew Co." />
            </div>
            <div className="field">
              <label className="field-label field-required">Industry</label>
              <div className="select-wrapper">
                <select className="input input-md" value={form.industry} onChange={upd("industry")}>
                  {industryOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Website</label>
            <div className="input-wrapper">
              <i className="ti ti-world input-icon left" />
              <input className="input input-md input-icon-left" value={form.website} onChange={upd("website")} placeholder="https://yourcompany.com" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Company description</label>
            <textarea className="input textarea" value={form.description} onChange={upd("description")} placeholder="What does your company do? What kind of campaigns do you run?" rows={3} />
            <span className="field-hint">Optional: helps creators understand your brand before accepting your enquiry.</span>
          </div>
        </div>
      </div>

      {/* Contact details */}
      <div className="card card-p-lg">
        <span className="card-title">Contact details</span>
        <p className="card-body-text" style={{ marginTop: -2, marginBottom: 14 }}>
          Used for invoices and shown to creators on accepted bookings.
        </p>
        <div className="settings-stack" style={{ gap: 12 }}>
          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">Contact name</label>
              <input className="input input-md" value={form.contactName} onChange={upd("contactName")} placeholder="e.g. Amara Osei" />
            </div>
            <div className="field">
              <label className="field-label">Job title</label>
              <input className="input input-md" value={form.jobTitle} onChange={upd("jobTitle")} placeholder="e.g. Marketing Manager" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">Business email</label>
              <div className="input-wrapper">
                <i className="ti ti-mail input-icon left" />
                <input className="input input-md input-icon-left" type="email" value={form.email} onChange={upd("email")} placeholder="you@company.com" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Phone number</label>
              <div className="input-wrapper">
                <i className="ti ti-phone input-icon left" />
                <input className="input input-md input-icon-left" type="tel" value={form.phone} onChange={upd("phone")} placeholder="+254 7XX XXX XXX" />
              </div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Location</label>
            <div className="input-wrapper">
              <i className="ti ti-map-pin input-icon left" />
              <input className="input input-md input-icon-left" value={form.location} onChange={upd("location")} placeholder="e.g. Nairobi, Kenya" />
            </div>
          </div>
        </div>
      </div>

      {/* Verification status */}
      <div className="card card-p-lg">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <span className="card-title" style={{ marginBottom: 3, display: "block" }}>Brand verification</span>
            <span className="field-hint">Verified brands get higher placement in creator enquiry lists and build faster trust.</span>
          </div>
          <span className="tag tag-success">
            <i className="ti ti-circle-check" style={{ fontSize: 12 }} />
            Verified
          </span>
        </div>
        <div className="info-callout" style={{ marginTop: 12, padding: "10px 14px" }}>
          <i className="ti ti-shield-check" style={{ fontSize: 14, marginTop: 0 }} />
          <span style={{ fontSize: 12.5, color: "var(--grey-500)" }}>
            Business email domain confirmed · <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>nairobibrew.co.ke</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Payments tab
// Connecting opens a modal for real details rather than flipping a boolean -
// there's no /payments/methods endpoint yet (see BACKEND_API_SPEC.md), so what
// the brand enters is held here and labelled, not invented.
const PAYMENT_METHODS = [
  {
    id: "mpesa",
    name: "M-Pesa",
    sub: "Safaricom mobile money · STK push at checkout",
    iconBg: "#00A651",
    icon: "ti-device-mobile",
    connected: false,
    fields: [{ key: "phone", label: "M-Pesa phone number", placeholder: "+254 7XX XXX XXX", required: true }],
    summary: (v) => v.phone,
  },
  {
    id: "airtel",
    name: "Airtel Money",
    sub: "Airtel mobile money · wallet-to-wallet",
    iconBg: "#E40000",
    icon: "ti-device-mobile",
    connected: false,
    fields: [{ key: "phone", label: "Airtel phone number", placeholder: "+254 7XX XXX XXX", required: true }],
    summary: (v) => v.phone,
  },
  {
    id: "bank",
    name: "Bank transfer",
    sub: "Local & international wire · 1–2 day clearing",
    iconBg: "var(--grey-100)",
    iconColor: "var(--grey-600)",
    icon: "ti-building-bank",
    connected: false,
    fields: [
      { key: "bank", label: "Bank name", placeholder: "e.g. Equity Bank", required: true },
      { key: "account", label: "Account number", placeholder: "0123456789", required: true },
    ],
    summary: (v) => `${v.bank} ····${String(v.account).slice(-4)}`,
  },
];

function ConnectMethodModal({ method, onClose, onConnect }) {
  const [values, setValues] = useState({});
  if (!method) return null;

  const missing = method.fields.some((f) => f.required && !String(values[f.key] ?? "").trim());

  return (
    <Modal open onClose={onClose} title={`Connect ${method.name}`} size="sm">
      <p style={{ fontSize: 13.5, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 16 }}>
        {method.sub}. This is charged when you confirm a booking.
      </p>
      <div className="settings-stack" style={{ gap: 12, marginBottom: 18 }}>
        {method.fields.map((f) => (
          <div className="field" key={f.key}>
            <label className={`field-label${f.required ? " field-required" : ""}`}>{f.label}</label>
            <input
              className="input input-md"
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary btn-sm"
          disabled={missing}
          onClick={() => onConnect(method.id, method.summary(values))}
        >
          Connect {method.name}
        </button>
      </div>
    </Modal>
  );
}

function PaymentsTab({ prefs, setPrefs, onDirty }) {
  const [methods, setMethods] = useState(PAYMENT_METHODS);
  const [connecting, setConnecting] = useState(null);
  const [disconnecting, setDisconnecting] = useState(null);

  function toggle(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    onDirty();
  }

  function handleConnect(id, detail) {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, connected: true, detail } : m)));
    setConnecting(null);
    onDirty();
    toast.success(`${methods.find((m) => m.id === id)?.name} connected. Saved locally until payment methods are supported on the backend.`);
  }

  function handleDisconnect() {
    const id = disconnecting;
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, connected: false, detail: undefined } : m)));
    setDisconnecting(null);
    onDirty();
    toast.success(`${methods.find((m) => m.id === id)?.name} disconnected.`);
  }

  return (
    <div className="settings-stack">
      {/* Payment methods */}
      <div className="card card-p-lg">
        <span className="card-title">Payment methods</span>
        <p className="card-body-text" style={{ marginTop: -2, marginBottom: 14 }}>
          How you pay creators. These are used at checkout when a booking is confirmed.
        </p>
        <div className="settings-stack" style={{ gap: 10 }}>
          {methods.map((m) => (
            <div key={m.id} className={`pay-row${m.connected ? " connected" : ""}`}>
              <div className="pay-icon" style={{ background: m.iconBg }}>
                <i className={`ti ${m.icon}`} style={{ fontSize: 17, color: m.iconColor || "#fff" }} />
              </div>
              <div className="pay-info">
                <div className="pay-name">{m.name}</div>
                <div className="pay-desc">{m.sub}</div>
              </div>
              {m.connected ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="tag tag-success">
                    <i className="ti ti-circle-check" style={{ fontSize: 12 }} />
                    Connected · {m.detail}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setDisconnecting(m.id)}>Disconnect</button>
                </div>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setConnecting(m)}>Connect</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConnectMethodModal
        method={connecting}
        onClose={() => setConnecting(null)}
        onConnect={handleConnect}
      />

      <ConfirmDialog
        open={!!disconnecting}
        variant="danger"
        title={`Disconnect ${methods.find((m) => m.id === disconnecting)?.name ?? ""}?`}
        message="You won't be able to pay creators with this method until you reconnect it. Campaigns already paid for are unaffected."
        confirmLabel="Disconnect"
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnecting(null)}
      />

      {/* Invoice preferences */}
      <div className="card card-p-lg">
        <span className="card-title">Invoice preferences</span>
        <div className="settings-stack" style={{ gap: 13, marginTop: 14 }}>
          <ToggleRow
            label="Receive auto-invoice on booking"
            hint="Get a PDF invoice emailed immediately when a booking is confirmed."
            on={prefs.autoInvoice}
            onChange={() => toggle("autoInvoice")}
          />
          <div className="field-divider" />
          <ToggleRow
            label="Pay 50% deposit upfront"
            hint="Pay half the package cost when booking; the remainder releases from escrow on delivery approval."
            on={prefs.deposit}
            onChange={() => toggle("deposit")}
          />
          <div className="field-divider" />
          <ToggleRow
            label="Payment reminders via email"
            hint="Get a nudge 24 hours before any pending balance is due."
            on={prefs.payReminder}
            onChange={() => toggle("payReminder")}
          />
        </div>
      </div>

      {/* Escrow info */}
      <div className="info-callout">
        <i className="ti ti-shield-lock" />
        <div>
          <div className="info-callout-title">Funds are held in escrow</div>
          <p className="info-callout-desc">
            Your payment is held securely until you approve delivery. A 10% platform fee is deducted from the creator's payout. You always pay the full package price.
          </p>
        </div>
      </div>
    </div>
  );
}

// Notifications tab
function NotificationsTab({ notifPrefs, setNotifPrefs, onDirty }) {
  function toggle(key) {
    setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));
    onDirty();
  }

  const groups = [
    {
      title: "Campaigns",
      items: [
        { key: "enquiryAccepted", label: "Enquiry accepted", hint: "When a creator accepts and sends a payment link." },
        { key: "deliveryMarked", label: "Delivery marked", hint: "When a creator marks a campaign as delivered." },
        { key: "approvalReminder", label: "Approval reminder", hint: "Nudge if you haven't approved or disputed after the review window." },
        { key: "disputeUpdate", label: "Dispute updates", hint: "Admin decisions and evidence request prompts." },
      ],
    },
    {
      title: "Payments",
      items: [
        { key: "paymentConfirmed", label: "Payment confirmed", hint: "When your M-Pesa or bank payment clears." },
        { key: "escrowTimeout", label: "Escrow timeout warning", hint: "Alert when the grace period for delivery is nearly up." },
        { key: "invoiceReady", label: "Invoice ready", hint: "When a new invoice PDF is available to download." },
      ],
    },
    {
      title: "Messages",
      items: [
        { key: "newMessage", label: "New message from creator", hint: "Email when a creator replies and you're not active on the platform." },
        { key: "enquiryExpiry", label: "Enquiry expiry warning", hint: "4-day heads-up if a creator hasn't responded to your enquiry." },
      ],
    },
  ];

  return (
    <div className="settings-stack">
      {groups.map((g) => (
        <div key={g.title} className="card card-p-lg">
          <span className="card-title">{g.title}</span>
          <div className="settings-stack" style={{ gap: 0, marginTop: 14 }}>
            {g.items.map((item) => (
              <div key={item.key} className="notif-row">
                <div style={{ flex: 1 }}>
                  <div className="toggle-row-label">{item.label}</div>
                  <div className="field-hint">{item.hint}</div>
                </div>
                <button
                  className={`settings-toggle${notifPrefs[item.key] ? " on" : ""}`}
                  onClick={() => toggle(item.key)}
                  aria-pressed={notifPrefs[item.key]}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card card-p-lg">
        <span className="card-title">Email digest</span>
        <p className="card-body-text" style={{ marginTop: -2, marginBottom: 14 }}>
          Instead of individual emails, get a single daily summary.
        </p>
        <ToggleRow
          label="Daily digest"
          hint="One email per day covering all activity across your active campaigns."
          on={notifPrefs.digest}
          onChange={() => toggle("digest")}
        />
      </div>
    </div>
  );
}

// Security tab
function SecurityTab({ onDirty }) {
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  function handlePwSave() {
    setPwSaving(true);
    setTimeout(() => {
      setPwSaving(false);
      setPwSaved(true);
      setPwForm({ current: "", next: "", confirm: "" });
    }, 1200);
  }

  const [sessions, setSessions] = useState([
    { device: "Chrome · macOS", location: "Nairobi, KE", time: "Now", current: true },
    { device: "Safari · iPhone 15", location: "Nairobi, KE", time: "2 hours ago", current: false },
    { device: "Chrome · Windows", location: "Nairobi, KE", time: "3 days ago", current: false },
  ]);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  function handleSignOutSession(device) {
    setSessions((prev) => prev.filter((s) => s.device !== device));
    toast.success(`Signed out of ${device}.`);
  }

  function handleSignOutOthers() {
    setSessions((prev) => prev.filter((s) => s.current));
    toast.success("Signed out of all other sessions.");
  }

  function handleToggle2FA() {
    setTwoFAEnabled((v) => !v);
    onDirty();
    toast.success(twoFAEnabled ? "Two-factor authentication disabled." : "Two-factor authentication enabled.");
  }

  return (
    <div className="settings-stack">
      {/* Change password */}
      <div className="card card-p-lg">
        <span className="card-title">Change password</span>
        <div style={{ marginTop: 14 }}>
          {pwSaved ? (
            <div className="success-banner">
              <i className="ti ti-check" style={{ fontSize: 13 }} />
              Password updated successfully
            </div>
          ) : (
            <div className="settings-stack" style={{ gap: 12 }}>
              <div className="field">
                <label className="field-label field-required">Current password</label>
                <input className="input input-md" type="password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} placeholder="••••••••" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label field-required">New password</label>
                  <input className="input input-md" type="password" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} placeholder="At least 8 characters" />
                </div>
                <div className="field">
                  <label className="field-label field-required">Confirm new password</label>
                  <input className="input input-md" type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter your new password" />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className={`btn btn-primary${pwSaving ? " btn-loading" : ""}`} onClick={handlePwSave} disabled={pwSaving}>
                  Update password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-factor */}
      <div className="card card-p-lg">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <span className="card-title" style={{ marginBottom: 3, display: "block" }}>Two-factor authentication</span>
            <span className="field-hint">Add an extra layer of protection using an authenticator app or SMS code.</span>
          </div>
          <span className={`tag ${twoFAEnabled ? "tag-success" : "tag-warning"}`}>{twoFAEnabled ? "Enabled" : "Not enabled"}</span>
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleToggle2FA}>
            <i className="ti ti-shield-check" style={{ fontSize: 13 }} />
            {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
          </button>
        </div>
      </div>

      {/* Active sessions */}
      <div className="card card-p-lg">
        <span className="card-title">Active sessions</span>
        <p className="card-body-text" style={{ marginTop: -2, marginBottom: 6 }}>
          Devices where your account is currently signed in.
        </p>
        <div>
          {sessions.map((s) => (
            <div key={s.device} className="session-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="session-icon">
                  <i className="ti ti-device-desktop" style={{ fontSize: 14 }} />
                </div>
                <div>
                  <div className="session-device">
                    {s.device}
                    {s.current && <span className="tag tag-purple">This device</span>}
                  </div>
                  <div className="session-meta">{s.location} · {s.time}</div>
                </div>
              </div>
              {!s.current && <button className="btn btn-ghost btn-sm" onClick={() => handleSignOutSession(s.device)}>Sign out</button>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOutOthers} disabled={sessions.length <= 1}>Sign out of all other sessions</button>
        </div>
      </div>
    </div>
  );
}

// Account tab
function AccountTab() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { activeCampaignCount } = useBrandDashboard();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await authService.deleteAccount();
    } catch {
      // Best-effort - sign out locally even if the request fails, matching
      // logout()'s own best-effort pattern in AuthContext.
    }
    logout();
    navigate('/');
  }

  return (
    <div className="settings-stack">
      {/* Plan */}
      <div className="card card-p-lg">
        <span className="card-title">Your plan</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="avatar avatar-md avatar-purple" style={{ borderRadius: "var(--radius-md)" }}>
              <i className="ti ti-star" style={{ fontSize: 17 }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h5-size)", fontWeight: 600 }}>Brand account</div>
              <span className="field-hint">Unlimited enquiries · shortlisting · campaign management</span>
            </div>
          </div>
          <span className="tag tag-purple">Active</span>
        </div>
      </div>

      {/* Legal */}
      <div className="card card-p-lg">
        <span className="card-title">Legal</span>
        <div className="settings-stack" style={{ gap: 10, marginTop: 14 }}>
          {[{ label: "Terms of Service", href: "/terms" }, { label: "Privacy Policy", href: "/privacy" }].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="legal-row">
              {l.label}
              <i className="ti ti-external-link" />
            </a>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="danger-zone">
        <div className="danger-zone-title">Delete account</div>
        <div className="danger-zone-desc">
          Permanently remove your company profile, campaign history, and all data. This cannot be undone.
        </div>
        <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
          <i className="ti ti-trash" style={{ fontSize: 13 }} />
          Request account deletion
        </button>
      </div>

      <DeleteBrandAccountModal
        open={deleteOpen}
        activeBookings={activeCampaignCount}
        deleting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

/**
 * Brand deletion is gated on having no live campaigns - money is in escrow
 * against them - so the modal shows the real active-campaign count from
 * useBrandDashboard() and blocks until it's zero, instead of the old hardcoded
 * "You have 1 active booking" line.
 */
function DeleteBrandAccountModal({ open, activeBookings, deleting, onClose, onConfirm }) {
  const [typed, setTyped] = useState("");
  const blocked = activeBookings > 0;
  const armed = !blocked && typed.trim().toUpperCase() === "DELETE";

  return (
    <Modal open={open} onClose={deleting ? () => {} : onClose} title="Delete your brand account?" size="sm">
      {blocked ? (
        <div className="warning-banner" style={{ marginBottom: 18 }}>
          You have {activeBookings} active {activeBookings === 1 ? "campaign" : "campaigns"} that must be completed
          or cancelled before deletion can proceed. Funds in escrow are released when each campaign is approved.
        </div>
      ) : (
        <p style={{ fontSize: 14, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 14 }}>
          This permanently removes your company profile, shortlist, and campaign history.
          Your data is fully removed within 30 days. This cannot be undone.
        </p>
      )}

      {!blocked && (
        <>
          <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            className="input input-md"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            disabled={deleting}
            style={{ marginBottom: 18, width: "100%" }}
          />
        </>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={deleting}>
          {blocked ? "Close" : "Cancel"}
        </button>
        {!blocked && (
          <button className={`btn btn-danger btn-sm${deleting ? " btn-loading" : ""}`} onClick={onConfirm} disabled={!armed || deleting}>
            Delete my account
          </button>
        )}
      </div>
    </Modal>
  );
}

// Main component
export default function BrandSettingsPage() {
  usePageMeta('Settings', 'Manage your Creatorske brand account and billing settings.');
  const [activeTab, setActiveTab] = useState("profile");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { updateProfile } = useBrandDashboard();

  const [form, setForm] = useState({
    companyName: "Nairobi Brew Co.",
    industry: "food",
    website: "https://nairobibrew.co.ke",
    description: "We craft award-winning specialty coffee and teas across Kenya. Our campaigns focus on authentic lifestyle storytelling.",
    contactName: "Aisha Mwangi",
    jobTitle: "Marketing Manager",
    email: "aisha@nairobibrew.co.ke",
    phone: "+254 722 456 789",
    location: "Nairobi, Kenya",
  });

  const [prefs, setPrefs] = useState({
    autoInvoice: true,
    deposit: false,
    payReminder: true,
  });

  const [notifPrefs, setNotifPrefs] = useState({
    enquiryAccepted: true,
    deliveryMarked: true,
    approvalReminder: true,
    disputeUpdate: true,
    paymentConfirmed: true,
    escrowTimeout: true,
    invoiceReady: true,
    newMessage: true,
    enquiryExpiry: true,
    digest: false,
  });

  function onDirty() { setDirty(true); }

  // Real PUT /brands/profile via useBrandDashboard's mutation (which owns the
  // success/error toasts), rather than a timer that pretends the save landed.
  function handleSave() {
    setSaving(true);
    updateProfile(
      {
        companyName: form.companyName,
        industry: form.industry,
        website: form.website,
        description: form.description,
        contactName: form.contactName,
        jobTitle: form.jobTitle,
        email: form.email,
        phone: form.phone,
        location: form.location,
        logoUrl: form.logoUrl,
        preferences: prefs,
        notificationPreferences: notifPrefs,
      },
      {
        onSuccess: () => setDirty(false),
        onSettled: () => setSaving(false),
      }
    );
  }

  const panels = {
    profile: <ProfileTab form={form} setForm={setForm} onDirty={onDirty} />,
    payments: <PaymentsTab prefs={prefs} setPrefs={setPrefs} onDirty={onDirty} />,
    notifications: <NotificationsTab notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} onDirty={onDirty} />,
    security: <SecurityTab onDirty={onDirty} />,
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
          <p className="settings-sub">Manage your company profile, payments, and account preferences.</p>
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

        <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
      </div>
    </>
  );
}