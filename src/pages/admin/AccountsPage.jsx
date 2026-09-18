import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePageMeta } from '@/lib/usePageMeta'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useFlaggedAccounts } from '@/features/admin/hooks/useFlaggedAccounts'
import { useAccounts } from '@/features/admin/hooks/useAccounts'
import { formatDate } from '@/lib/utils'
import { IconBan, IconChevronRight, IconCircleCheck, IconFlag, IconRotate, IconSearch, IconShieldCheck, IconShieldX, IconUsers, IconX } from '@tabler/icons-react';

// Two views: the moderation queue (GET /admin/accounts/flagged) and every
// account on the platform (GET /admin/accounts?q=). Actions post to
// POST /admin/accounts/:id/action in both.
function normalizeAccount(a) {
  const flagSource = a.flag ?? a
  return {
    id: a.id,
    type: a.type ?? a.role ?? 'creator',
    name: a.name ?? a.fullName ?? 'Unknown',
    handle: a.handle ?? a.email ?? '',
    email: a.email ?? '-',
    domainVerified: a.domainVerified ?? null,
    joined: formatDate(a.joinedAt ?? a.createdAt),
    status: a.status ?? 'flagged',
    plan: a.plan ?? null,
    flag: (a.flag || a.status === 'flagged' || a.flagReason) ? {
      reason: flagSource.reason ?? a.flagReason ?? 'Flagged for review.',
      flaggedBy: flagSource.flaggedBy ?? 'System',
      flaggedOn: formatDate(flagSource.flaggedOn ?? flagSource.flaggedAt ?? a.flaggedAt),
      enquiriesSent: flagSource.enquiriesSent ?? 0,
      messagesSent: flagSource.messagesSent ?? 0,
    } : null,
    stat: a.type === 'brand'
      ? { label: 'Enquiries sent', value: flagSource.enquiriesSent ?? 0 }
      : { label: 'Rating', value: a.rating ?? '-' },
  }
}

function statusTag(status) {
  if (status === 'active') return <span className="tag tag-success"><IconCircleCheck className="icon-xs" aria-hidden="true" />Active</span>
  if (status === 'flagged') return <span className="tag tag-warning"><IconFlag className="icon-xs" aria-hidden="true" />Flagged</span>
  if (status === 'suspended') return <span className="tag tag-error"><IconBan className="icon-xs" aria-hidden="true" />Suspended</span>
  return <span className="tag tag-grey">{status}</span>
}

function typeTag(type) {
  return type === 'creator'
    ? <span className="tag tag-purple">Creator</span>
    : <span className="tag tag-info">Brand</span>
}

export default function AccountsPage() {
  usePageMeta('Accounts & Moderation', 'Review flagged creator and brand accounts on Creatorske.');
  // ?q= is the source of truth so the navbar search lands on real results here.
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const setQuery = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value); else next.delete('q')
    setSearchParams(next, { replace: true })
  }
  const [selectedId, setSelectedId] = useState(null)
  const view = searchParams.get('view') === 'all' ? 'all' : 'flagged'
  const setView = (v) => { const next = new URLSearchParams(searchParams); if (v === 'all') next.set('view', 'all'); else next.delete('view'); setSearchParams(next, { replace: true }) }
  const flaggedQ = useFlaggedAccounts()
  const allQ = useAccounts()
  const { accounts: rawAccounts, isLoading, isError, refetch } = view === 'all'
    ? { accounts: allQ.accounts, isLoading: allQ.isLoading, isError: allQ.isError, refetch: allQ.refetch }
    : { accounts: flaggedQ.accounts, isLoading: flaggedQ.isLoading, isError: flaggedQ.isError, refetch: flaggedQ.refetch }
  const { takeAction, isTakingAction } = flaggedQ
  const accounts = useMemo(() => rawAccounts.map(normalizeAccount), [rawAccounts])
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'suspend'|'restore'|'remove', account }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter(a =>
      a.name.toLowerCase().includes(q) || a.handle.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    )
  }, [accounts, query])

  const selected = accounts.find(a => a.id === selectedId) || null

  function applyStatus(id, action) {
    takeAction({ id, action, reason: 'Reviewed via admin accounts panel' })
    setConfirmAction(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <style>{`
        .acc-page *{box-sizing:border-box}
        .acc-page{
          font-family:var(--font-body);color:var(--black);
        }
        .acc-page .tabs{display:flex;background:var(--grey-50);border-radius:var(--radius-lg);padding:var(--space-4);gap:var(--space-2);width:fit-content;flex-wrap:wrap}
        .acc-page .tab{padding:var(--space-8) var(--space-16);border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--grey-500);cursor:pointer;transition:all .15s;border:none;background:none;font-family:var(--font-body);display:flex;align-items:center;gap:var(--space-8)}
        .acc-page .tab:hover{color:var(--black)}
        .acc-page .tab.active{background:var(--white);color:var(--black);box-shadow:var(--shadow-xs)}
        .acc-page .tab-count{font-size:10px;font-weight:600;padding:var(--space-2) var(--space-8);border-radius:var(--radius-pill);background:var(--grey-200);color:var(--grey-600)}
        .acc-page .tab.active .tab-count{background:var(--purple-100);color:var(--purple-700)}
        .acc-page .search-input{display:flex;align-items:center;gap:var(--space-8);background:var(--white);border:0.5px solid var(--grey-200);border-radius:var(--radius-md);padding:var(--space-8) var(--space-12);font-size:13px;width:260px}
        .acc-page .search-input input{border:none;outline:none;font-size:13px;font-family:var(--font-body);width:100%;background:transparent;color:var(--black)}
        .acc-page .search-input svg{color:var(--grey-400)}
        .acc-page .table-wrap{background:var(--white);border:0.5px solid var(--grey-100);border-radius:var(--radius-xl);overflow-x:auto}
        .acc-page .data-table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px}
        .acc-page .data-table td, .acc-page .data-table th{white-space:nowrap}
        .acc-page .data-table th{text-align:left;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--grey-400);padding:var(--space-12) var(--space-16);border-bottom:0.5px solid var(--grey-200);background:var(--grey-50);white-space:nowrap}
        .acc-page .data-table td{padding:var(--space-12) var(--space-16);border-bottom:0.5px solid var(--grey-100);color:var(--grey-700);vertical-align:middle}
        .acc-page .data-table tr{cursor:pointer;transition:background .1s}
        .acc-page .data-table tr:hover td{background:var(--grey-50)}
        .acc-page .data-table tr.selected td{background:var(--purple-50)}
        .acc-page .data-table tr:last-child td{border-bottom:none}
        .acc-page .tag{display:inline-flex;align-items:center;gap:var(--space-4);font-size:11px;font-weight:500;padding:var(--space-4) var(--space-8);border-radius:var(--radius-pill);line-height:1}
        .acc-page .tag-success{background:var(--status-success-bg);color:var(--status-success-text);border:0.5px solid rgba(0,185,107,0.2)}
        .acc-page .tag-warning{background:var(--status-warning-bg);color:var(--status-warning-text);border:0.5px solid rgba(245,166,35,0.25)}
        .acc-page .tag-error{background:var(--status-error-bg);color:var(--status-error-text);border:0.5px solid rgba(255,75,75,0.2)}
        .acc-page .tag-purple{background:var(--purple-50);color:var(--purple-700);border:0.5px solid var(--purple-200)}
        .acc-page .tag-grey{background:var(--grey-50);color:var(--grey-600);border:0.5px solid var(--grey-200)}
        .acc-page .tag-info{background:var(--status-info-bg);color:var(--status-info-text);border:0.5px solid rgba(67,147,245,0.2)}
        .acc-page .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-family:var(--font-display);flex-shrink:0;width:34px;height:34px;font-size:13px;background:var(--purple-100);color:var(--purple-600)}
        .acc-page .btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-8);border:none;cursor:pointer;font-family:var(--font-body);font-weight:500;transition:all .15s;white-space:nowrap;text-decoration:none;line-height:1;border-radius:var(--radius-md)}
        .acc-page .btn-primary{background:var(--black);color:var(--white);font-size:12px;padding:var(--space-8) var(--space-16)}
        .acc-page .btn-primary:hover{background:var(--grey-800)}
        .acc-page .btn-secondary{background:var(--white);color:var(--black);font-size:12px;padding:var(--space-8) var(--space-16);border:0.5px solid var(--grey-300)}
        .acc-page .btn-secondary:hover{border-color:var(--black);background:var(--grey-50)}
        .acc-page .btn-danger{background:var(--status-error);color:var(--white);font-size:12px;padding:var(--space-8) var(--space-16)}
        .acc-page .btn-danger:hover{background:#e23c3c}
        .acc-page .btn-ghost{background:transparent;color:var(--grey-600);font-size:12px;padding:var(--space-8) var(--space-16);border:0.5px solid var(--grey-200)}
        .acc-page .btn-ghost:hover{color:var(--black);border-color:var(--grey-400)}
        .acc-page .card-header{padding:var(--space-16) var(--space-20);border-bottom:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:space-between}
        .acc-page .card-body{padding:var(--space-20)}
        .acc-page .alert{display:flex;align-items:flex-start;gap:var(--space-12);padding:var(--space-12) var(--space-16);border-radius:var(--radius-md);font-size:12.5px;line-height:1.55}
        .acc-page .alert-warning{background:var(--status-warning-bg);color:var(--status-warning-text);border:0.5px solid rgba(245,166,35,0.2)}
        .acc-page .alert-error{background:var(--status-error-bg);color:var(--status-error-text);border:0.5px solid rgba(255,75,75,0.2)}
        .acc-page .detail-row{display:flex;justify-content:space-between;gap:var(--space-12);padding:var(--space-12) 0;border-bottom:0.5px solid var(--grey-100);font-size:12.5px}
        .acc-page .detail-row:last-child{border-bottom:none}
        .acc-page .detail-label{color:var(--grey-400)}
        .acc-page .detail-value{color:var(--black);font-weight:500;text-align:right}
        /* Material 3 dialog composition: 28px "extra-large" corner radius,
           soft 32% scrim, actions right-aligned with no bordered/tinted band.
           No space before .modal-overlay: the overlay div carries both
           acc-page and modal-overlay itself (it's a sibling rendered after
           the page's main .acc-page wrapper closes, not nested inside it) -
           the descendant-combinator form here never matched, so this dialog
           has been rendering unstyled (position:static, sitting in normal
           document flow) the whole time. */
        .acc-page.modal-overlay{position:fixed;inset:0;background:var(--scrim-modal);display:flex;align-items:center;justify-content:center;z-index:50;padding:var(--space-20)}
        .acc-page .modal{background:var(--white);border-radius:var(--radius-modal);box-shadow:var(--shadow-xl);width:100%;max-width:420px;overflow:hidden}
        .acc-page .modal .btn{border-radius:var(--radius-pill)}
        .acc-page .modal .card-header{border-bottom:none}
        .acc-page .split-grid{display:grid;gap:var(--space-20);align-items:start}
        @media(max-width:980px){.acc-page .split-grid{grid-template-columns:1fr !important}}
      `}</style>

      <div className="acc-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>

        {/* Header */}
        <div>
          <div className="page-title">Accounts & Moderation</div>
          <div className="page-subtitle">Review flagged creator and brand accounts and resolve verification issues.</div>
          <div className="page-subtitle" style={{ marginTop: 'var(--space-4)', fontStyle: 'italic' }}>
            Showing flagged accounts only. A full account directory needs a backend endpoint that doesn't exist yet.
          </div>
        </div>

        {/* View + search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
            <div className="tabs" role="tablist" aria-label="Account view">
              <button type="button" role="tab" aria-selected={view === 'flagged'} className={`tab${view === 'flagged' ? ' active' : ''}`} onClick={() => setView('flagged')}>Needs review<span className="tab-count">{flaggedQ.accounts.length}</span></button>
              <button type="button" role="tab" aria-selected={view === 'all'} className={`tab${view === 'all' ? ' active' : ''}`} onClick={() => setView('all')}>All accounts<span className="tab-count">{allQ.accounts.length}</span></button>
            </div>
          <span style={{ fontSize: 13, color: 'var(--grey-500)' }}>
            {isLoading ? 'Loading accounts' : (
              <>
                <strong style={{ color: 'var(--black)' }}>{filtered.length}</strong>
                {' '}{view === 'flagged' ? 'flagged ' : ''}{filtered.length === 1 ? 'account' : 'accounts'}
                {query && <> matching “{query}”</>}
              </>
            )}
          </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <div className="search-input">
              <IconSearch className="icon-sm" aria-hidden="true" />
              <input
                placeholder="Search by name, handle, or email"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            {query && (
              <button className="btn btn-ghost" onClick={() => setQuery('')}>Clear</button>
            )}
          </div>
        </div>

        {/* Table + detail panel */}
        <div className="split-grid" style={{ gridTemplateColumns: selected ? '2fr 1fr' : '1fr' }}>

          <div className="table-wrap">
            {isError ? (
              <ErrorState size="sm" onRetry={refetch} />
            ) : isLoading ? (
              <div style={{ padding: 'var(--space-16)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={40} />)}
              </div>
            ) : (
              <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Type</th>
                  <th>Email / domain</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr
                    key={a.id}
                    className={selectedId === a.id ? 'selected' : ''}
                    onClick={() => setSelectedId(a.id)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                        <div className="avatar">{a.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--black)' }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>{a.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td>{typeTag(a.type)}</td>
                    <td>
                      <div style={{ fontSize: 12.5 }}>{a.email}</div>
                      {a.type === 'brand' && (
                        a.domainVerified
                          ? <div style={{ fontSize: 11, color: 'var(--status-success-text)', marginTop: 'var(--space-2)' }}><IconShieldCheck className="icon-xs" aria-hidden="true" /> Verified domain</div>
                          : <div style={{ fontSize: 11, color: 'var(--status-error-text)', marginTop: 'var(--space-2)' }}><IconShieldX className="icon-xs" aria-hidden="true" /> Unverified domain</div>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{a.joined}</td>
                    <td>{statusTag(a.status)}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setSelectedId(a.id) }}>
                        Review <IconChevronRight className="icon-xs" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <EmptyState
                size="sm"
                icon={<IconUsers />}
                title={accounts.length === 0 ? (view === 'flagged' ? 'No flagged accounts' : 'No accounts yet') : 'No accounts found'}
                description={accounts.length === 0 ? (view === 'flagged' ? "There's nothing needing review right now." : 'Sign-ups will appear here.') : 'Try a different search term.'}
              />
            )}
              </>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card" style={{ alignSelf: 'flex-start' }}>
              <div className="card-header">
                <div className="section-title">Account detail</div>
                <button className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)' }} onClick={() => setSelectedId(null)}>
                  <IconX className="icon-sm" aria-hidden="true" />
                </button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                    {selected.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--grey-400)' }}>{selected.handle}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', alignItems: 'flex-end' }}>
                    {typeTag(selected.type)}
                    {statusTag(selected.status)}
                  </div>
                </div>

                <div>
                  <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
                  {selected.type === 'brand' && (
                    <div className="detail-row">
                      <span className="detail-label">Domain</span>
                      <span className="detail-value">{selected.domainVerified ? 'Verified business domain' : 'Not verified'}</span>
                    </div>
                  )}
                  <div className="detail-row"><span className="detail-label">Joined</span><span className="detail-value">{selected.joined}</span></div>
                  <div className="detail-row"><span className="detail-label">{selected.stat.label}</span><span className="detail-value">{selected.stat.value}</span></div>
                </div>

                {selected.flag && (
                  <>
                    <div className={`alert ${selected.status === 'suspended' ? 'alert-error' : 'alert-warning'}`}>
                      {selected.status === 'suspended' ? <IconBan className="icon-md alert-icon" style={{ marginTop: 'var(--space-2)' }} aria-hidden="true" /> : <IconFlag className="icon-md alert-icon" style={{ marginTop: 'var(--space-2)' }} aria-hidden="true" />}
                      <div>{selected.flag.reason}</div>
                    </div>
                    <div>
                      <div className="detail-row"><span className="detail-label">Flagged by</span><span className="detail-value">{selected.flag.flaggedBy}</span></div>
                      <div className="detail-row"><span className="detail-label">Flagged on</span><span className="detail-value">{selected.flag.flaggedOn}</span></div>
                      <div className="detail-row"><span className="detail-label">Enquiries sent</span><span className="detail-value">{selected.flag.enquiriesSent}</span></div>
                      <div className="detail-row"><span className="detail-label">Messages sent</span><span className="detail-value">{selected.flag.messagesSent}</span></div>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
                  {selected.status !== 'suspended' && (
                    <button className="btn btn-danger" onClick={() => setConfirmAction({ type: 'suspend', account: selected })}>
                      <IconBan className="icon-sm" aria-hidden="true" /> Suspend account
                    </button>
                  )}
                  {selected.status !== 'active' && (
                    <button className="btn btn-secondary" onClick={() => setConfirmAction({ type: 'restore', account: selected })}>
                      <IconRotate className="icon-sm" aria-hidden="true" /> Restore access
                    </button>
                  )}
                  {selected.status === 'suspended' && (
                    <button className="btn btn-ghost" onClick={() => setConfirmAction({ type: 'remove', account: selected })}>
                      Permanently remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="acc-page modal-overlay ui-modal-backdrop" onClick={() => setConfirmAction(null)}>
          <div className="modal ui-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="section-title">
                {confirmAction.type === 'suspend' && 'Suspend this account?'}
                {confirmAction.type === 'restore' && 'Restore account access?'}
                {confirmAction.type === 'remove' && 'Permanently remove account?'}
              </div>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6 }}>
              {confirmAction.type === 'suspend' && <>This will immediately block <strong>{confirmAction.account.name}</strong> from sending enquiries, messages, or accessing bookings. They'll be notified by email and asked to provide valid credentials if relevant.</>}
              {confirmAction.type === 'restore' && <>This will restore full platform access for <strong>{confirmAction.account.name}</strong>. Use this once valid credentials or context have been confirmed.</>}
              {confirmAction.type === 'remove' && <>This permanently removes <strong>{confirmAction.account.name}</strong> and their account data. This action cannot be undone.</>}
            </div>
            <div style={{ padding: 'var(--space-8) var(--space-20) var(--space-20)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button
                className={`${confirmAction.type === 'restore' ? 'btn btn-primary' : 'btn btn-danger'}${isTakingAction ? ' btn-loading' : ''}`}
                disabled={isTakingAction}
                onClick={() => applyStatus(confirmAction.account.id, confirmAction.type)}
              >
                {confirmAction.type === 'suspend' ? 'Suspend' : confirmAction.type === 'restore' ? 'Restore' : 'Remove permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}