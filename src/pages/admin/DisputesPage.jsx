import { useEffect, useMemo, useState } from 'react'
import { usePageMeta } from '@/lib/usePageMeta'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useDisputes } from '@/features/admin/hooks/useDisputes'
import { formatDate } from '@/lib/utils'

// GET /admin/disputes' response schema is undocumented (see CLAUDE.md) — the
// rich scope/evidence breakdown below has no confirmed backend counterpart,
// so it's rendered only when a real dispute object actually carries it.
function normalizeDispute(d) {
  return {
    id: d.id,
    bookingId: d.bookingId ?? d.campaignId ?? '—',
    creator: { name: d.creatorName ?? d.creator?.name ?? 'Unknown creator', handle: d.creatorHandle ?? d.creator?.handle ?? '' },
    brand: { name: d.brandName ?? d.brand?.name ?? 'Unknown brand' },
    package: d.packageName ?? d.package ?? 'Booking dispute',
    amount: Number(d.amount ?? 0),
    raisedBy: d.raisedBy ?? 'brand',
    raisedOn: formatDate(d.raisedAt ?? d.createdAt),
    status: d.status ?? 'evidence',
    evidenceDeadline: d.evidenceDeadline ?? '',
    scope: d.scope ?? null,
    evidence: Array.isArray(d.evidence) ? d.evidence : [],
    decision: d.decision ?? null,
  }
}

const TABS = [
  { key: 'all', label: 'All cases' },
  { key: 'evidence', label: 'Evidence window' },
  { key: 'review', label: 'Awaiting decision' },
  { key: 'decided', label: 'Resolved' },
]

function statusTag(status) {
  if (status === 'evidence') return <span className="tag tag-warning"><i className="ti ti-clock" style={{ fontSize: 11 }} />Evidence window</span>
  if (status === 'review') return <span className="tag tag-info"><i className="ti ti-gavel" style={{ fontSize: 11 }} />Awaiting decision</span>
  if (status === 'decided') return <span className="tag tag-success"><i className="ti ti-circle-check" style={{ fontSize: 11 }} />Resolved</span>
  return <span className="tag tag-grey">{status}</span>
}

function evidenceIcon(type) {
  if (type === 'file') return 'ti-file-text'
  if (type === 'screenshot') return 'ti-photo'
  if (type === 'message') return 'ti-message-circle'
  return 'ti-paperclip'
}

function outcomeLabel(outcome) {
  if (outcome === 'full_approval') return 'Full approval'
  if (outcome === 'partial') return 'Partial release'
  if (outcome === 'full_refund') return 'Full refund'
  return outcome
}

function fmt(n) {
  return `KSh ${n.toLocaleString()}`
}

export default function DisputesPage() {
  usePageMeta('Disputes', 'Review and resolve open disputes between creators and brands on Creatorske.');
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const { disputes: rawDisputes, isLoading, isError, resolve, isResolving, refetch } = useDisputes()
  const disputes = useMemo(() => rawDisputes.map(normalizeDispute), [rawDisputes])
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (selectedId || disputes.length === 0) return
    setSelectedId(disputes.find(d => d.status === 'evidence')?.id ?? null)
  }, [disputes, selectedId])

  // decision form state
  const [outcome, setOutcome] = useState('full_approval')
  const [creatorShare, setCreatorShare] = useState(70)
  const [note, setNote] = useState('')

  const filtered = useMemo(() => {
    return disputes.filter(d => {
      const matchesTab = activeTab === 'all' ? true : d.status === activeTab
      const q = query.trim().toLowerCase()
      const matchesQuery = !q ||
        d.creator.name.toLowerCase().includes(q) ||
        d.brand.name.toLowerCase().includes(q) ||
        d.package.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [disputes, activeTab, query])

  const selected = disputes.find(d => d.id === selectedId) || null

  const counts = useMemo(() => ({
    all: disputes.length,
    evidence: disputes.filter(d => d.status === 'evidence').length,
    review: disputes.filter(d => d.status === 'review').length,
    decided: disputes.filter(d => d.status === 'decided').length,
  }), [disputes])

  function selectCase(d) {
    setSelectedId(d.id)
    setOutcome('full_approval')
    setCreatorShare(70)
    setNote('')
  }

  function submitDecision() {
    if (!selected) return
    resolve({
      id: selected.id,
      decision: {
        outcome,
        creatorShare: outcome === 'full_approval' ? 100 : outcome === 'full_refund' ? 0 : creatorShare,
        note,
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <style>{`
        .dsp-page *{box-sizing:border-box}
        .dsp-page{
          font-family:var(--font-body);color:var(--black);
        }
        .dsp-page .section-title{font-family:var(--font-display);font-size:20px;font-weight:600;color:var(--black);margin-bottom:6px;letter-spacing:-0.01em}
        .dsp-page .section-desc{font-size:13px;color:var(--grey-500);line-height:1.6}
        .dsp-page .tabs{display:flex;background:var(--grey-50);border-radius:var(--radius-lg);padding:4px;gap:2px;width:fit-content;flex-wrap:wrap}
        .dsp-page .tab{padding:7px 14px;border-radius:var(--radius-md);font-size:13px;font-weight:500;color:var(--grey-500);cursor:pointer;transition:all .15s;border:none;background:none;font-family:var(--font-body);display:flex;align-items:center;gap:6px}
        .dsp-page .tab:hover{color:var(--black)}
        .dsp-page .tab.active{background:var(--white);color:var(--black);box-shadow:var(--shadow-xs)}
        .dsp-page .tab-count{font-size:10px;font-weight:600;padding:1px 6px;border-radius:var(--radius-pill);background:var(--grey-200);color:var(--grey-600)}
        .dsp-page .tab.active .tab-count{background:var(--purple-100);color:var(--purple-700)}
        .dsp-page .search-input{display:flex;align-items:center;gap:8px;background:var(--white);border:0.5px solid var(--grey-200);border-radius:var(--radius-md);padding:8px 12px;font-size:13px;width:260px}
        .dsp-page .search-input input{border:none;outline:none;font-size:13px;font-family:var(--font-body);width:100%;background:transparent;color:var(--black)}
        .dsp-page .search-input i{color:var(--grey-400);font-size:15px}
        .dsp-page .table-wrap{background:var(--white);border:0.5px solid var(--grey-100);border-radius:var(--radius-xl);overflow-x:auto}
        .dsp-page .data-table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px}
        .dsp-page .data-table td, .dsp-page .data-table th{white-space:nowrap}
        .dsp-page .data-table th{text-align:left;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--grey-400);padding:10px 16px;border-bottom:0.5px solid var(--grey-200);background:var(--grey-50);white-space:nowrap}
        .dsp-page .data-table td{padding:12px 16px;border-bottom:0.5px solid var(--grey-100);color:var(--grey-700);vertical-align:middle}
        .dsp-page .data-table tr{cursor:pointer;transition:background .1s}
        .dsp-page .data-table tr:hover td{background:var(--grey-50)}
        .dsp-page .data-table tr.selected td{background:var(--purple-50)}
        .dsp-page .data-table tr:last-child td{border-bottom:none}
        .dsp-page .tag{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;padding:3px 9px;border-radius:var(--radius-pill);line-height:1}
        .dsp-page .tag-success{background:var(--status-success-bg);color:var(--status-success-text);border:0.5px solid rgba(0,185,107,0.2)}
        .dsp-page .tag-warning{background:var(--status-warning-bg);color:var(--status-warning-text);border:0.5px solid rgba(245,166,35,0.25)}
        .dsp-page .tag-error{background:var(--status-error-bg);color:var(--status-error-text);border:0.5px solid rgba(255,75,75,0.2)}
        .dsp-page .tag-purple{background:var(--purple-50);color:var(--purple-700);border:0.5px solid var(--purple-200)}
        .dsp-page .tag-grey{background:var(--grey-50);color:var(--grey-600);border:0.5px solid var(--grey-200)}
        .dsp-page .tag-info{background:var(--status-info-bg);color:var(--status-info-text);border:0.5px solid rgba(67,147,245,0.2)}
        .dsp-page .avatar{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-family:var(--font-display);flex-shrink:0;width:30px;height:30px;font-size:12px;background:var(--purple-100);color:var(--purple-600)}
        .dsp-page .avatar-grey{background:var(--grey-100);color:var(--grey-600)}
        .dsp-page .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;cursor:pointer;font-family:var(--font-body);font-weight:500;transition:all .15s;white-space:nowrap;text-decoration:none;line-height:1;border-radius:var(--radius-md)}
        .dsp-page .btn-primary{background:var(--black);color:var(--white);font-size:13px;padding:9px 16px}
        .dsp-page .btn-primary:hover{background:var(--grey-800)}
        .dsp-page .btn-primary:disabled{opacity:.4;cursor:not-allowed}
        .dsp-page .btn-ghost{background:transparent;color:var(--grey-600);font-size:12px;padding:6.5px 14px;border:0.5px solid var(--grey-200)}
        .dsp-page .btn-ghost:hover{color:var(--black);border-color:var(--grey-400)}
        .dsp-page .card-header{padding:16px 20px;border-bottom:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:space-between}
        .dsp-page .card-header-title{font-family:var(--font-display);font-size:15px;font-weight:600;color:var(--black)}
        .dsp-page .card-body{padding:20px}
        .dsp-page .alert{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:var(--radius-md);font-size:12.5px;line-height:1.55}
        .dsp-page .alert-warning{background:var(--status-warning-bg);color:var(--status-warning-text);border:0.5px solid rgba(245,166,35,0.2)}
        .dsp-page .alert-success{background:var(--status-success-bg);color:var(--status-success-text);border:0.5px solid rgba(0,185,107,0.2)}
        .dsp-page .detail-row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:0.5px solid var(--grey-100);font-size:12.5px}
        .dsp-page .detail-row:last-child{border-bottom:none}
        .dsp-page .detail-label{color:var(--grey-400)}
        .dsp-page .detail-value{color:var(--black);font-weight:500;text-align:right}
        .dsp-page .evidence-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:0.5px solid var(--grey-100);font-size:12.5px}
        .dsp-page .evidence-item:last-child{border-bottom:none}
        .dsp-page .evidence-icon{width:30px;height:30px;border-radius:var(--radius-md);background:var(--grey-50);border:0.5px solid var(--grey-100);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--grey-500);flex-shrink:0}
        .dsp-page .pill-toggle{display:flex;background:var(--grey-50);border-radius:var(--radius-lg);padding:3px;gap:2px}
        .dsp-page .pill-option{flex:1;text-align:center;padding:8px 6px;border-radius:var(--radius-md);font-size:12px;font-weight:500;color:var(--grey-500);cursor:pointer;transition:all .15s}
        .dsp-page .pill-option.active{background:var(--white);color:var(--black);box-shadow:var(--shadow-xs)}
        .dsp-page .split-bar{height:10px;border-radius:var(--radius-pill);overflow:hidden;display:flex;background:var(--grey-100);margin:10px 0}
        .dsp-page .split-fill-creator{background:var(--purple-500)}
        .dsp-page .split-fill-brand{background:var(--grey-300)}
        .dsp-page textarea{width:100%;border:0.5px solid var(--grey-200);border-radius:var(--radius-md);padding:10px 12px;font-size:12.5px;font-family:var(--font-body);resize:vertical;min-height:64px;outline:none;color:var(--black)}
        .dsp-page textarea:focus{border-color:var(--purple-300)}
        .dsp-page input[type=range]{width:100%;accent-color:var(--purple-500)}
        .dsp-page .split-grid{display:grid;gap:20px;align-items:start}
        .dsp-page .detail-col{position:sticky;top:20px;max-height:calc(100vh - 40px);overflow-y:auto}
        @media(max-width:980px){.dsp-page .split-grid{grid-template-columns:1fr !important}.dsp-page .detail-col{position:static;max-height:none}}
      `}</style>

      <div className="dsp-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div>
          <div className="section-title">Disputes</div>
          <div className="section-desc">Review evidence from both parties and issue binding decisions on escrow release.</div>
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
              placeholder="Search by creator, brand, or case ID"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table + case detail */}
        <div className="split-grid" style={{ gridTemplateColumns: selected ? '1.3fr 1fr' : '1fr' }}>

          <div className="table-wrap">
            {isError ? (
              <ErrorState size="sm" onRetry={refetch} />
            ) : isLoading ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={40} />)}
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Case</th>
                      <th>Creator</th>
                      <th>Brand</th>
                      <th>Amount</th>
                      <th>Raised by</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(d => (
                      <tr
                        key={d.id}
                        className={selectedId === d.id ? 'selected' : ''}
                        onClick={() => selectCase(d)}
                      >
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--black)' }}>{d.package}</div>
                          <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>{d.id} · {d.raisedOn}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="avatar">{d.creator.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
                            <span style={{ fontSize: 12.5 }}>{d.creator.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12.5 }}>{d.brand.name}</td>
                        <td style={{ fontWeight: 500, color: 'var(--black)', whiteSpace: 'nowrap' }}>{fmt(d.amount)}</td>
                        <td><span className="tag tag-grey" style={{ textTransform: 'capitalize' }}>{d.raisedBy}</span></td>
                        <td>{statusTag(d.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <EmptyState
                    size="sm"
                    icon={<i className="ti ti-gavel" aria-hidden="true" />}
                    title={disputes.length === 0 ? 'No disputes' : 'No disputes here'}
                    description={disputes.length === 0 ? 'Open disputes will show up here.' : 'Try a different search term or switch tabs.'}
                  />
                )}
              </>
            )}
          </div>

          {/* Case detail */}
          {selected && (
            <div className="detail-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div className="card">
                <div className="card-header">
                  <div className="card-header-title">Case {selected.id}</div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)' }} onClick={() => setSelectedId(null)}>
                    <i className="ti ti-x" />
                  </button>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{selected.creator.name}</span>
                        <i className="ti ti-swords" style={{ fontSize: 13, color: 'var(--grey-400)' }} />
                        <span>{selected.brand.name}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--grey-400)' }}>{selected.creator.handle} · Booking {selected.bookingId}</div>
                    </div>
                    {statusTag(selected.status)}
                  </div>

                  {selected.status === 'evidence' && (
                    <div className="alert alert-warning">
                      <i className="ti ti-clock" style={{ fontSize: 16, marginTop: 1 }} />
                      <div>Evidence submission window: <strong>{selected.evidenceDeadline}</strong>. Both parties may still submit evidence.</div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--grey-400)', marginBottom: 6 }}>Agreed scope</div>
                    {selected.scope ? (
                      <>
                        <div className="detail-row"><span className="detail-label">Deliverables</span><span className="detail-value">{selected.scope.deliverables?.join(', ') ?? '—'}</span></div>
                        <div className="detail-row"><span className="detail-label">Timeline</span><span className="detail-value">{selected.scope.timeline ?? '—'}</span></div>
                      </>
                    ) : (
                      <div className="detail-row"><span className="detail-label">Deliverables</span><span className="detail-value">Not available</span></div>
                    )}
                    <div className="detail-row"><span className="detail-label">Amount in escrow</span><span className="detail-value">{fmt(selected.amount)}</span></div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--grey-400)', marginBottom: 4 }}>Evidence submitted</div>
                    {selected.evidence.length === 0 ? (
                      <div style={{ fontSize: 12.5, color: 'var(--grey-400)' }}>No evidence submitted yet.</div>
                    ) : selected.evidence.map((e, i) => (
                      <div className="evidence-item" key={i}>
                        <div className="evidence-icon"><i className={`ti ${evidenceIcon(e.type)}`} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--black)' }}>{e.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 1, textTransform: 'capitalize' }}>From {e.from}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decision card */}
              <div className="card">
                <div className="card-header">
                  <div className="card-header-title">{selected.decision ? 'Decision issued' : 'Issue binding decision'}</div>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {selected.decision ? (
                    <>
                      <div className="alert alert-success">
                        <i className="ti ti-circle-check" style={{ fontSize: 16, marginTop: 1 }} />
                        <div><strong>{outcomeLabel(selected.decision.outcome)}</strong>, decided {selected.decision.decidedOn}</div>
                      </div>
                      <div className="split-bar">
                        <div className="split-fill-creator" style={{ width: `${selected.decision.creatorShare}%` }} />
                        <div className="split-fill-brand" style={{ width: `${100 - selected.decision.creatorShare}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--grey-500)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="ti ti-user" style={{ fontSize: 12 }} />Creator: {selected.decision.creatorShare}% ({fmt(Math.round(selected.amount * selected.decision.creatorShare / 100))})</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="ti ti-building-store" style={{ fontSize: 12 }} />Brand: {100 - selected.decision.creatorShare}% ({fmt(Math.round(selected.amount * (100 - selected.decision.creatorShare) / 100))})</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--grey-600)', lineHeight: 1.6 }}>{selected.decision.note}</div>
                    </>
                  ) : (
                    <>
                      <div className="pill-toggle">
                        {[
                          { key: 'full_approval', label: 'Full approval' },
                          { key: 'partial', label: 'Partial release' },
                          { key: 'full_refund', label: 'Full refund' },
                        ].map(o => (
                          <div
                            key={o.key}
                            className={`pill-option ${outcome === o.key ? 'active' : ''}`}
                            onClick={() => setOutcome(o.key)}
                          >
                            {o.label}
                          </div>
                        ))}
                      </div>

                      {outcome === 'partial' && (
                        <div>
                          <input
                            type="range"
                            min={5}
                            max={95}
                            step={5}
                            value={creatorShare}
                            onChange={e => setCreatorShare(Number(e.target.value))}
                          />
                          <div className="split-bar">
                            <div className="split-fill-creator" style={{ width: `${creatorShare}%` }} />
                            <div className="split-fill-brand" style={{ width: `${100 - creatorShare}%` }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--grey-500)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="ti ti-user" style={{ fontSize: 12 }} />Creator: {creatorShare}% ({fmt(Math.round(selected.amount * creatorShare / 100))})</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="ti ti-building-store" style={{ fontSize: 12 }} />Brand: {100 - creatorShare}% ({fmt(Math.round(selected.amount * (100 - creatorShare) / 100))})</span>
                          </div>
                        </div>
                      )}

                      {outcome !== 'partial' && (
                        <div style={{ fontSize: 12.5, color: 'var(--grey-500)' }}>
                          {outcome === 'full_approval'
                            ? `Full amount (${fmt(selected.amount)}) released to ${selected.creator.name}, net of platform fee.`
                            : `Full amount (${fmt(selected.amount)}) refunded to ${selected.brand.name}.`}
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: 11.5, color: 'var(--grey-500)', marginBottom: 6 }}>Reasoning (sent to both parties)</div>
                        <textarea
                          placeholder="Explain how the evidence supports this decision..."
                          value={note}
                          onChange={e => setNote(e.target.value)}
                        />
                      </div>

                      <button className={`btn btn-primary${isResolving ? ' btn-loading' : ''}`} disabled={!note.trim() || isResolving} onClick={submitDecision}>
                        <i className="ti ti-gavel" style={{ fontSize: 14 }} /> Issue binding decision
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}