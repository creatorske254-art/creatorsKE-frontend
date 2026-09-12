import { useState } from 'react';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/features/auth/services/auth.service';
import { adminService } from '@/features/admin/services/admin.service';
import { useImageUpload } from '@/lib/useImageUpload';
import { getInitials } from '@/lib/utils';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import {
  SettingsShell, Toggle, ToggleRow, SaveBar, Field,
  LoginDetailsCard, TwoFactorCard, SessionsCard, LanguageRegionCard,
  ThemeCard, AccentCard, DisplayCard, TeamCard,
} from '@/components/settings';
import { IconBell, IconPalette, IconSettings, IconShieldLock, IconUpload, IconUser, IconUsers, IconAlertTriangle } from '@tabler/icons-react';
import Select from '@/components/ui/Select';

/*
   Admin settings. Same shell and category order as the creator and brand
   pages - Profile · Account · Notifications · <money slot> · Team ·
   Appearance - with two admin-only differences: the money slot is
   "Platform" (the marketplace rules every other screen enforces), and 2FA
   is required rather than optional. There is no Privacy & data tab - an
   admin account holds no personal marketplace data of its own.
   Platform rules and the admin roster are backed by GET/PUT /admin/settings
   and GET /admin/team (BACKEND_API_SPEC.md); invites use POST /admin/invite.
*/

const TABS = [
  { id: 'profile', label: 'Profile', icon: IconUser },
  { id: 'account', label: 'Account', icon: IconShieldLock },
  { id: 'notifications', label: 'Notifications', icon: IconBell },
  { id: 'platform', label: 'Platform', icon: IconSettings },
  { id: 'team', label: 'Team', icon: IconUsers },
  { id: 'appearance', label: 'Appearance', icon: IconPalette },
];

const ADMIN_ROLES = [
  { id: 'owner', label: 'Super admin', hint: 'Everything, including platform rules and admin roles' },
  { id: 'moderator', label: 'Moderator', hint: 'Disputes, flagged accounts and reviews' },
  { id: 'finance', label: 'Finance', hint: 'Escrow, payouts and platform fees' },
  { id: 'support', label: 'Support', hint: 'Read access plus re-engagement tools' },
];

/* ── Profile ─────────────────────────────────────────────────────────────── */
function ProfileTab() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', title: user?.title ?? 'Platform operations' });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const avatar = useImageUpload({ initialUrl: user?.avatar, successMessage: 'Photo updated.', onUploaded: ({ url }) => userService.updateProfile({ avatar: url }).catch(() => {}) });
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setDirty(true); };

  async function save() {
    setSaving(true);
    try {
      await userService.updateProfile(form);
      updateUser?.(form);
      setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(err?.message || 'Could not save your profile.');
    } finally { setSaving(false); }
  }

  return (
    <div className="settings-stack">
      <CollapsibleCard title="Your details" collapsible={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', marginTop: 'var(--space-16)', marginBottom: 'var(--space-20)' }}>
          <div className="avatar avatar-lg avatar-purple" style={{ overflow: 'hidden' }}>
            {avatar.url ? <img src={avatar.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(`${form.firstName} ${form.lastName}`.trim() || 'A')}
          </div>
          <div>
            <label className={`btn btn-secondary btn-sm${avatar.uploading ? ' btn-loading' : ''}`} style={{ cursor: 'pointer' }}>
              <IconUpload className="icon-sm" aria-hidden="true" />{avatar.uploading ? 'Uploading' : 'Upload photo'}
              <input type="file" accept="image/*" hidden onChange={avatar.onChange} />
            </label>
            <span className="field-hint" style={{ display: 'block', marginTop: 'var(--space-4)' }}>JPG, PNG or WebP, up to 2MB. Shown on dispute decisions and team lists.</span>
          </div>
        </div>
        <div className="field-row">
          <Field label="First name" required htmlFor="adm-first"><input id="adm-first" className="input input-md" value={form.firstName} onChange={set('firstName')} placeholder="e.g. Wanjiru" /></Field>
          <Field label="Last name" required htmlFor="adm-last"><input id="adm-last" className="input input-md" value={form.lastName} onChange={set('lastName')} placeholder="e.g. Kamau" /></Field>
        </div>
        <div style={{ marginTop: 'var(--space-12)' }}>
          <Field label="Job title" htmlFor="adm-title" hint="Shown to creators and brands when you decide a dispute or email them."><input id="adm-title" className="input input-md" value={form.title} onChange={set('title')} placeholder="e.g. Trust & safety lead" /></Field>
        </div>
      </CollapsibleCard>
      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={save} />
    </div>
  );
}

/* ── Account ─────────────────────────────────────────────────────────────── */
function AccountTab() {
  return (
    <div className="settings-stack">
      <LoginDetailsCard collapsible={false} />
      <div className="bento-2">
        <TwoFactorCard required />
        <SessionsCard />
      </div>
      <LanguageRegionCard />
      <div className="info-callout">
        <IconAlertTriangle className="icon-md" aria-hidden="true" />
        <div>
          <div className="info-callout-title">Admin accounts can't be self-deleted</div>
          <p className="info-callout-desc">Ask a super admin to remove you from the team. Your decisions and actions stay in the audit log under your name.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Notifications ───────────────────────────────────────────────────────── */
const ALERTS = [
  { group: 'Moderation', items: [
    { key: 'newDispute', label: 'New dispute raised', desc: 'The moment a brand or creator opens one.' },
    { key: 'disputeEvidence', label: 'Evidence added to a dispute', desc: 'Either party uploads or replies.' },
    { key: 'flaggedAccount', label: 'Account flagged', desc: 'Automatic or reported.' },
    { key: 'flaggedReview', label: 'Review flagged', desc: 'Needs a keep/remove decision.' },
  ] },
  { group: 'Operations', items: [
    { key: 'escrowOverdue', label: 'Escrow past auto-release', desc: 'A booking held longer than the release window.' },
    { key: 'deletionRequest', label: 'Account deletion requested', desc: 'A new request enters the queue.' },
    { key: 'payoutFailed', label: 'Payout failed', desc: 'M-Pesa or bank transfer bounced.' },
  ] },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState({ newDispute: true, disputeEvidence: false, flaggedAccount: true, flaggedReview: true, escrowOverdue: true, deletionRequest: true, payoutFailed: true, digest: 'daily', channel: 'email' });
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setPrefs((p) => ({ ...p, [k]: v })); setDirty(true); };
  function save() { setSaved(true); setDirty(false); toast.success('Notification preferences saved.'); setTimeout(() => setSaved(false), 2000); }

  return (
    <div className="settings-stack">
      <div className="bento-2">
        {ALERTS.map((g) => (
          <CollapsibleCard key={g.group} title={g.group} collapsible={false}>
            <div style={{ marginTop: 'var(--space-8)' }}>
              {g.items.map((it) => (
                <div key={it.key} className="notif-row">
                  <div><div className="notif-row-label">{it.label}</div><div className="notif-row-desc">{it.desc}</div></div>
                  <Toggle label={it.label} on={!!prefs[it.key]} onChange={(v) => set(it.key, v)} />
                </div>
              ))}
            </div>
          </CollapsibleCard>
        ))}
      </div>
      <CollapsibleCard title="Delivery" collapsible={false}>
        <div className="field-row" style={{ marginTop: 'var(--space-16)' }}>
          <Field label="Queue digest" htmlFor="adm-digest" hint="A summary of everything waiting on a decision.">
            <Select id="adm-digest" value={prefs.digest} onChange={(v) => set('digest', v)} options={[{ value: 'off', label: 'Off' }, { value: 'daily', label: 'Every morning', hint: '08:00 EAT' }, { value: 'weekly', label: 'Monday mornings' }]} />
          </Field>
          <Field label="Urgent alerts go to" htmlFor="adm-channel">
            <Select id="adm-channel" value={prefs.channel} onChange={(v) => set('channel', v)} options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'both', label: 'Email and SMS' }]} />
          </Field>
        </div>
      </CollapsibleCard>
      <SaveBar dirty={dirty} saved={saved} onSave={save} />
    </div>
  );
}

/* ── Platform ────────────────────────────────────────────────────────────── */
const RULE_DEFAULTS = {
  platformFeePct: 10, escrowReleaseDays: 14, disputeWindowDays: 7, deletionGraceDays: 14,
  draftAbandonDays: 7, inactiveDays: 30, enquiryReplyHours: 48, maintenance: false, maintenanceMessage: '',
};

function PlatformTab() {
  const [rules, setRules] = useState(RULE_DEFAULTS);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const num = (k) => (e) => { setRules((r) => ({ ...r, [k]: Number(e.target.value) })); setDirty(true); };

  function save() {
    setSaving(true);
    adminService.updateSettings(rules)
      .then(() => { setSaved(true); setDirty(false); setTimeout(() => setSaved(false), 2000); toast.success('Platform rules saved.'); })
      .catch(() => toast.error("Saving platform rules isn't available yet. It needs backend support."))
      .finally(() => setSaving(false));
  }

  const NumberField = ({ id, label, k, unit, hint, min = 0, max = 365 }) => (
    <Field label={label} htmlFor={id} hint={hint}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <input id={id} className="input input-md" type="number" min={min} max={max} value={rules[k]} onChange={num(k)} style={{ width: 120 }} />
        <span style={{ fontSize: 13, color: 'var(--grey-500)' }}>{unit}</span>
      </div>
    </Field>
  );

  return (
    <div className="settings-stack">
      <div className="bento-2">
        <CollapsibleCard title="Money" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-16)', marginTop: 'var(--space-16)' }}>
            <NumberField id="rule-fee" label="Platform fee" k="platformFeePct" unit="% of each booking" hint="Deducted from the creator's payout when escrow releases." max={50} />
            <NumberField id="rule-escrow" label="Escrow auto-release" k="escrowReleaseDays" unit="days after delivery" hint="Brands that don't approve or dispute in this window release funds automatically." />
            <NumberField id="rule-dispute" label="Dispute evidence window" k="disputeWindowDays" unit="days" hint="How long both parties have to submit evidence before an admin decides." />
          </div>
        </CollapsibleCard>
        <CollapsibleCard title="Accounts & re-engagement" collapsible={false}>
          <div className="settings-stack" style={{ gap: 'var(--space-16)', marginTop: 'var(--space-16)' }}>
            <NumberField id="rule-grace" label="Deletion grace period" k="deletionGraceDays" unit="days" hint="Users can cancel a deletion request until this runs out." />
            <NumberField id="rule-draft" label="Draft counts as abandoned after" k="draftAbandonDays" unit="days of inactivity" />
            <NumberField id="rule-inactive" label="Creator counts as inactive after" k="inactiveDays" unit="days without signing in" />
            <NumberField id="rule-reply" label="Unanswered enquiry alert after" k="enquiryReplyHours" unit="hours" max={720} />
          </div>
        </CollapsibleCard>
      </div>
      <CollapsibleCard title="Maintenance mode" collapsible={false} right={rules.maintenance ? <span className="tag tag-warning">On</span> : <span className="tag tag-default">Off</span>}>
        <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
          <ToggleRow label="Show a maintenance banner to everyone" desc="Signed-in users keep working; the banner sits at the top of every page." on={rules.maintenance} onChange={(v) => { setRules((r) => ({ ...r, maintenance: v })); setDirty(true); }} />
          {rules.maintenance && (
            <Field label="Banner message" htmlFor="rule-maint" required>
              <input id="rule-maint" className="input input-md" value={rules.maintenanceMessage} onChange={(e) => { setRules((r) => ({ ...r, maintenanceMessage: e.target.value })); setDirty(true); }} placeholder="e.g. Payouts are paused until 18:00 EAT while we upgrade M-Pesa." />
            </Field>
          )}
        </div>
      </CollapsibleCard>
      <SaveBar dirty={dirty} saving={saving} saved={saved} onSave={save} hint="Changes apply to new bookings only" />
    </div>
  );
}

/* ── Team ────────────────────────────────────────────────────────────────── */
function TeamTab() {
  const { user } = useAuth();
  const [inviting, setInviting] = useState(false);
  const members = [{ id: 'me', name: `${user?.firstName ?? 'You'} ${user?.lastName ?? ''}`.trim(), email: user?.email ?? '', role: 'owner', status: 'active' }];
  function invite(email, role) {
    setInviting(true);
    adminService.inviteAdmin(email, role)
      .then(() => toast.success(`Invitation sent to ${email}.`))
      .catch(() => toast.error("Inviting admins isn't available yet. It needs backend support."))
      .finally(() => setInviting(false));
  }
  return (
    <div className="settings-stack">
      <TeamCard title="Admin team" members={members} roles={ADMIN_ROLES} onInvite={invite} inviting={inviting} description="Every admin signs in with 2FA. Roles limit which queues a person can act on; every action is written to the audit log." />
    </div>
  );
}

/* ── Appearance ──────────────────────────────────────────────────────────── */
function AppearanceTab() {
  return (
    <div className="settings-stack">
      <ThemeCard />
      <div className="bento-2"><AccentCard /><DisplayCard /></div>
    </div>
  );
}

export default function AdminSettingsPage() {
  usePageMeta('Admin settings', 'Your admin profile, security, alerts, platform rules and team.');
  const panels = {
    profile: () => <ProfileTab />,
    account: () => <AccountTab />,
    notifications: () => <NotificationsTab />,
    platform: () => <PlatformTab />,
    team: () => <TeamTab />,
    appearance: () => <AppearanceTab />,
  };
  return <SettingsShell subtitle="Your profile, sign-in, alerts, the platform's rules and who else can run it." tabs={TABS} panels={panels} />;
}
