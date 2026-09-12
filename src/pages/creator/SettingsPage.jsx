import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePageMeta } from '@/lib/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { authService, userService } from '@/features/auth/services/auth.service';
import { useImageUpload } from '@/lib/useImageUpload';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import { SettingsShell, Toggle, ToggleRow, SaveBar, DangerZone, LoginDetailsCard, TwoFactorCard, SessionsCard, LanguageRegionCard, ThemeCard, AccentCard, DisplayCard, DataExportCard, LegalCard } from '@/components/settings';
import { useUnpublishAllRateCards } from '@/features/rate-card/hooks/useRateCard';
import { IconBell, IconBrandInstagram, IconBrandTiktok, IconBrandTwitter, IconBrandWhatsapp, IconBrandYoutube, IconBuildingBank, IconCreditCard, IconDeviceMobile, IconEyeOff, IconHash, IconLockAccess, IconMail, IconMapPin, IconPalette, IconPencil, IconShieldLock, IconTrash, IconUpload, IconUser, IconWallet } from '@tabler/icons-react';
import Select from '@/components/ui/Select';

const TABS = [
  { id: "profile", label: "Profile", icon: IconUser },
  { id: "account", label: "Account", icon: IconShieldLock },
  { id: "notifications", label: "Notifications", icon: IconBell },
  { id: "payouts", label: "Payouts", icon: IconWallet },
  { id: "appearance", label: "Appearance", icon: IconPalette },
  { id: "privacy", label: "Privacy & data", icon: IconLockAccess },
];

// Tab panels

function ProfileTab() {
  const [saved, setSaved] = useState(false);
  const [category, setCategory] = useState('Lifestyle & Travel');
  const [primaryPlatform, setPrimaryPlatform] = useState('Instagram');

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
          <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-16)' }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-8)' }}>
              <label className={`btn btn-secondary btn-sm${photoUploading ? " btn-loading" : ""}`} style={{ cursor: "pointer", width: "fit-content" }}>
                <IconUpload className="icon-xs" aria-hidden="true" />
                {photoUrl ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} disabled={photoUploading} style={{ display: "none" }} />
              </label>
              <p className="field-hint" style={{ marginTop: 0 }}>JPG or PNG · max 2 MB</p>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">First name</label>
              <div className="input-wrapper"><IconUser className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" defaultValue="Amara" /></div>
            </div>
            <div className="field">
              <label className="field-label field-required">Last name</label>
              <div className="input-wrapper"><IconUser className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" defaultValue="Osei" /></div>
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
              <input className="input input-md" style={{ paddingLeft: 'var(--space-24)' }} defaultValue="amaracreates" />
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
                <IconMapPin className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" defaultValue="Nairobi, Kenya" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Category</label>
              <div>
                <Select aria-label="Category" value={category} onChange={setCategory} options={["Lifestyle & Travel", "Fashion & Beauty", "Food & Wellness", "Tech & Gaming", "Finance & Business"].map((o) => ({ value: o, label: o }))} />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Audience stats: bento of stat-cards, mirrors the dashboard KPI pattern */}
      <div>
        <div className="field-label" style={{ marginBottom: 'var(--space-12)' }}>Audience stats</div>
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
            <div style={{ marginTop: 'var(--space-8)' }}>
              <Select size="sm" aria-label="Primary platform" value={primaryPlatform} onChange={setPrimaryPlatform} options={["Instagram", "TikTok", "YouTube", "Twitter / X"].map((o) => ({ value: o, label: o }))} />
            </div>
          </div>
        </div>
        <p className="field-hint" style={{ marginTop: 'var(--space-8)' }}>Shown on your public rate card.</p>
      </div>

      {/* Social links */}
      <CollapsibleCard title="Social platforms">
        <div className="settings-stack" style={{ gap: 'var(--space-16)', marginTop: 'var(--space-16)' }}>
          <div className="field">
            <label className="field-label">Instagram</label>
            <div className="input-wrapper">
              <IconBrandInstagram className="icon-sm input-icon left" aria-hidden="true" />
              <input className="input input-md input-icon-left" defaultValue="instagram.com/amaracreates" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">TikTok</label>
              <div className="input-wrapper">
                <IconBrandTiktok className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" defaultValue="tiktok.com/@amaracreates" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">YouTube</label>
              <div className="input-wrapper">
                <IconBrandYoutube className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" placeholder="youtube.com/…" />
              </div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Twitter / X</label>
              <div className="input-wrapper">
                <IconBrandTwitter className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" placeholder="x.com/…" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">WhatsApp business</label>
              <div className="input-wrapper">
                <IconBrandWhatsapp className="icon-sm input-icon left" style={{ color: "var(--status-success)" }} aria-hidden="true" />
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
          <div style={{ marginTop: 'var(--space-12)' }}>
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
            <div style={{ marginTop: 'var(--space-12)' }}>
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
            <div className="field" style={{ marginTop: 'var(--space-12)' }}>
              <label className="field-label">Send notifications to</label>
              <div className="input-wrapper">
                <IconMail className="icon-sm input-icon left" aria-hidden="true" />
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
    icon: IconDeviceMobile,
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
    icon: IconCreditCard,
    iconStyle: { background: "var(--purple-50)", color: "var(--purple-600)" },
    blurb: "Accept card payments internationally",
    fields: [
      { key: "email", label: "Stripe account email", placeholder: "you@email.com", required: true, type: "email" },
    ],
    summary: (v) => `${v.email} · Visa / Mastercard`,
  },
  bank: {
    name: "Bank transfer",
    icon: IconBuildingBank,
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
const FIELD_ICON = { phone: IconDeviceMobile, till: IconHash, email: IconMail, bank: IconBuildingBank, account: IconHash, holder: IconUser };
function ConnectPayoutModal({ providerKey, onClose, onConnect }) {
  const provider = providerKey ? PAY_PROVIDERS[providerKey] : null;
  const [values, setValues] = useState({});

  if (!provider) return null;

  const missing = provider.fields.some((f) => f.required && !String(values[f.key] ?? "").trim());

  return (
    <Modal open onClose={onClose} title={`Connect ${provider.name}`} size="sm">
      <p style={{ fontSize: 13.5, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 'var(--space-16)' }}>
        {provider.blurb}. These details are shown to brands when they pay you.
      </p>
      <div className="settings-stack" style={{ gap: 'var(--space-12)', marginBottom: 'var(--space-20)' }}>
        {provider.fields.map((f) => (
          <div className="field" key={f.key}>
            <label className={`field-label${f.required ? " field-required" : ""}`}>{f.label}</label>
            <div className="input-wrapper">
              {(() => { const FieldIcon = FIELD_ICON[f.key] ?? IconPencil; return <FieldIcon className="icon-sm input-icon left" aria-hidden="true" />; })()}
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
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 'var(--space-12)' }}>
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
  const [defaultMethod, setDefaultMethod] = useState('');
  const [currency, setCurrency] = useState('KES');
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
        <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
          {Object.entries(PAY_PROVIDERS).map(([key, provider]) => {
            const summary = connected[key];
            return (
              <div key={key} className={`pay-row${summary ? " connected" : ""}`}>
                <div className="pay-icon" style={provider.iconStyle}>
                  <provider.icon className="icon-md" aria-hidden="true" />
                </div>
                <div className="pay-info">
                  <div className="pay-name">{provider.name}</div>
                  <div className="pay-desc">{summary ?? provider.blurb}</div>
                </div>
                {summary ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-8)' }}>
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
        <div className="settings-stack" style={{ marginTop: 'var(--space-16)' }}>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Default payout method</label>
              <div>
                <Select aria-label="Default payout method" disabled={Object.keys(connected).length === 0} placeholder="No methods connected yet" value={defaultMethod} onChange={setDefaultMethod} options={Object.keys(connected).map((key) => ({ value: key, label: PAY_PROVIDERS[key].name }))} />
              </div>
              {Object.keys(connected).length === 0 && (
                <p className="field-hint">Connect a payment method above to choose a default.</p>
              )}
            </div>
            <div className="field">
              <label className="field-label">Payout currency</label>
              <div>
                <Select aria-label="Payout currency" value={currency} onChange={setCurrency} options={[{ value: 'KES', label: 'KES', hint: 'Kenyan Shilling' }, { value: 'USD', label: 'USD', hint: 'US Dollar' }, { value: 'EUR', label: 'EUR', hint: 'Euro' }]} />
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
  // Theme and accent are applied instantly by ThemeContext and persisted;
  // the rate card layout is creator-only.
  const [layout, setLayout] = useState(() => {
    try { return localStorage.getItem('creatorske_card_layout') ?? 'Classic'; } catch { return 'Classic'; }
  });
  function handleLayout(next) {
    setLayout(next);
    try { localStorage.setItem('creatorske_card_layout', next); } catch { /* storage unavailable */ }
    toast.success(`${next} layout applied to your rate card.`);
  }

  return (
    <div className="settings-stack">
      <ThemeCard />
      <div className="bento-2">
        <AccentCard hint="Applied to buttons, highlights, and your rate card theme." />
        <DisplayCard />
      </div>
      <CollapsibleCard title="Rate card layout" collapsible={false}>
        <div style={{ display: "flex", gap: 'var(--space-12)', marginTop: 'var(--space-16)', maxWidth: 420 }}>
          {["Classic", "Minimal"].map((option) => (
            <button key={option} type="button" onClick={() => handleLayout(option)} aria-pressed={layout === option} className={`option-card${layout === option ? " selected" : ""}`} style={{ flex: 1, alignItems: "stretch", cursor: "pointer" }}>
              <div style={{ height: 52, background: "var(--white)", border: "0.5px solid var(--grey-100)", borderRadius: 6, padding: 'var(--space-8)', display: "flex", flexDirection: "column", gap: 'var(--space-4)' }}>
                <div style={{ height: 5, background: "var(--purple-50)", borderRadius: 2, width: "60%" }} />
                <div style={{ height: 3, background: "var(--grey-100)", borderRadius: 2 }} />
                <div style={{ height: 3, background: "var(--grey-100)", borderRadius: 2, width: option === "Minimal" ? "45%" : "75%" }} />
                {option === "Classic" && <div style={{ height: 3, background: "var(--grey-100)", borderRadius: 2, width: "50%" }} />}
              </div>
              <span className="option-card-label" style={{ textAlign: "center", width: "100%" }}>{option}</span>
            </button>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}

function AccountTab() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const { rateCards, unpublishAll, isUnpublishingAll } = useUnpublishAllRateCards();

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
      <LoginDetailsCard collapsible={false} />
      <div className="bento-2">
        <TwoFactorCard />
        <SessionsCard />
      </div>
      <LanguageRegionCard />

      <DangerZone>
        <button className={`btn btn-danger btn-sm${unpublishing || isUnpublishingAll ? " btn-loading" : ""}`} disabled={unpublishing || isUnpublishingAll} onClick={() => setConfirmUnpublish(true)}>
          <IconEyeOff className="icon-xs" aria-hidden="true" />Unpublish all cards
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>
          <IconTrash className="icon-xs" aria-hidden="true" />Delete account
        </button>
      </DangerZone>

      <ConfirmDialog
        open={confirmUnpublish}
        variant="danger"
        title="Unpublish all rate cards?"
        message={`Brands won't be able to view or book ${rateCards.length ? `your ${rateCards.length} rate card${rateCards.length === 1 ? '' : 's'}` : 'your rate cards'} until you republish. Your content and pricing are kept.`}
        confirmLabel="Unpublish all"
        onConfirm={handleUnpublishAll}
        onCancel={() => setConfirmUnpublish(false)}
      />
      <DeleteAccountDialog open={confirmDelete} deleting={deleting} onConfirm={handleConfirmDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  );
}

function PrivacyTab() {
  const [showInDirectory, setShowInDirectory] = useState(true);
  const [showEarnings, setShowEarnings] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(true);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const set = (fn) => (v) => { fn(v); setDirty(true); };

  function handleSave() {
    setSaved(true); setDirty(false);
    toast.success('Privacy preferences saved.');
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="settings-stack">
      <div className="bento-2">
        <CollapsibleCard title="Visibility" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <ToggleRow label="Show my profile in the directory" desc="Brands can find you through search and filters. Off = only people with your link can see your card." on={showInDirectory} onChange={set(setShowInDirectory)} />
            <div className="field-divider" />
            <ToggleRow label="Show booking count on my rate card" desc="Displays how many campaigns you've completed on Creatorske." on={showEarnings} onChange={set(setShowEarnings)} />
          </div>
        </CollapsibleCard>
        <CollapsibleCard title="Data use" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <ToggleRow label="Share anonymised analytics" desc="Helps us improve the platform. No personal data is shared." on={shareAnalytics} onChange={set(setShareAnalytics)} />
            <div className="field-divider" />
            <ToggleRow label="Product news and tips" desc="Occasional emails about new features and how creators use them." on={marketing} onChange={set(setMarketing)} />
          </div>
        </CollapsibleCard>
      </div>
      <div className="bento-2">
        <DataExportCard />
        <LegalCard />
      </div>
      <SaveBar dirty={dirty} saved={saved} onSave={handleSave} />
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
      <p style={{ fontSize: 14, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 'var(--space-16)' }}>
        This permanently deletes your creator profile, rate cards, portfolio, and booking history.
        Pending payouts are forfeited. This cannot be undone.
      </p>
      <label className="field-label" style={{ display: "block", marginBottom: 'var(--space-8)' }}>
        Type <strong>DELETE</strong> to confirm
      </label>
      <input
        className="input input-md"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder="DELETE"
        disabled={deleting}
        style={{ marginBottom: 'var(--space-20)' }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 'var(--space-12)' }}>
        <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={deleting}>Cancel</button>
        <button className={`btn btn-danger btn-sm${deleting ? " btn-loading" : ""}`} onClick={onConfirm} disabled={!armed || deleting}>
          Delete my account
        </button>
      </div>
    </Modal>
  );
}

// Main component

export default function SettingsPage() {
  usePageMeta('Settings', 'Manage your Creatorske account, profile, and payment settings.');
  const panels = {
    profile: () => <ProfileTab />,
    account: () => <AccountTab />,
    notifications: () => <NotificationsTab />,
    payouts: () => <PaymentsTab />,
    appearance: () => <AppearanceTab />,
    privacy: () => <PrivacyTab />,
  };
  return <SettingsShell subtitle="Your profile, sign-in, notifications, payouts and preferences." tabs={TABS} panels={panels} />;
}
