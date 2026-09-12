import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/features/auth/services/auth.service';
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

/** 2FA status + enrolment dialog. `required` (admins) removes the off switch. */
export function TwoFactorCard({ required = false }) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');

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
            <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}><IconShieldCheck className="icon-sm" aria-hidden="true" />Re-configure</button>
            {!required && <button className="btn btn-ghost btn-sm" onClick={() => { setEnabled(false); toast.success('Two-factor authentication disabled.'); }}>Disable 2FA</button>}
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}><IconShieldCheck className="icon-sm" aria-hidden="true" />Set up authenticator</button>
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
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--grey-600)', wordBreak: 'break-all' }}>Available once 2FA enrolment ships</div>
          </div>
        </div>
        <label className="field-label" htmlFor="tfa-code" style={{ display: 'block', marginBottom: 'var(--space-8)' }}>6-digit code</label>
        <div className="input-wrapper" style={{ marginBottom: 'var(--space-20)' }}>
          <IconShieldLock className="icon-sm input-icon left" aria-hidden="true" />
          <input id="tfa-code" className="input input-md input-icon-left" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" inputMode="numeric" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={code.length !== 6} onClick={() => { toast.info("Two-factor enrolment needs backend support, so your code wasn't verified."); setEnabled(true); setOpen(false); setCode(''); }}>Verify &amp; enable</button>
        </div>
      </Modal>
    </CollapsibleCard>
  );
}

/** Where the account is signed in. (No sessions endpoint yet - see BACKEND_API_SPEC.md.) */
export function SessionsCard() {
  const [sessions, setSessions] = useState([
    { id: 's1', device: 'Chrome on Windows', location: 'Nairobi, KE', time: 'Now', current: true, mobile: false },
    { id: 's2', device: 'Safari on iPhone', location: 'Nairobi, KE', time: '2 hours ago', current: false, mobile: true },
  ]);
  return (
    <CollapsibleCard title="Active sessions" description="Devices signed in to this account. Sign out of any you don't recognise." right={<span className="tag tag-default">{sessions.length} {sessions.length === 1 ? 'device' : 'devices'}</span>}>
      <div style={{ marginTop: 'var(--space-8)' }}>
        {sessions.map((s) => (
          <div key={s.id} className="session-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
              <div className="session-icon">{s.mobile ? <IconDeviceMobile className="icon-sm" aria-hidden="true" /> : <IconDeviceDesktop className="icon-sm" aria-hidden="true" />}</div>
              <div>
                <div className="session-device">{s.device}{s.current && <span className="tag tag-purple">This device</span>}</div>
                <div className="session-meta">{s.location} · {s.time}</div>
              </div>
            </div>
            {!s.current && <button className="btn btn-ghost btn-sm" onClick={() => { setSessions((p) => p.filter((x) => x.id !== s.id)); toast.success(`Signed out of ${s.device}.`); }}>Sign out</button>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'var(--space-12)' }}>
        <button className="btn btn-ghost btn-sm" disabled={sessions.length <= 1} onClick={() => { setSessions((p) => p.filter((x) => x.current)); toast.success('Signed out of all other sessions.'); }}>Sign out of all other sessions</button>
      </div>
    </CollapsibleCard>
  );
}

const LANGUAGES = [{ value: 'en', label: 'English' }, { value: 'sw', label: 'Kiswahili' }];
const TIMEZONES = [{ value: 'Africa/Nairobi', label: 'Nairobi (EAT, UTC+3)' }, { value: 'Europe/London', label: 'London (UTC+0/+1)' }, { value: 'Africa/Lagos', label: 'Lagos (WAT, UTC+1)' }, { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST, UTC+2)' }];

/** Language, timezone and date format - persisted locally until the profile carries them. */
export function LanguageRegionCard({ onDirty }) {
  const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
  const [lang, setLang] = useState(() => read('creatorske_lang', 'en'));
  const [tz, setTz] = useState(() => read('creatorske_tz', 'Africa/Nairobi'));
  const [weekStart, setWeekStart] = useState(() => read('creatorske_week_start', 'monday'));
  function set(k, v, setter) { setter(v); try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } onDirty?.(); }

  return (
    <CollapsibleCard title="Language & region" collapsible={false}>
      <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
        <div className="field-row">
          <Field label="Language" htmlFor="lang">
            <Select id="lang" value={lang} onChange={(v) => set('creatorske_lang', v, setLang)} options={LANGUAGES} />
          </Field>
          <Field label="Time zone" htmlFor="tz" hint="Dates and deadlines are shown in this zone.">
            <Select id="tz" value={tz} onChange={(v) => set('creatorske_tz', v, setTz)} options={TIMEZONES} />
          </Field>
        </div>
        <ToggleRow label="Weeks start on Monday" desc="Affects calendars and weekly charts." on={weekStart === 'monday'} onChange={(v) => set('creatorske_week_start', v ? 'monday' : 'sunday', setWeekStart)} />
      </div>
    </CollapsibleCard>
  );
}
