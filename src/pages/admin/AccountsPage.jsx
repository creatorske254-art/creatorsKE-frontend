import { useMemo, useState } from 'react'
import { usePageMeta } from '@/lib/usePageMeta'

// Mock data: wire up to admin.service.js (list/review/suspend/restore)
const ACCOUNTS = [
  {
    id: 'acc_1042',
    type: 'brand',
    name: 'Kali Labs',
    handle: 'kalilabs.co',
    email: 'hello@kalilabs.co',
    domainVerified: true,
    joined: 'Mar 14, 2026',
    status: 'active',
    stat: { label: 'Enquiries sent', value: 12 },
  },
  {
    id: 'acc_1098',
    type: 'creator',
    name: 'Amara Muriithi',
    handle: '@amara.creates',
    email: 'amara@gmail.com',
    domainVerified: null,
    joined: 'Jan 28, 2026',
    status: 'active',
    stat: { label: 'Rating', value: '4.8' },
  },
  {
    id: 'acc_1131',
    type: 'brand',
    name: 'Brightway Ventures',
    handle: 'brightwayventures.com',
    email: 'team@brightwayventures.com',
    domainVerified: false,
    joined: 'Jun 2, 2026',
    status: 'flagged',
    flag: {
      reason: 'Company name and email domain could not be verified as a legitimate business.',
      flaggedBy: 'Auto: brand verification check',
      flaggedOn: 'Jun 24, 2026',
      enquiriesSent: 2,
      messagesSent: 1,
    },
    stat: { label: 'Enquiries sent', value: 2 },
  },
  {
    id: 'acc_1156',
    type: 'creator',
    name: 'Devon Okoth',
    handle: '@devonshoots',
    email: 'devon.okoth@outlook.com',
    domainVerified: null,
    joined: 'Apr 9, 2026',
    status: 'flagged',
    flag: {
      reason: 'Did not respond to a paid booking; brand requested a refund after grace period.',
      flaggedBy: 'System: abandonment case',
      flaggedOn: 'Jun 20, 2026',
      enquiriesSent: 8,
      messagesSent: 14,
    },
    stat: { label: 'Rating', value: '3.9' },
  },
  {
    id: 'acc_0987',
    type: 'brand',
    name: 'Glow & Co',
    handle: 'glowandco.fake-mail.io',
    email: 'team@glowandco.fake-mail.io',
    domainVerified: false,
    joined: 'Jun 18, 2026',
    status: 'suspended',
    flag: {
      reason: 'Free-domain email used in place of a verifiable business domain; no credentials provided after review window.',
      flaggedBy: 'Creator report',
      flaggedOn: 'Jun 19, 2026',
      enquiriesSent: 1,
      messagesSent: 0,
    },
    stat: { label: 'Enquiries sent', value: 1 },
  },
  {
    id: 'acc_1203',
    type: 'creator',
    name: 'Naliaka Wekesa',
    handle: '@naliaka.style',
    email: 'naliaka@protonmail.com',
    domainVerified: null,
    joined: 'May 30, 2026',
    status: 'active',
    stat: { label: 'Rating', value: '5.0' },
  },
]

const TABS = [
  { key: 'all', label: 'All accounts' },
  { key: 'creator', label: 'Creators' },
  { key: 'brand', label: 'Brands' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'suspended', label: 'Suspended' },
]

function statusTag(status) {
  if (status === 'active') return <span className="tag tag-success"><i className="ti ti-circle-check" style={{ fontSize: 11 }} />Active</span>
  if (status === 'flagged') return <span className="tag tag-warning"><i className="ti ti-flag" style={{ fontSize: 11 }} />Flagged</span>
  if (status === 'suspended') return <span className="tag tag-error"><i className="ti ti-ban" style={{ fontSize: 11 }} />Suspended</span>
  return <span className="tag tag-grey">{status}</span>
}

function typeTag(type) {
  return type === 'creator'
    ? <span className="tag tag-purple">Creator</span>
    : <span className="tag tag-info">Brand</span>
}

export default function AccountsPage() {
  usePageMeta('Accounts & Moderation', 'Review creator and brand accounts and resolve verification flags on Creatorske.');
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(ACCOUNTS.find(a => a.status === 'flagged')?.id ?? null)
  const [accounts, setAccounts] = useState(ACCOUNTS)
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'suspend'|'restore'|'remove', account }

  const filtered = useMemo(() => {
    return accounts.filter(a => {
      const matchesTab =
        activeTab === 'all' ? true :
        activeTab === 'creator' || activeTab === 'brand' ? a.type === activeTab :
        a.status === activeTab
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.handle.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [accounts, activeTab, query])

  const selected = accounts.find(a => a.id === selectedId) || null

  const counts = useMemo(() => ({
    all: accounts.length,
    creator: accounts.filter(a => a.type === 'creator').length,
    brand: accounts.filter(a => a.type === 'brand').length,
    flagged: accounts.filter(a => a.status === 'flagged').length,
    suspended: accounts.filter(a => a.status === 'suspended').length,
  }), [accounts])

  function applyStatus(id, status) {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setConfirmAction(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <style>{`
        .acc-page *{box-sizing:border-box}
        .acc-page{
          --white:#FFFFFF;--off-white:#F8F7FF;--black:#0D0D0D;--page-bg:#F2F1F8;
          --purple-50:#F0EEFF;--purple-100:#DDD9FD;--purple-200:#BAB3FA;--purple-300:#9187F7;
          --purple-500:#5445E8;--purple-600:#3D2FD6;--purple-700:#2C1FB8;
          --grey-50:#F5F5F5;--grey-100:#EBEBEB;--grey-200:#D6D6D6;--grey-300:#B8B8B8;
          --grey-400:#919191;--grey-500:#6E6E6E;--grey-600:#4A4A4A;--grey-700:#333333;--grey-800:#1F1F1F;
          --status-success:#00B96B;--status-success-bg:#E6F9F1;--status-success-text:#006B3D;
          --status-warning:#F5A623;--status-warning-bg:#FEF6E7;--status-warning-text:#7A4A00;
          --status-error:#FF4B4B;--status-error-bg:#FFF0F0;--status-error-text:#8B0000;
          --status-info:#4393F5;--status-info-bg:#EEF5FF;--status-info-text:#1A3F80;
          --font-display:'Gill Sans MT','Gill Sans',Calibri,sans-serif;--font-body:'Inter',sans-serif;
          --radius-sm:4px;--radius-md:8px;--radius-lg:12px;--radius-xl:16px;--radius-pill:999px;
          --shadow-xs:0 1px 2px rgba(0,0,0,0.05);--shadow-md:0 4px 16px rgba(0,0,0,0.08);--shadow-lg:0 8px 32px rgba(0,0,0,0.10);
          font-family:var(--font-body);color:var(--black);
        }
        .acc-page .section-eyebrow{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--purple-500);font-weight:600;margin-bottom:4px}
        .acc-page .section-title{font-family:var(--font-display);font-size:20px;font-weight:600;color:var(--black);margin-bottom:6px;letter-spacing:-0.01em}
        .acc-page .section-desc{font-size:13px;color:var(--grey-500);line-height:1.6}
        .acc-page .tabs{display:flex;background:var(--grey-50);border-radius:var(--radius-lg);padding:4px;gap:2px;width:fit-content;flex-wrap:wrap}
        .acc-page .tab{padding:7px 14px;border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--grey-500);cursor:pointer;transition:all .15s;border:none;background:none;font-family:var(--font-body);display:flex;align-items:center;gap:6px}
        .acc-page .tab:hover{color:var(--black)}
        .acc-page .tab.active{background:var(--white);color:var(--black);box-shadow:var(--shadow-xs)}
        .acc-page .tab-count{font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-pill);background:var(--grey-200);color:var(--grey-600)}
        .acc-page .tab.active .tab-count{background:var(--purple-100);color:var(--purple-700)}
        .acc-page .search-input{display:flex;align-items:center;gap:8px;background:var(--white);border:0.5px solid var(--grey-200);border-radius:var(--radius-md);padding:8px 12px;font-size:13px;width:260px}
        .acc-page .search-input input{border:none;outline:none;font-size:13px;font-family:var(--font-body);width:100%;background:transparent;color:var(--black)}
        .acc-page .search-input i{color:var(--grey-400);font-size:15px}
        .acc-page .table-wrap{background:var(--white);border:0.5px solid var(--grey-100);border-radius:var(--radius-xl);overflow-x:auto}
        .acc-page .data-table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px}
        .acc-page .data-table td, .acc-page .data-table th{white-space:nowrap}
        .acc-page .data-table th{text-align:left;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--grey-400);padding:10px 16px;border-bottom:0.5px solid var(--grey-200);background:var(--grey-50);white-space:nowrap}
        .acc-page .data-table td{padding:12px 16px;border-bottom:0.5px solid var(--grey-100);color:var(--grey-700);vertical-align:middle}
        .acc-page .data-table tr{cursor:pointer;transition:background .1s}
        .acc-page .data-table tr:hover td{background:var(--grey-50)}
        .acc-page .data-table tr.selected td{background:var(--purple-50)}
        .acc-page .data-table tr:last-child td{border-bottom:none}
        .acc-page .tag{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;padding:3px 9px;border-radius:var(--radius-pill);line-height:1}
        .acc-page .tag-success{background:var(--status-success-bg);color:var(--status-success-text);border:0.5px solid rgba(0,185,107,0.2)}
        .acc-page .tag-warning{background:var(--status-warning-bg);color:var(--status-warning-text);border:0.5px solid rgba(245,166,35,0.25)}
        .acc-page .tag-error{background:var(--status-error-bg);color:var(--status-error-text);border:0.5px solid rgba(255,75,75,0.2)}
        .acc-page .tag-purple{background:var(--purple-50);color:var(--purple-700);border:0.5px solid var(--purple-200)}
        .acc-page .tag-grey{background:var(--grey-50);color:var(--grey-600);border:0.5px solid var(--grey-200)}
        .acc-page .tag-info{background:var(--status-info-bg);color:var(--status-info-text);border:0.5px solid rgba(67,147,245,0.2)}
        .acc-page .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-family:var(--font-display);flex-shrink:0;width:34px;height:34px;font-size:13px;background:var(--purple-100);color:var(--purple-600)}
        .acc-page .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;cursor:pointer;font-family:var(--font-body);font-weight:500;transition:all .15s;white-space:nowrap;text-decoration:none;line-height:1;border-radius:var(--radius-md)}
        .acc-page .btn-primary{background:var(--black);color:var(--white);font-size:12px;padding:7px 14px}
        .acc-page .btn-primary:hover{background:var(--grey-800)}
        .acc-page .btn-secondary{background:var(--white);color:var(--black);font-size:12px;padding:6.5px 14px;border:0.5px solid var(--grey-300)}
        .acc-page .btn-secondary:hover{border-color:var(--black);background:var(--grey-50)}
        .acc-page .btn-danger{background:var(--status-error);color:var(--white);font-size:12px;padding:7px 14px}
        .acc-page .btn-danger:hover{background:#e23c3c}
        .acc-page .btn-ghost{background:transparent;color:var(--grey-600);font-size:12px;padding:6.5px 14px;border:0.5px solid var(--grey-200)}
        .acc-page .btn-ghost:hover{color:var(--black);border-color:var(--grey-400)}
        .acc-page .card{background:var(--white);border:0.5px solid var(--grey-100);border-radius:var(--radius-lg)}
        .acc-page .card-header{padding:16px 20px;border-bottom:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:space-between}
        .acc-page .card-header-title{font-family:var(--font-display);font-size:15px;font-weight:600;color:var(--black)}
        .acc-page .card-body{padding:20px}
        .acc-page .alert{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:var(--radius-md);font-size:12.5px;line-height:1.55}
        .acc-page .alert-warning{background:var(--status-warning-bg);color:var(--status-warning-text);border:0.5px solid rgba(245,166,35,0.2)}
        .acc-page .alert-error{background:var(--status-error-bg);color:var(--status-error-text);border:0.5px solid rgba(255,75,75,0.2)}
        .acc-page .detail-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:0.5px solid var(--grey-100);font-size:12.5px}
        .acc-page .detail-row:last-child{border-bottom:none}
        .acc-page .detail-label{color:var(--grey-400)}
        .acc-page .detail-value{color:var(--black);font-weight:500;text-align:right}
        .acc-page .empty-state{text-align:center;padding:40px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}
        .acc-page .empty-icon{width:46px;height:46px;border-radius:var(--radius-lg);background:var(--grey-50);border:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--grey-400)}
        .acc-page .modal-overlay{position:fixed;inset:0;background:rgba(13,13,13,0.4);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px}
        .acc-page .modal{background:var(--white);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);width:100%;max-width:420px;overflow:hidden}
        .acc-page .split-grid{display:grid;gap:20px;align-items:start}
        @media(max-width:980px){.acc-page .split-grid{grid-template-columns:1fr !important}}
      `}</style>

      <div className="acc-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <div className="section-title">Accounts & Moderation</div>
          <div className="section-desc">Review creator and brand accounts, resolve verification flags, and manage suspensions.</div>
        </div>

        {/* Tabs + search */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div className="tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`tab ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                <span className="tab-count">{counts[t.key]}</span>
              </button>
            ))}
          </div>
          <div className="search-input">
            <i className="ti ti-search" />
            <input
              placeholder="Search by name, handle, or email"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table + detail panel */}
        <div className="split-grid" style={{ gridTemplateColumns: selected ? '2fr 1fr' : '1fr' }}>

          <div className="table-wrap">
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                          ? <div style={{ fontSize: 11, color: 'var(--status-success-text)', marginTop: 2 }}><i className="ti ti-shield-check" style={{ fontSize: 11 }} /> Verified domain</div>
                          : <div style={{ fontSize: 11, color: 'var(--status-error-text)', marginTop: 2 }}><i className="ti ti-shield-x" style={{ fontSize: 11 }} /> Unverified domain</div>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12.5 }}>{a.joined}</td>
                    <td>{statusTag(a.status)}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setSelectedId(a.id) }}>
                        Review <i className="ti ti-chevron-right" style={{ fontSize: 12 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon"><i className="ti ti-users" /></div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>No accounts found</div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-500)', maxWidth: 240 }}>Try a different search term or switch tabs.</div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card" style={{ alignSelf: 'flex-start' }}>
              <div className="card-header">
                <div className="card-header-title">Account detail</div>
                <button className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)' }} onClick={() => setSelectedId(null)}>
                  <i className="ti ti-x" />
                </button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                    {selected.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--grey-400)' }}>{selected.handle}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
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
                      <i className={`ti ${selected.status === 'suspended' ? 'ti-ban' : 'ti-flag'} alert-icon`} style={{ fontSize: 16, marginTop: 1 }} />
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

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selected.status !== 'suspended' && (
                    <button className="btn btn-danger" onClick={() => setConfirmAction({ type: 'suspend', account: selected })}>
                      <i className="ti ti-ban" style={{ fontSize: 13 }} /> Suspend account
                    </button>
                  )}
                  {selected.status !== 'active' && (
                    <button className="btn btn-secondary" onClick={() => setConfirmAction({ type: 'restore', account: selected })}>
                      <i className="ti ti-rotate" style={{ fontSize: 13 }} /> Restore access
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
        <div className="acc-page modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-header-title">
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
            <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--grey-100)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button
                className={confirmAction.type === 'restore' ? 'btn btn-primary' : 'btn btn-danger'}
                onClick={() => applyStatus(
                  confirmAction.account.id,
                  confirmAction.type === 'suspend' ? 'suspended' : confirmAction.type === 'restore' ? 'active' : 'removed'
                )}
              >
                {confirmAction.type === 'suspend' && 'Suspend'}
                {confirmAction.type === 'restore' && 'Restore'}
                {confirmAction.type === 'remove' && 'Remove permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}