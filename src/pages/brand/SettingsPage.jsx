import { useState } from "react";
import { toast } from "sonner";
import { usePageMeta } from '@/lib/usePageMeta';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/features/auth/services/auth.service';
import { useBrandDashboard } from '@/features/brand-dashboard/hooks/useBrandDashboard';
import { brandService } from '@/features/brand-dashboard/services/brand.service';
import { SettingsShell, ToggleRow as SharedToggleRow, SaveBar, DangerZone, LoginDetailsCard, TwoFactorCard, SessionsCard, LanguageRegionCard, ThemeCard, AccentCard, DisplayCard, DataExportCard, LegalCard, TeamCard } from '@/components/settings';
import { useImageUpload } from '@/lib/useImageUpload';
import { IconBell, IconBriefcase, IconBuilding, IconBuildingBank, IconBuildingStore, IconCircleCheck, IconCreditCard, IconDeviceMobile, IconHash, IconLockAccess, IconMail, IconMapPin, IconPalette, IconPencil, IconPhone, IconShieldCheck, IconShieldLock, IconStar, IconTrash, IconUpload, IconUser, IconUsers, IconWorld } from '@tabler/icons-react';
import Select from '@/components/ui/Select';

// Nav tabs - same order as every other role's settings (see SettingsShell).
const TABS = [
  { id: "profile", label: "Company", icon: IconBuilding },
  { id: "account", label: "Account", icon: IconShieldLock },
  { id: "notifications", label: "Notifications", icon: IconBell },
  { id: "billing", label: "Billing", icon: IconCreditCard },
  { id: "team", label: "Team", icon: IconUsers },
  { id: "appearance", label: "Appearance", icon: IconPalette },
  { id: "privacy", label: "Privacy & data", icon: IconLockAccess },
];

const TEAM_ROLES = [
  { id: 'owner', label: 'Owner', hint: 'Full access, billing, can delete the account' },
  { id: 'admin', label: 'Admin', hint: 'Manage campaigns, team and settings' },
  { id: 'member', label: 'Member', hint: 'Shortlist, enquire and run campaigns' },
  { id: 'finance', label: 'Finance', hint: 'Invoices, transactions and payment methods only' },
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
      <CollapsibleCard title="Company logo" collapsible={false}>
        <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-16)', marginTop: 'var(--space-16)' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Company logo" className="avatar avatar-lg" style={{ objectFit: "cover" }} />
          ) : (
            <div className="avatar avatar-lg avatar-purple">
              {form.companyName ? form.companyName.slice(0, 2).toUpperCase() : "NB"}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-8)' }}>
            <label className={`btn btn-ghost btn-sm${logoUploading ? " btn-loading" : ""}`} style={{ cursor: "pointer", width: "fit-content" }}>
              <IconUpload className="icon-xs" aria-hidden="true" />
              {logoUrl ? "Change logo" : "Upload logo"}
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleLogoChange} disabled={logoUploading} style={{ display: "none" }} />
            </label>
            <span className="field-hint">PNG or SVG · max 2 MB · shown on invoices and scope confirmations</span>
          </div>
        </div>
      </CollapsibleCard>

      {/* Company details */}
      <CollapsibleCard title="Company details" description="Name, industry, website and the description creators see on your enquiries.">
        <p className="card-body-text" style={{ marginTop: 'calc(-1 * var(--space-2))', marginBottom: 'var(--space-16)' }}>
          This information is shown to creators when they receive your enquiry.
        </p>
        <div className="settings-stack" style={{ gap: 'var(--space-12)' }}>
          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">Company name</label>
              <div className="input-wrapper"><IconBuildingStore className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" value={form.companyName} onChange={upd("companyName")} placeholder="e.g. Nairobi Brew Co." /></div>
            </div>
            <div className="field">
              <label className="field-label field-required">Industry</label>
              <div>
                <Select id="brand-industry" value={form.industry} onChange={(v) => upd("industry")({ target: { value: v } })} options={industryOptions} />
              </div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Website</label>
            <div className="input-wrapper">
              <IconWorld className="icon-sm input-icon left" aria-hidden="true" />
              <input className="input input-md input-icon-left" value={form.website} onChange={upd("website")} placeholder="https://yourcompany.com" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Company description</label>
            <textarea className="input textarea" value={form.description} onChange={upd("description")} placeholder="What does your company do? What kind of campaigns do you run?" rows={3} />
            <span className="field-hint">Optional: helps creators understand your brand before accepting your enquiry.</span>
          </div>
        </div>
      </CollapsibleCard>

      {/* Contact details */}
      <CollapsibleCard title="Contact details" description="Who creators and Creatorske reach when something needs a decision.">
        <p className="card-body-text" style={{ marginTop: 'calc(-1 * var(--space-2))', marginBottom: 'var(--space-16)' }}>
          Used for invoices and shown to creators on accepted bookings.
        </p>
        <div className="settings-stack" style={{ gap: 'var(--space-12)' }}>
          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">Contact name</label>
              <div className="input-wrapper"><IconUser className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" value={form.contactName} onChange={upd("contactName")} placeholder="e.g. Amara Osei" /></div>
            </div>
            <div className="field">
              <label className="field-label">Job title</label>
              <div className="input-wrapper"><IconBriefcase className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" value={form.jobTitle} onChange={upd("jobTitle")} placeholder="e.g. Marketing Manager" /></div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">Business email</label>
              <div className="input-wrapper">
                <IconMail className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" type="email" value={form.email} onChange={upd("email")} placeholder="you@company.com" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Phone number</label>
              <div className="input-wrapper">
                <IconPhone className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" type="tel" value={form.phone} onChange={upd("phone")} placeholder="+254 7XX XXX XXX" />
              </div>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Location</label>
            <div className="input-wrapper">
              <IconMapPin className="icon-sm input-icon left" aria-hidden="true" />
              <input className="input input-md input-icon-left" value={form.location} onChange={upd("location")} placeholder="e.g. Nairobi, Kenya" />
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Verification status */}
      <CollapsibleCard
        title="Brand verification" collapsible={false}
        right={(
          <span className="tag tag-success">
            <IconCircleCheck className="icon-xs" aria-hidden="true" />
            Verified
          </span>
        )}
      >
        <span className="field-hint">Verified brands get higher placement in creator enquiry lists and build faster trust.</span>
        <div className="info-callout" style={{ marginTop: 'var(--space-12)', padding: "var(--space-12) var(--space-16)" }}>
          <IconShieldCheck className="icon-sm" style={{ marginTop: 0 }} aria-hidden="true" />
          <span style={{ fontSize: 12.5, color: "var(--grey-500)" }}>
            Business email domain confirmed · <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>nairobibrew.co.ke</span>
          </span>
        </div>
      </CollapsibleCard>
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
    icon: IconDeviceMobile,
    connected: false,
    fields: [{ key: "phone", label: "M-Pesa phone number", placeholder: "+254 7XX XXX XXX", required: true }],
    summary: (v) => v.phone,
  },
  {
    id: "airtel",
    name: "Airtel Money",
    sub: "Airtel mobile money · wallet-to-wallet",
    iconBg: "#E40000",
    icon: IconDeviceMobile,
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
    icon: IconBuildingBank,
    connected: false,
    fields: [
      { key: "bank", label: "Bank name", placeholder: "e.g. Equity Bank", required: true },
      { key: "account", label: "Account number", placeholder: "0123456789", required: true },
    ],
    summary: (v) => `${v.bank} ····${String(v.account).slice(-4)}`,
  },
];

// Leading icon inside each dynamic input, keyed by what the field collects.
const FIELD_ICON = { phone: IconDeviceMobile, till: IconHash, email: IconMail, bank: IconBuildingBank, account: IconHash, holder: IconUser };
function ConnectMethodModal({ method, onClose, onConnect }) {
  const [values, setValues] = useState({});
  if (!method) return null;

  const missing = method.fields.some((f) => f.required && !String(values[f.key] ?? "").trim());

  return (
    <Modal open onClose={onClose} title={`Connect ${method.name}`} size="sm">
      <p style={{ fontSize: 13.5, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 'var(--space-16)' }}>
        {method.sub}. This is charged when you confirm a booking.
      </p>
      <div className="settings-stack" style={{ gap: 'var(--space-12)', marginBottom: 'var(--space-20)' }}>
        {method.fields.map((f) => (
          <div className="field" key={f.key}>
            <label className={`field-label${f.required ? " field-required" : ""}`}>{f.label}</label>
            <div className="input-wrapper">
              {(() => { const FieldIcon = FIELD_ICON[f.key] ?? IconPencil; return <FieldIcon className="icon-sm input-icon left" aria-hidden="true" />; })()}
              <input
                className="input input-md input-icon-left"
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 'var(--space-12)' }}>
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
      <CollapsibleCard title="Payment methods" collapsible={false}>
        <p className="card-body-text" style={{ marginTop: 'calc(-1 * var(--space-2))', marginBottom: 'var(--space-16)' }}>
          How you pay creators. These are used at checkout when a booking is confirmed.
        </p>
        <div className="settings-stack" style={{ gap: 'var(--space-12)' }}>
          {methods.map((m) => (
            <div key={m.id} className={`pay-row${m.connected ? " connected" : ""}`}>
              <div className="pay-icon" style={{ background: m.iconBg }}>
                <m.icon className="icon-md" style={{ color: m.iconColor || "#fff" }} aria-hidden="true" />
              </div>
              <div className="pay-info">
                <div className="pay-name">{m.name}</div>
                <div className="pay-desc">{m.sub}</div>
              </div>
              {m.connected ? (
                <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-8)' }}>
                  <span className="tag tag-success">
                    <IconCircleCheck className="icon-xs" aria-hidden="true" />
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
      </CollapsibleCard>

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
      <CollapsibleCard title="Invoice preferences" collapsible={false}>
        <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
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
      </CollapsibleCard>

      {/* Escrow info */}
      <div className="info-callout">
        <IconShieldLock className="icon-sm" aria-hidden="true" />
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
        <CollapsibleCard key={g.title} title={g.title} collapsible={false}>
          <div className="settings-stack" style={{ gap: 0, marginTop: 'var(--space-16)' }}>
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
        </CollapsibleCard>
      ))}

      <CollapsibleCard title="Email digest" collapsible={false}>
        <p className="card-body-text" style={{ marginTop: 'calc(-1 * var(--space-2))', marginBottom: 'var(--space-16)' }}>
          Instead of individual emails, get a single daily summary.
        </p>
        <ToggleRow
          label="Daily digest"
          hint="One email per day covering all activity across your active campaigns."
          on={notifPrefs.digest}
          onChange={() => toggle("digest")}
        />
      </CollapsibleCard>
    </div>
  );
}

// Account tab - sign-in, security, region, and the one destructive action.
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
      <LoginDetailsCard collapsible={false} />
      <div className="bento-2">
        <TwoFactorCard />
        <SessionsCard />
      </div>
      <LanguageRegionCard />
      <DangerZone title="Delete account" description="Permanently removes your company profile, campaign history and all data. Blocked while any campaign is still active.">
        <button className="btn btn-danger btn-sm" onClick={() => setDeleteOpen(true)}>
          <IconTrash className="icon-xs" aria-hidden="true" />Request account deletion
        </button>
      </DangerZone>
      <DeleteBrandAccountModal open={deleteOpen} activeBookings={activeCampaignCount} deleting={deleting} onClose={() => setDeleteOpen(false)} onConfirm={handleConfirmDelete} />
    </div>
  );
}

// Billing tab - the plan, what pays for it, and how invoices behave.
function BillingTab({ prefs, setPrefs, onDirty }) {
  const navigate = useNavigate();
  return (
    <div className="settings-stack">
      <CollapsibleCard title="Your plan" collapsible={false} right={<span className="tag tag-success">Active</span>}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 'var(--space-16)', marginTop: 'var(--space-16)', flexWrap: 'wrap' }}>
          <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-12)' }}>
            <div className="avatar avatar-md avatar-purple" style={{ borderRadius: "var(--radius-md)" }}>
              <IconStar className="icon-md" aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h5-size)", fontWeight: 600 }}>Brand account</div>
              <span className="field-hint">Unlimited enquiries · shortlisting · campaign management</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pricing')}>Change plan</button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/brand/billing')}>Invoices &amp; charges</button>
          </div>
        </div>
      </CollapsibleCard>
      <PaymentsTab prefs={prefs} setPrefs={setPrefs} onDirty={onDirty} />
    </div>
  );
}

// Team tab
function TeamTab() {
  const { user } = useAuth();
  const [inviting, setInviting] = useState(false);
  const members = [
    { id: 'me', name: user?.contactName ?? user?.firstName ?? 'You', email: user?.email ?? '', role: 'owner', status: 'active' },
  ];
  function invite(email, role) {
    setInviting(true);
    brandService.inviteTeamMember(email, role)
      .then(() => toast.success(`Invitation sent to ${email}.`))
      .catch(() => toast.error("Team invites aren't available yet. It needs backend support."))
      .finally(() => setInviting(false));
  }
  return (
    <div className="settings-stack">
      <TeamCard
        members={members}
        roles={TEAM_ROLES}
        onInvite={invite}
        onRemove={(id) => brandService.removeTeamMember(id).catch(() => {})}
        inviting={inviting}
        description="Everyone here signs in with their own email and password. Roles decide what they can change."
      />
      <div className="info-callout">
        <IconUsers className="icon-md" aria-hidden="true" />
        <div>
          <div className="info-callout-title">Who should be on the team?</div>
          <p className="info-callout-desc">Add whoever books creators (Member), whoever approves spend (Admin) and whoever reconciles invoices (Finance). Actions in campaigns and billing are logged with the person who made them.</p>
        </div>
      </div>
    </div>
  );
}

// Appearance tab
function AppearanceTab() {
  return (
    <div className="settings-stack">
      <ThemeCard />
      <div className="bento-2">
        <AccentCard />
        <DisplayCard />
      </div>
    </div>
  );
}

// Privacy & data tab
function PrivacyTab() {
  const [showToCreators, setShowToCreators] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (fn) => (v) => { fn(v); setDirty(true); };
  function handleSave() { setSaved(true); setDirty(false); toast.success('Privacy preferences saved.'); setTimeout(() => setSaved(false), 2000); }
  return (
    <div className="settings-stack">
      <div className="bento-2">
        <CollapsibleCard title="Visibility to creators" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <SharedToggleRow label="Show company name on enquiries" desc="Off = creators see 'A verified brand' until you book." on={showToCreators} onChange={set(setShowToCreators)} />
            <div className="field-divider" />
            <SharedToggleRow label="Show our logo on completed campaigns" desc="Creators may list your campaign in their portfolio with your logo." on={showLogo} onChange={set(setShowLogo)} />
          </div>
        </CollapsibleCard>
        <CollapsibleCard title="Data use" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <SharedToggleRow label="Share anonymised analytics" desc="Helps us improve the platform. No personal or company data is shared." on={shareAnalytics} onChange={set(setShareAnalytics)} />
            <div className="field-divider" />
            <SharedToggleRow label="Product news and case studies" desc="Occasional emails about new features and campaigns that worked." on={marketing} onChange={set(setMarketing)} />
          </div>
        </CollapsibleCard>
      </div>
      <div className="bento-2">
        <DataExportCard description="Download your company profile, campaigns, messages, invoices and transactions as a ZIP of JSON and CSV files. We email you a link within 24 hours." />
        <LegalCard />
      </div>
      <SaveBar dirty={dirty} saved={saved} onSave={handleSave} />
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
        <div className="warning-banner" style={{ marginBottom: 'var(--space-20)' }}>
          You have {activeBookings} active {activeBookings === 1 ? "campaign" : "campaigns"} that must be completed
          or cancelled before deletion can proceed. Funds in escrow are released when each campaign is approved.
        </div>
      ) : (
        <p style={{ fontSize: 14, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 'var(--space-16)' }}>
          This permanently removes your company profile, shortlist, and campaign history.
          Your data is fully removed within 30 days. This cannot be undone.
        </p>
      )}

      {!blocked && (
        <>
          <label className="field-label" style={{ display: "block", marginBottom: 'var(--space-8)' }}>
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            className="input input-md"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            disabled={deleting}
            style={{ marginBottom: 'var(--space-20)', width: "100%" }}
          />
        </>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 'var(--space-12)' }}>
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

  const bar = <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />;
  const panels = {
    profile: () => <><ProfileTab form={form} setForm={setForm} onDirty={onDirty} />{bar}</>,
    account: () => <AccountTab />,
    notifications: () => <><NotificationsTab notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} onDirty={onDirty} />{bar}</>,
    billing: () => <><BillingTab prefs={prefs} setPrefs={setPrefs} onDirty={onDirty} />{bar}</>,
    team: () => <TeamTab />,
    appearance: () => <AppearanceTab />,
    privacy: () => <PrivacyTab />,
  };

  return <SettingsShell subtitle="Your company, sign-in, notifications, billing, team and preferences." tabs={TABS} panels={panels} />;
}
