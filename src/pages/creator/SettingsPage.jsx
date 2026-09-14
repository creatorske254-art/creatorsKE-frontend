import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePageMeta } from '@/lib/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/features/auth/services/auth.service';
import { useImageUpload } from '@/lib/useImageUpload';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ErrorState from '@/components/shared/ErrorState';
import Modal from '@/components/ui/Modal';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import { SettingsShell, Toggle, ToggleRow, SaveBar, DangerZone, LoginDetailsCard, TwoFactorCard, SessionsCard, LanguageRegionCard, ThemeCard, AccentCard, DisplayCard, DataExportCard, LegalCard } from '@/components/settings';
import { useUnpublishAllRateCards } from '@/features/rate-card/hooks/useRateCard';
import { useProfile, usePreferences } from '@/features/auth/hooks/useProfile';
import { usePayoutMethods } from '@/features/payments/hooks/usePayoutMethods';
import { getInitials, formatCount } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import SmartImage from '@/components/ui/SmartImage';
import { IconBell, IconBrandInstagram, IconBrandTiktok, IconBrandTwitter, IconBrandWhatsapp, IconBrandYoutube, IconBuildingBank, IconDeviceMobile, IconEyeOff, IconHash, IconLockAccess, IconMail, IconMapPin, IconPalette, IconPencil, IconShieldLock, IconTrash, IconUpload, IconUser, IconWallet } from '@tabler/icons-react';
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

const CATEGORIES = ["Lifestyle", "Fashion", "Food", "Tech", "Beauty", "Travel", "Fitness", "Finance", "Comedy", "Education"];
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X"];

function ProfileTab() {
  const { profile, isLoading, isError, refetch } = useProfile();
  if (isLoading) return <div className="settings-stack"><Skeleton width="100%" height={220} /><Skeleton width="100%" height={120} /></div>;
  if (isError || !profile) return <ErrorState title="Couldn't load your profile" onRetry={refetch} />;
  return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }) {
  const { saveProfile, isSaving } = useProfile();
  const c = profile.creator ?? {};
  const socials = c.socials ?? {};
  const [form, setForm] = useState({
    firstName: profile.firstName ?? '', lastName: profile.lastName ?? '', handle: profile.handle ?? '',
    bio: c.bio ?? '', location: c.location ?? '', niche: c.niche ?? CATEGORIES[0], phone: profile.phone ?? '',
    primaryPlatform: c.platforms?.[0]?.name ?? PLATFORMS[0],
    instagram: socials.instagram ?? '', tiktok: socials.tiktok ?? '', youtube: socials.youtube ?? '', twitter: socials.twitter ?? '',
  });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: typeof v === 'string' ? v : v.target.value })); setDirty(true); };

  function handleSave() {
    const { instagram, tiktok, youtube, twitter, primaryPlatform, ...rest } = form;
    saveProfile({ ...rest, socials: { instagram, tiktok, youtube, twitter, primaryPlatform } }, {
      onSuccess: () => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2000); },
    });
  }

  const { url: photoUrl, uploading: photoUploading, onChange: handlePhotoChange } = useImageUpload({
    initialUrl: profile.avatar ?? null,
    successMessage: "Profile photo updated.",
    onUploaded: ({ url }) => saveProfile({ avatar: url }),
  });
  const avatarSrc = photoUrl ?? profile.avatar;
  const followers = c.followers ?? c.platforms?.reduce((n, p) => n + (p.followers ?? 0), 0) ?? 0;
  const published = profile.rateCardPublished ?? true;

  return (
    <div className="settings-stack">
      {/* Avatar & name */}
      <CollapsibleCard title="Public profile" description="Your photo, name, handle, bio and category, as brands see them."
        right={<span className={`tag ${published ? 'tag-success' : 'tag-default'}`}>
            <span className="sdot" style={{ background: published ? "var(--status-success)" : "var(--grey-400)" }} />
            {published ? 'Live' : 'Hidden'}
          </span>}>
        <div className="settings-stack">
          <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-16)' }}>
            <SmartImage
              src={avatarSrc}
              alt="Profile"
              className="avatar avatar-lg"
              style={{ objectFit: "cover" }}
              fallback={<div className="avatar avatar-lg avatar-purple">{getInitials(`${form.firstName} ${form.lastName}`.trim() || profile.email)}</div>}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 'var(--space-8)' }}>
              <label className={`btn btn-secondary btn-sm${photoUploading ? " btn-loading" : ""}`} style={{ cursor: "pointer", width: "fit-content" }}>
                <IconUpload className="icon-xs" aria-hidden="true" />
                {avatarSrc ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} disabled={photoUploading} style={{ display: "none" }} />
              </label>
              <p className="field-hint" style={{ marginTop: 0 }}>JPG or PNG · max 2 MB</p>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label field-required">First name</label>
              <div className="input-wrapper"><IconUser className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" value={form.firstName} onChange={set('firstName')} /></div>
            </div>
            <div className="field">
              <label className="field-label field-required">Last name</label>
              <div className="input-wrapper"><IconUser className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" value={form.lastName} onChange={set('lastName')} /></div>
            </div>
          </div>

          <div className="field">
            <label className="field-label field-required">Creator handle</label>
            <div className="input-wrapper">
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--grey-400)", pointerEvents: "none" }}>@</span>
              <input className="input input-md" style={{ paddingLeft: 'var(--space-24)' }} value={form.handle} onChange={(e) => set('handle')(e.target.value.replace(/[^a-z0-9_.]/gi, '').toLowerCase())} />
            </div>
            <p className="field-hint">Your public rate card lives at /c/{form.handle || 'handle'}.</p>
          </div>

          <div className="field">
            <label className="field-label">Bio</label>
            <textarea className="input input-md textarea" rows={3} value={form.bio} onChange={set('bio')} />
            <p className="field-hint">Appears on your public rate card. Keep it under 120 characters.</p>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Location</label>
              <div className="input-wrapper">
                <IconMapPin className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" value={form.location} onChange={set('location')} />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Category</label>
              <div>
                <Select aria-label="Category" value={form.niche} onChange={set('niche')} options={[...new Set([form.niche, ...CATEGORIES])].filter(Boolean).map((o) => ({ value: o, label: o }))} />
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
            <div className="stat-card-value">{formatCount(followers)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Avg engagement</div>
            <div className="stat-card-value">{c.eng != null ? `${c.eng}%` : '-'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Rating</div>
            <div className="stat-card-value">{c.rating != null ? c.rating : '-'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Primary platform</div>
            <div style={{ marginTop: 'var(--space-8)' }}>
              <Select size="sm" aria-label="Primary platform" value={form.primaryPlatform} onChange={set('primaryPlatform')} options={[...new Set([form.primaryPlatform, ...PLATFORMS])].filter(Boolean).map((o) => ({ value: o, label: o }))} />
            </div>
          </div>
        </div>
        <p className="field-hint" style={{ marginTop: 'var(--space-8)' }}>Follower counts and engagement come from your connected platforms and are shown on your public rate card.</p>
      </div>

      {/* Social links */}
      <CollapsibleCard title="Social platforms" description="The handles shown on your rate card and used for follower counts.">
        <div className="settings-stack" style={{ gap: 'var(--space-16)', marginTop: 'var(--space-16)' }}>
          <div className="field">
            <label className="field-label">Instagram</label>
            <div className="input-wrapper">
              <IconBrandInstagram className="icon-sm input-icon left" aria-hidden="true" />
              <input className="input input-md input-icon-left" value={form.instagram} onChange={set('instagram')} placeholder="instagram.com/…" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">TikTok</label>
              <div className="input-wrapper">
                <IconBrandTiktok className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" value={form.tiktok} onChange={set('tiktok')} placeholder="tiktok.com/@…" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">YouTube</label>
              <div className="input-wrapper">
                <IconBrandYoutube className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" value={form.youtube} onChange={set('youtube')} placeholder="youtube.com/…" />
              </div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Twitter / X</label>
              <div className="input-wrapper">
                <IconBrandTwitter className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" value={form.twitter} onChange={set('twitter')} placeholder="x.com/…" />
              </div>
            </div>
            <div className="field">
              <label className="field-label">WhatsApp business</label>
              <div className="input-wrapper">
                <IconBrandWhatsapp className="icon-sm input-icon left" style={{ color: "var(--status-success)" }} aria-hidden="true" />
                <input className="input input-md input-icon-left" type="tel" value={form.phone} onChange={set('phone')} placeholder="+254 7XX XXX XXX" />
              </div>
            </div>
          </div>
          <p className="field-hint">WhatsApp number is used for the "Enquire" button on your rate card.</p>
        </div>
      </CollapsibleCard>

      <SaveBar dirty={dirty} saving={isSaving} saved={saved} onSave={handleSave} />
    </div>
  );
}

const NOTIF_ROWS = [
  ['newEnquiry', 'New enquiry', 'When a brand submits an enquiry from your rate card'],
  ['bookingConfirmed', 'Booking confirmed', 'When a client books and pays for a package'],
  ['paymentReceived', 'Payment received', 'Each time a payment lands in your account'],
  ['newMessage', 'New message', 'When a brand replies in an enquiry thread'],
];
const MORE_NOTIF_ROWS = [
  ['reviewReceived', 'New review', 'When a brand leaves a review after a campaign'],
  ['weeklyDigest', 'Weekly performance digest', 'Views, enquiries, and earnings summary every Monday'],
  ['marketingTips', 'Product updates', 'New features and platform announcements'],
];

function NotificationsTab() {
  const { preferences, isLoading, isError, savePreferences, isSaving } = usePreferences();
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const notifs = draft?.notifications ?? preferences.notifications ?? {};
  const email = draft?.notificationEmail ?? preferences.notificationEmail ?? '';

  function toggle(key) {
    setDraft((d) => ({ notificationEmail: email, ...(d ?? {}), notifications: { ...notifs, [key]: !notifs[key] } }));
  }
  function setEmail(v) { setDraft((d) => ({ notifications: notifs, ...(d ?? {}), notificationEmail: v })); }
  function handleSave() {
    savePreferences({ notifications: notifs, notificationEmail: email }, {
      onSuccess: () => { setDraft(null); setSaved(true); toast.success('Notification preferences saved.'); setTimeout(() => setSaved(false), 2000); },
    });
  }

  if (isLoading) return <div className="settings-stack"><Skeleton width="100%" height={240} /></div>;
  if (isError) return <ErrorState title="Couldn't load your notification settings" />;

  const Row = ({ k, label, desc, last }) => (
    <div className="notif-row" style={last ? { borderBottom: "none" } : undefined}>
      <div>
        <div className="notif-row-label">{label}</div>
        <div className="notif-row-desc">{desc}</div>
      </div>
      <Toggle on={!!notifs[k]} onChange={() => toggle(k)} />
    </div>
  );

  return (
    <div className="settings-stack">
      <div className="bento-2">
        <CollapsibleCard title="Email notifications" description="Which events email you: enquiries, bookings, payments and messages.">
          <div style={{ marginTop: 'var(--space-12)' }}>
            {NOTIF_ROWS.map(([k, label, desc], i) => <Row key={k} k={k} label={label} desc={desc} last={i === NOTIF_ROWS.length - 1} />)}
          </div>
        </CollapsibleCard>

        <div className="settings-stack">
          <CollapsibleCard title="More notifications" collapsible={false}>
            <div style={{ marginTop: 'var(--space-12)' }}>
              {MORE_NOTIF_ROWS.map(([k, label, desc], i) => <Row key={k} k={k} label={label} desc={desc} last={i === MORE_NOTIF_ROWS.length - 1} />)}
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Notification email" collapsible={false}>
            <div className="field" style={{ marginTop: 'var(--space-12)' }}>
              <label className="field-label">Send notifications to</label>
              <div className="input-wrapper">
                <IconMail className="icon-sm input-icon left" aria-hidden="true" />
                <input className="input input-md input-icon-left" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <p className="field-hint">We'll also send receipts and important account info here.</p>
            </div>
          </CollapsibleCard>
        </div>
      </div>

      <SaveBar dirty={!!draft} saving={isSaving} saved={saved} onSave={handleSave} />
    </div>
  );
}

// Field sets for each payout provider's connect modal. Connecting posts to
// /payments/methods; the provider key is the method `type` the API stores.
const PAY_PROVIDERS = {
  mpesa: {
    name: "M-Pesa",
    icon: IconDeviceMobile,
    iconStyle: { background: "var(--tint-green-bg)", color: "var(--tint-green-text)" },
    blurb: "Connect your M-Pesa number, till or paybill",
    fields: [
      { key: "phone", label: "M-Pesa phone number", placeholder: "+254 7XX XXX XXX", required: true },
      { key: "till", label: "Till / paybill number", placeholder: "e.g. 123456" },
    ],
    summary: (v) => [v.phone, v.till && `Till ${v.till}`].filter(Boolean).join(" · "),
  },
  airtel: {
    name: "Airtel Money",
    icon: IconDeviceMobile,
    iconStyle: { background: "var(--status-error-bg)", color: "var(--status-error-text)" },
    blurb: "Withdraw to an Airtel Money number",
    fields: [
      { key: "phone", label: "Airtel Money number", placeholder: "+254 7XX XXX XXX", required: true },
    ],
    summary: (v) => v.phone,
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
function ConnectPayoutModal({ providerKey, onClose, onConnect, busy }) {
  const provider = providerKey ? PAY_PROVIDERS[providerKey] : null;
  const [values, setValues] = useState({});

  if (!provider) return null;

  const missing = provider.fields.some((f) => f.required && !String(values[f.key] ?? "").trim());

  return (
    <Modal open onClose={onClose} title={`Connect ${provider.name}`} size="sm">
      <p style={{ fontSize: 13.5, color: "var(--grey-600)", lineHeight: 1.65, marginBottom: 'var(--space-16)' }}>
        {provider.blurb}. Your earnings are paid out here.
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
        <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={busy}>Cancel</button>
        <button
          className={`btn btn-primary btn-sm${busy ? ' btn-loading' : ''}`}
          disabled={missing || busy}
          onClick={() => onConnect({ type: providerKey, name: providerKey === 'bank' ? values.bank : provider.name, detail: provider.summary(values), fields: values })}
        >
          Connect {provider.name}
        </button>
      </div>
    </Modal>
  );
}

function PaymentsTab() {
  const { methods, primaryMethod, isLoading, addMethod, isAdding, setPrimary, removeMethod } = usePayoutMethods();
  const { preferences, savePreferences } = usePreferences();
  const [connecting, setConnecting] = useState(null); // provider key
  const [disconnecting, setDisconnecting] = useState(null); // method

  const byType = Object.fromEntries(methods.map((m) => [m.type, m]));
  const currency = preferences.currency ?? 'KES';
  const autoWithdraw = preferences.autoWithdraw ?? false;

  function handleConnect(payload) {
    addMethod(payload, { onSuccess: () => setConnecting(null) });
  }
  function handleDisconnect() {
    removeMethod(disconnecting.id);
    setDisconnecting(null);
  }

  return (
    <div className="settings-stack">
      <CollapsibleCard title="Payout methods" collapsible={false}
        right={<p className="field-hint" style={{ margin: 0 }}>Where your earnings are sent</p>}>
        <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
          {isLoading && <Skeleton width="100%" height={64} />}
          {!isLoading && Object.entries(PAY_PROVIDERS).map(([key, provider]) => {
            const method = byType[key];
            return (
              <div key={key} className={`pay-row${method ? " connected" : ""}`}>
                <div className="pay-icon" style={provider.iconStyle}>
                  <provider.icon className="icon-md" aria-hidden="true" />
                </div>
                <div className="pay-info">
                  <div className="pay-name">{method?.name ?? provider.name}</div>
                  <div className="pay-desc">{method?.detail ?? provider.blurb}</div>
                </div>
                {method ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 'var(--space-8)' }}>
                    <span className="tag tag-success">
                      <span className="sdot" style={{ background: "var(--status-success)" }} />
                      {method.primary ? 'Primary' : 'Connected'}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDisconnecting(method)}>Disconnect</button>
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
        busy={isAdding}
      />

      <ConfirmDialog
        open={!!disconnecting}
        variant="danger"
        title={`Disconnect ${disconnecting?.name ?? ""}?`}
        message="You won't be able to withdraw to this method until you reconnect it. Your existing transactions are unaffected."
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
                <Select aria-label="Default payout method" disabled={methods.length === 0} placeholder="No methods connected yet" value={primaryMethod?.id ?? ''} onChange={(id) => setPrimary(id)} options={methods.map((m) => ({ value: m.id, label: m.name, hint: m.detail }))} />
              </div>
              {methods.length === 0 && (
                <p className="field-hint">Connect a payout method above to choose a default.</p>
              )}
            </div>
            <div className="field">
              <label className="field-label">Payout currency</label>
              <div>
                <Select aria-label="Payout currency" value={currency} onChange={(v) => savePreferences({ currency: v }, { onSuccess: () => toast.success('Payout currency updated.') })} options={[{ value: 'KES', label: 'KES', hint: 'Kenyan Shilling' }, { value: 'USD', label: 'USD', hint: 'US Dollar' }, { value: 'EUR', label: 'EUR', hint: 'Euro' }]} />
              </div>
            </div>
          </div>
          <ToggleRow
            label="Auto-withdraw earnings"
            desc="Transfer balance to your primary method when it hits KES 5,000"
            on={autoWithdraw}
            onChange={(v) => savePreferences({ autoWithdraw: v }, { onSuccess: () => toast.success(v ? 'Auto-withdraw on.' : 'Auto-withdraw off.') })}
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
        <CollapsibleCard title="Rate card layout" collapsible={false}>
          <div style={{ display: "flex", gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
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
      <DisplayCard />
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
  const { preferences, isLoading, isError, savePreferences, isSaving } = usePreferences();
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const v = { showInDirectory: true, showBookingCount: false, shareAnalytics: false, marketing: true, ...preferences, ...(draft ?? {}) };
  const set = (k) => (val) => setDraft((d) => ({ ...(d ?? {}), [k]: val }));

  function handleSave() {
    savePreferences(draft ?? {}, {
      onSuccess: () => { setDraft(null); setSaved(true); toast.success('Privacy preferences saved.'); setTimeout(() => setSaved(false), 2000); },
    });
  }

  if (isLoading) return <div className="settings-stack"><Skeleton width="100%" height={200} /></div>;
  if (isError) return <ErrorState title="Couldn't load your privacy settings" />;

  return (
    <div className="settings-stack">
      <div className="bento-2">
        <CollapsibleCard title="Visibility" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <ToggleRow label="Show my profile in the directory" desc="Brands can find you through search and filters. Off = only people with your link can see your card." on={!!v.showInDirectory} onChange={set('showInDirectory')} />
            <div className="field-divider" />
            <ToggleRow label="Show booking count on my rate card" desc="Displays how many campaigns you've completed on Creatorske." on={!!v.showBookingCount} onChange={set('showBookingCount')} />
          </div>
        </CollapsibleCard>
        <CollapsibleCard title="Data use" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
            <ToggleRow label="Share anonymised analytics" desc="Helps us improve the platform. No personal data is shared." on={!!v.shareAnalytics} onChange={set('shareAnalytics')} />
            <div className="field-divider" />
            <ToggleRow label="Product news and tips" desc="Occasional emails about new features and how creators use them." on={!!v.marketing} onChange={set('marketing')} />
          </div>
        </CollapsibleCard>
      </div>
      <div className="bento-2">
        <DataExportCard />
        <LegalCard />
      </div>
      <SaveBar dirty={!!draft} saving={isSaving} saved={saved} onSave={handleSave} />
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
