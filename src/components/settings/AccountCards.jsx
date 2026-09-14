import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/features/auth/services/auth.service';
import { usePreferences } from '@/features/auth/hooks/useProfile';
import { formatRelativeDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import Modal from '@/components/ui/Modal';
import { ToggleRow, Field } from './SettingsShell';
import { IconCheck, IconDeviceDesktop, IconDeviceMobile, IconLock, IconMail, IconQrcode, IconShieldCheck, IconShieldLock } from '@tabler/icons-react';
import Select from '@/components/ui/Select';

/*
   The cards every role's Account tab is made of. Same components on the
   creator, brand and admin pages, so login, password, 2FA, sessions and
   language behave identically everywhere - only the danger zone differs
   per role and stays in each page.
*/

/** Login email (PATCH /users/profile) + change password (POST /users/change-password). */
export function LoginDetailsCard({ collapsible = true }) {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const emailDirty = email.trim() !== (user?.email ?? '');
  const pwError = pw.next && pw.next.length < 8 ? 'At least 8 characters.' : pw.confirm && pw.confirm !== pw.next ? "Passwords don't match." : null;
  const pwReady = pw.current && pw.next.length >= 8 && pw.next === pw.confirm;

  async function saveEmail() {
    setSavingEmail(true);
    try {
      const updated = await userService.updateProfile({ email: email.trim() });
      updateUser?.({ ...(updated ?? {}), email: email.trim() });
      toast.success('Email updated. We sent a confirmation to the new address.');
    } catch (err) {
      toast.error(err?.message || 'Could not update your email.');
    } finally { setSavingEmail(false); }
  }

  async function savePassword() {
    setSavingPw(true);
    try {
      await userService.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 4000);
      toast.success('Password updated.');
    } catch (err) {
      toast.error(err?.message || 'Could not update your password. Check your current password.');
    } finally { setSavingPw(false); }
  }

  return (
    <CollapsibleCard title="Login details" description="The email you sign in with, and your password." collapsible={collapsible} defaultOpen={!collapsible}>
      <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
        <Field label="Email address" required htmlFor="acct-email" hint="Used to sign in and for every notification.">
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <IconMail className="icon-sm input-icon left" aria-hidden="true" />
              <input id="acct-email" className="input input-md input-icon-left" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            {emailDirty && <button className={`btn btn-primary btn-sm${savingEmail ? ' btn-loading' : ''}`} onClick={saveEmail} disabled={savingEmail || !email.includes('@')}>Update</button>}
          </div>
        </Field>
        <div className="field-divider" />
        {pwSaved ? (
          <div className="success-banner"><IconCheck className="icon-sm" aria-hidden="true" />Password updated.</div>
        ) : (
          <>
            <Field label="Current password" required htmlFor="acct-pw-current">
              <div className="input-wrapper"><IconLock className="icon-sm input-icon left" aria-hidden="true" /><input id="acct-pw-current" className="input input-md input-icon-left" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw((f) => ({ ...f, current: e.target.value }))} placeholder="Your current password" /></div>
            </Field>
            <div className="field-row">
              <Field label="New password" required htmlFor="acct-pw-next" error={pw.next && pw.next.length < 8 ? pwError : null}>
                <div className="input-wrapper"><IconLock className="icon-sm input-icon left" aria-hidden="true" /><input id="acct-pw-next" className="input input-md input-icon-left" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw((f) => ({ ...f, next: e.target.value }))} placeholder="At least 8 characters" /></div>
              </Field>
              <Field label="Confirm new password" required htmlFor="acct-pw-confirm" error={pw.confirm && pw.confirm !== pw.next ? pwError : null}>
                <div className="input-wrapper"><IconLock className="icon-sm input-icon left" aria-hidden="true" /><input id="acct-pw-confirm" className="input input-md input-icon-left" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((f) => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter your new password" /></div>
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className={`btn btn-primary btn-sm${savingPw ? ' btn-loading' : ''}`} onClick={savePassword} disabled={!pwReady || savingPw}>Update password</button>
            </div>
          </>
        )}
      </div>
    </CollapsibleCard>
  );
}

/** 2FA status + enrolment dialog (POST /users/2fa/setup|verify, DELETE /users/2fa). `required` (admins) removes the off switch. */
export function TwoFactorCard({ required = false }) {
  const { user, updateUser } = useAuth();
  const [enabled, setEnabled] = useState(!!user?.twoFactorEnabled);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [setup, setSetup] = useState(null);
  const [busy, setBusy] = useState(false);

  async function beginSetup() {
    setOpen(true); setCode(''); setSetup(null);
    try { setSetup(await userService.setup2fa()); }
    catch (err) { toast.error(err?.message || 'Could not start two-factor setup.'); setOpen(false); }
  }
  async function verify() {
    setBusy(true);
    try {
      await userService.verify2fa(code);
      setEnabled(true); updateUser?.({ twoFactorEnabled: true });
      setOpen(false); setCode('');
      toast.success('Two-factor authentication enabled.');
    } catch (err) { toast.error(err?.message || 'That code did not match. Try again.'); }
    finally { setBusy(false); }
  }
  async function disable() {
    setBusy(true);
    try {
      await userService.disable2fa();
      setEnabled(false); updateUser?.({ twoFactorEnabled: false });
      toast.success('Two-factor authentication disabled.');
    } catch (err) { toast.error(err?.message || 'Could not disable two-factor authentication.'); }
    finally { setBusy(false); }
  }

  return (
    <CollapsibleCard
      title="Two-factor authentication"
      collapsible={false}
      right={<span className={`tag ${enabled ? 'tag-success' : required ? 'tag-error' : 'tag-warning'}`}>{enabled ? 'Enabled' : required ? 'Required' : 'Not enabled'}</span>}
    >
      <span className="field-hint">{required ? 'Every admin account must use an authenticator app. Sign-in is blocked until it is set up.' : 'A 6-digit code from an authenticator app, asked for at every sign-in.'}</span>
      <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-16)', flexWrap: 'wrap' }}>
        {enabled ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={beginSetup}><IconShieldCheck className="icon-sm" aria-hidden="true" />Re-configure</button>
            {!required && <button className={`btn btn-ghost btn-sm${busy ? ' btn-loading' : ''}`} disabled={busy} onClick={disable}>Disable 2FA</button>}
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={beginSetup}><IconShieldCheck className="icon-sm" aria-hidden="true" />Set up authenticator</button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Set up authenticator app" size="sm">
        <ol style={{ fontSize: 13.5, color: 'var(--grey-600)', lineHeight: 1.75, paddingLeft: 'var(--space-20)', marginBottom: 'var(--space-16)' }}>
          <li>Install an authenticator app (Google Authenticator, Authy, 1Password).</li>
          <li>Scan the QR code below, or enter the setup key manually.</li>
          <li>Enter the 6-digit code the app shows to finish.</li>
        </ol>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', padding: 'var(--space-16)', background: 'var(--page-bg)', border: '0.5px solid var(--grey-100)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-16)' }}>
          <div style={{ width: 92, height: 92, borderRadius: 'var(--radius-md)', background: 'var(--white)', border: '0.5px solid var(--grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey-300)', flexShrink: 0 }}>
            <IconQrcode className="icon-xl" aria-hidden="true" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="field-label" style={{ marginBottom: 'var(--space-4)' }}>Setup key</div>
            {setup ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--grey-600)', wordBreak: 'break-all' }}>{setup.secret}</div>
            ) : (
              <Skeleton width={160} height={14} />
            )}
          </div>
        </div>
        <label className="field-label" htmlFor="tfa-code" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>6-digit code</label>
        <div className="input-wrapper" style={{ marginBottom: 'var(--space-20)' }}>
          <IconShieldLock className="icon-sm input-icon left" aria-hidden="true" />
          <input id="tfa-code" className="input input-md input-icon-left" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Cancel</button>
          <button className={`btn btn-primary btn-sm${busy ? ' btn-loading' : ''}`} disabled={code.length !== 6 || busy || !setup} onClick={verify}>Verify &amp; enable</button>
        </div>
      </Modal>
    </CollapsibleCard>
  );
}

const SESSIONS_KEY = ['user', 'sessions'];

/** Where the account is signed in (GET /users/sessions, DELETE /users/sessions/:id|others). */
export function SessionsCard() {
  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading, isError } = useQuery({ queryKey: SESSIONS_KEY, queryFn: userService.listSessions });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });

  const revoke = useMutation({
    mutationFn: (s) => userService.revokeSession(s.id),
    onSuccess: (_d, s) => { invalidate(); toast.success(`Signed out of ${s.device}.`); },
    onError: (err) => toast.error(err?.message || 'Could not sign out of that device.'),
  });
  const revokeOthers = useMutation({
    mutationFn: userService.revokeOtherSessions,
    onSuccess: () => { invalidate(); toast.success('Signed out of all other sessions.'); },
    onError: (err) => toast.error(err?.message || 'Could not sign out of other sessions.'),
  });

  const when = (s) => s.current ? 'Now' : s.lastActiveAt ? formatRelativeDate(s.lastActiveAt) : (s.time ?? '');

  return (
    <CollapsibleCard title="Active sessions" description="Devices signed in to this account. Sign out of any you don't recognise." right={<span className="tag tag-default">{sessions.length} {sessions.length === 1 ? 'device' : 'devices'}</span>}>
      <div style={{ marginTop: 'var(--space-8)' }}>
        {isLoading && <Skeleton width="100%" height={56} />}
        {isError && <p className="field-hint">Couldn't load your sessions.</p>}
        {sessions.map((s) => (
          <div key={s.id} className="session-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
              <div className="session-icon">{s.mobile ? <IconDeviceMobile className="icon-sm" aria-hidden="true" /> : <IconDeviceDesktop className="icon-sm" aria-hidden="true" />}</div>
              <div>
                <div className="session-device">{s.device}{s.current && <span className="tag tag-purple">This device</span>}</div>
                <div className="session-meta">{s.location} · {when(s)}</div>
              </div>
            </div>
            {!s.current && <button className="btn btn-ghost btn-sm" disabled={revoke.isPending} onClick={() => revoke.mutate(s)}>Sign out</button>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'var(--space-12)' }}>
        <button className={`btn btn-ghost btn-sm${revokeOthers.isPending ? ' btn-loading' : ''}`} disabled={sessions.length <= 1 || revokeOthers.isPending} onClick={() => revokeOthers.mutate()}>Sign out of all other sessions</button>
      </div>
    </CollapsibleCard>
  );
}

const LANGUAGES = [{ value: 'en', label: 'English' }, { value: 'sw', label: 'Kiswahili' }];
const TIMEZONES = [{ value: 'Africa/Nairobi', label: 'Nairobi (EAT, UTC+3)' }, { value: 'Europe/London', label: 'London (UTC+0/+1)' }, { value: 'Africa/Lagos', label: 'Lagos (WAT, UTC+1)' }, { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST, UTC+2)' }];

/** Language, timezone and week start, saved to the account's preferences. */
export function LanguageRegionCard({ onDirty }) {
  const { preferences, savePreferences } = usePreferences();
  const lang = preferences.language ?? 'en';
  const tz = preferences.timezone ?? 'Africa/Nairobi';
  const weekStart = preferences.weekStart ?? 'monday';
  function set(patch) { savePreferences(patch, { onSuccess: () => toast.success('Preference saved.') }); onDirty?.(); }

  return (
    <CollapsibleCard title="Language & region" collapsible={false}>
      <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
        <div className="field-row">
          <Field label="Language" htmlFor="lang">
            <Select id="lang" value={lang} onChange={(v) => set({ language: v })} options={LANGUAGES} />
          </Field>
          <Field label="Time zone" htmlFor="tz" hint="Dates and deadlines are shown in this zone.">
            <Select id="tz" value={tz} onChange={(v) => set({ timezone: v })} options={TIMEZONES} />
          </Field>
        </div>
        <ToggleRow label="Weeks start on Monday" desc="Affects calendars and weekly charts." on={weekStart === 'monday'} onChange={(v) => set({ weekStart: v ? 'monday' : 'sunday' })} />
      </div>
    </CollapsibleCard>
  );
}
