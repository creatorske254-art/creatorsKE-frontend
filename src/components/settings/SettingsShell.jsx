import { createContext, useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { IconCheck } from '@tabler/icons-react';

/*
   The settings page shell every role shares: header, tab strip (the active
   tab lives in ?tab= so links like /brand/settings?tab=billing work and the
   browser back button steps between tabs), and the "Discard" remount trick.

   The category order is the same for every role, so people never hunt:
     Profile · Account · Notifications · <money> · [Team] · Appearance · Privacy & data
   Account owns login + security + the danger zone (what people expect
   under "Account"); money is "Payouts" for creators and "Billing" for
   brands; admins get "Platform" in the money slot and no Privacy tab.
*/

const SettingsActionsContext = createContext({ discard: () => {} });
export const useSettingsActions = () => useContext(SettingsActionsContext);

export default function SettingsShell({ title = 'Settings', subtitle, tabs, panels, defaultTab }) {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const activeTab = tabs.some((t) => t.id === requested) ? requested : (defaultTab ?? tabs[0].id);
  // Bumping this remounts the active panel, which is what makes Discard
  // genuinely revert every field to its loaded value.
  const [formEpoch, setFormEpoch] = useState(0);
  const discard = () => setFormEpoch((n) => n + 1);

  function select(id) {
    const next = new URLSearchParams(params);
    if (id === (defaultTab ?? tabs[0].id)) next.delete('tab'); else next.set('tab', id);
    setParams(next, { replace: false });
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`settings-panel-${tab.id}`}
            className={`settings-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => select(tab.id)}
          >
            <tab.icon className="icon-md" aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      <SettingsActionsContext.Provider value={{ discard }}>
        <div key={`${activeTab}-${formEpoch}`} id={`settings-panel-${activeTab}`} role="tabpanel">
          {typeof panels[activeTab] === 'function' ? panels[activeTab]() : panels[activeTab]}
        </div>
      </SettingsActionsContext.Provider>
    </div>
  );
}

/* ── Primitives shared by every settings tab ────────────────────────────── */

export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      className={`settings-toggle${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
    />
  );
}

export function ToggleRow({ label, desc, on, onChange }) {
  return (
    <div className="toggle-row">
      <div className="toggle-row-text">
        <div className="toggle-row-label">{label}</div>
        {desc && <p className="field-hint">{desc}</p>}
      </div>
      <Toggle on={on} onChange={onChange} label={label} />
    </div>
  );
}

/**
 * Sticky bar under a tab with unsaved changes. `dirty` hides it until
 * something changed (a bar that says "Unsaved changes" on a pristine form is
 * a lie); `saving` shows the button spinner; `saved` flashes the confirmation.
 */
export function SaveBar({ dirty = true, saving = false, saved = false, onSave, hint }) {
  const { discard } = useSettingsActions();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  if (!dirty && !saved) return null;

  return (
    <div className="settings-savebar">
      <span className="settings-savebar-hint">
        {saved ? (
          <span style={{ color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <IconCheck className="icon-sm" aria-hidden="true" />Changes saved
          </span>
        ) : (hint ?? 'Unsaved changes')}
      </span>
      <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
        <button className="btn btn-ghost" onClick={() => setConfirmDiscard(true)} disabled={saving}>Discard</button>
        <button className={`btn btn-primary${saving ? ' btn-loading' : ''}`} onClick={onSave} disabled={saving}>
          <IconCheck className="icon-sm" aria-hidden="true" />Save changes
        </button>
      </div>
      <ConfirmDialog
        open={confirmDiscard}
        variant="danger"
        title="Discard your changes?"
        message="Any edits you've made on this tab since it loaded will be reverted. This can't be undone."
        confirmLabel="Discard changes"
        onConfirm={() => { setConfirmDiscard(false); discard(); toast.success('Changes discarded.'); }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}

export function DangerZone({ title = 'Danger zone', description = 'These actions are permanent and cannot be undone.', children }) {
  return (
    <div className="danger-zone">
      <div className="danger-zone-title">{title}</div>
      <div className="danger-zone-desc">{description}</div>
      <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>{children}</div>
    </div>
  );
}

/** A labelled input/select/textarea. */
export function Field({ label, required, hint, htmlFor, children, error }) {
  return (
    <div className="field">
      {label && <label className={`field-label${required ? ' field-required' : ''}`} htmlFor={htmlFor}>{label}</label>}
      {children}
      {error ? <span className="field-hint error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}
