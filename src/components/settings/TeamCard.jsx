import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { getInitials } from '@/lib/utils';
import { Field } from './SettingsShell';
import { IconMail, IconUserPlus, IconDotsVertical } from '@tabler/icons-react';
import Select from '@/components/ui/Select';

/*
   Members of a shared account (a brand's marketing team, the admin staff).
   Roles are passed in so the same card serves both: the brand gets
   owner / admin / member / finance, admins get super admin / moderator /
   finance / support. `onInvite(email, role)` and `onRemove(id)` are the
   role's own service seams; the member list is seeded from `members` and
   kept locally until the endpoint exists.
*/
export function TeamCard({ title = 'Team members', members: initial = [], roles, onInvite, onRemove, inviting = false, description }) {
  const { user } = useAuth();
  const [members, setMembers] = useState(initial);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[Math.min(1, roles.length - 1)].id);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [menuFor, setMenuFor] = useState(null);

  function submitInvite() {
    const clean = email.trim().toLowerCase();
    if (!clean.includes('@')) return;
    onInvite?.(clean, role);
    setMembers((m) => [...m, { id: `inv_${Date.now()}`, name: clean.split('@')[0], email: clean, role, status: 'invited' }]);
    setInviteOpen(false); setEmail('');
  }
  function changeRole(id, next) {
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, role: next } : x)));
    setMenuFor(null);
    toast.success(`Role updated to ${roles.find((r) => r.id === next)?.label ?? next}.`);
  }
  function remove() {
    onRemove?.(removeTarget.id);
    setMembers((m) => m.filter((x) => x.id !== removeTarget.id));
    toast.success(removeTarget.status === 'invited' ? 'Invitation withdrawn.' : `${removeTarget.name} removed.`);
    setRemoveTarget(null);
  }

  return (
    <CollapsibleCard
      title={title}
      collapsible={false}
      right={<button className="btn btn-primary btn-sm" onClick={() => setInviteOpen(true)}><IconUserPlus className="icon-sm" aria-hidden="true" />Invite</button>}
    >
      {description && <p className="field-hint" style={{ marginBottom: 'var(--space-8)' }}>{description}</p>}
      <div>
        {members.map((m) => {
          const r = roles.find((x) => x.id === m.role);
          const isSelf = m.email && m.email === user?.email;
          return (
            <div key={m.id} className="session-row" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', minWidth: 0 }}>
                <div className={`avatar avatar-md ${m.status === 'invited' ? 'avatar-grey' : 'avatar-purple'}`}>{getInitials(m.name || m.email)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="session-device" style={{ flexWrap: 'wrap' }}>
                    {m.name}{isSelf && <span className="tag tag-purple">You</span>}{m.status === 'invited' && <span className="tag tag-warning">Invited</span>}
                  </div>
                  <div className="session-meta">{m.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexShrink: 0 }}>
                <span className="tag tag-default">{r?.label ?? m.role}</span>
                {!isSelf && m.role !== 'owner' && (
                  <button className="btn btn-ghost btn-square btn-xs" aria-label={`Actions for ${m.name}`} aria-haspopup="menu" aria-expanded={menuFor === m.id} onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}>
                    <IconDotsVertical className="icon-sm" aria-hidden="true" />
                  </button>
                )}
              </div>
              {menuFor === m.id && (
                <div role="menu" className="menu-popover" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20 }}>
                  {roles.filter((x) => x.id !== 'owner').map((x) => (
                    <button key={x.id} role="menuitemradio" aria-checked={m.role === x.id} className="menu-item" onClick={() => changeRole(m.id, x.id)}>
                      <span>{x.label}</span><span className="menu-item__hint">{x.hint}</span>
                    </button>
                  ))}
                  <div className="menu-divider" />
                  <button role="menuitem" className="menu-item menu-item--danger" onClick={() => { setMenuFor(null); setRemoveTarget(m); }}>{m.status === 'invited' ? 'Withdraw invitation' : 'Remove from team'}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a team member" size="sm">
        <div className="settings-stack" style={{ gap: 'var(--space-16)' }}>
          <Field label="Email address" required htmlFor="invite-email" hint="They get an email with a link to join this account.">
            <div className="input-wrapper"><IconMail className="icon-sm input-icon left" aria-hidden="true" /><input id="invite-email" className="input input-md input-icon-left" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" autoFocus /></div>
          </Field>
          <Field label="Role" htmlFor="invite-role">
            <Select id="invite-role" value={role} onChange={setRole} options={roles.filter((x) => x.id !== 'owner').map((x) => ({ value: x.id, label: x.label, hint: x.hint }))} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setInviteOpen(false)}>Cancel</button>
            <button className={`btn btn-primary btn-sm${inviting ? ' btn-loading' : ''}`} disabled={!email.includes('@') || inviting} onClick={submitInvite}><IconUserPlus className="icon-sm" aria-hidden="true" />Send invite</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        variant="danger"
        title={removeTarget?.status === 'invited' ? 'Withdraw this invitation?' : `Remove ${removeTarget?.name}?`}
        message={removeTarget?.status === 'invited' ? `${removeTarget?.email} will no longer be able to join with this link.` : `${removeTarget?.name} loses access to this account immediately. You can invite them again later.`}
        confirmLabel={removeTarget?.status === 'invited' ? 'Withdraw' : 'Remove'}
        onConfirm={remove}
        onCancel={() => setRemoveTarget(null)}
      />
    </CollapsibleCard>
  );
}
