import { useState } from 'react';
import { toast } from 'sonner';
import { userService } from '@/features/auth/services/auth.service';
import { useTheme } from '@/context/ThemeContext';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import { ToggleRow } from './SettingsShell';
import { IconDeviceLaptop, IconDownload, IconExternalLink, IconMoon, IconSun } from '@tabler/icons-react';

/* Appearance and Privacy & data cards, shared by every role. */

export const ACCENT_COLORS = [
  { hex: '#534AB7', label: 'Purple' },
  { hex: '#0D0D0C', label: 'Ink' },
  { hex: '#0F6E56', label: 'Forest' },
  { hex: '#854F0B', label: 'Amber' },
  { hex: '#185FA5', label: 'Ocean' },
  { hex: '#993556', label: 'Rose' },
  { hex: '#993C1D', label: 'Rust' },
];

/** Light / dark / system - applied instantly by ThemeContext and persisted. */
export function ThemeCard() {
  const { theme, setTheme } = useTheme();
  return (
    <CollapsibleCard title="Interface theme" collapsible={false}>
      <div className="bento-3" style={{ marginTop: 'var(--space-16)' }}>
        {[['light', 'Light', IconSun], ['dark', 'Dark', IconMoon], ['system', 'Match system', IconDeviceLaptop]].map(([t, label, Icon]) => (
          <button key={t} type="button" onClick={() => setTheme(t)} aria-pressed={theme === t} className={`option-card${theme === t ? ' selected' : ''}`} style={{ padding: 'var(--space-16) var(--space-8)' }}>
            <Icon className="icon-md" aria-hidden="true" />
            <span className="option-card-label">{label}</span>
          </button>
        ))}
      </div>
    </CollapsibleCard>
  );
}

export function AccentCard({ hint = 'Applied to buttons, links and highlights.' }) {
  const { accent, setAccent } = useTheme();
  return (
    <CollapsibleCard title="Accent colour" collapsible={false}>
      <p className="field-hint" style={{ marginBottom: 'var(--space-16)' }}>{hint}</p>
      <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
        {ACCENT_COLORS.map(({ hex, label }) => (
          <div key={hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button type="button" className={`accent-swatch${accent === hex ? ' selected' : ''}`} style={{ background: hex, border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => setAccent(hex)} title={label} aria-label={`Use ${label} accent`} aria-pressed={accent === hex} />
            <span style={{ fontSize: 10, color: 'var(--grey-400)' }}>{label}</span>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}

/** Density + motion - the two accessibility preferences people look for under Appearance. */
export function DisplayCard() {
  const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
  const [reduceMotion, setReduceMotion] = useState(() => read('creatorske_reduce_motion', '0') === '1');
  const [compact, setCompact] = useState(() => read('creatorske_compact', '0') === '1');
  function apply(k, v, setter, cls) {
    setter(v);
    try { localStorage.setItem(k, v ? '1' : '0'); } catch { /* storage unavailable */ }
    document.documentElement.classList.toggle(cls, v);
  }
  return (
    <CollapsibleCard title="Display" collapsible={false}>
      <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
        <ToggleRow label="Compact tables" desc="Tighter rows in lists and tables." on={compact} onChange={(v) => apply('creatorske_compact', v, setCompact, 'density-compact')} />
        <div className="field-divider" />
        <ToggleRow label="Reduce motion" desc="Turns off page and chart animations." on={reduceMotion} onChange={(v) => apply('creatorske_reduce_motion', v, setReduceMotion, 'reduce-motion')} />
      </div>
    </CollapsibleCard>
  );
}

/** Request a copy of everything the platform holds on the account (POST /users/export). */
export function DataExportCard({ description }) {
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  async function request() {
    setBusy(true);
    try {
      await userService.requestExport();
      setRequested(true);
      toast.success('Export requested. Watch your inbox for the download link.');
    } catch (err) { toast.error(err?.message || 'Could not request your export.'); }
    finally { setBusy(false); }
  }
  return (
    <CollapsibleCard title="Your data" collapsible={false}>
      <p className="field-hint" style={{ marginBottom: 'var(--space-16)' }}>{description ?? 'Download a copy of your profile, messages, bookings and transactions as a ZIP of JSON and CSV files. We email you a link within 24 hours.'}</p>
      <button className={`btn btn-secondary btn-sm${busy ? ' btn-loading' : ''}`} disabled={requested || busy} onClick={request}>
        <IconDownload className="icon-sm" aria-hidden="true" />{requested ? 'Export requested' : 'Request a data export'}
      </button>
    </CollapsibleCard>
  );
}

export function LegalCard() {
  return (
    <CollapsibleCard title="Legal" collapsible={false}>
      <div className="settings-stack" style={{ gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
        {[{ label: 'Terms of Service', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }].map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="legal-row">
            {l.label}<IconExternalLink className="icon-sm" aria-hidden="true" />
          </a>
        ))}
      </div>
    </CollapsibleCard>
  );
}
