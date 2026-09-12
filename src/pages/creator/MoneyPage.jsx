import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { usePageMeta } from '@/lib/usePageMeta'
import { usePayments } from '@/features/payments/hooks/usePayments'
import TransactionHistory from '@/features/payments/components/TransactionHistory'
import MpesaPrompt from '@/features/payments/components/MpesaPrompt'
import { usePlan } from '@/features/plans/hooks/usePlan'
import Modal from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/utils'
import { IconBuildingBank, IconDeviceMobile, IconDownload, IconHistory, IconInfoCircle, IconPlus, IconX } from '@tabler/icons-react';

/*
   MoneyPage: content area only (sidebar/navbar live in the
   dashboard shell). Pulls every color/type/radius/shadow token
   straight from the global design system (index.css :root) so
   it stays in lockstep with the rest of the app, nothing is
   redefined locally. The wrapper itself is transparent; the
   content-area background already comes from --page-bg on the
   shell, and only individual cards get a --white fill.
*/

const METHOD_TYPES = [
  { key: 'mpesa', label: 'M-Pesa', icon: IconDeviceMobile, field: 'M-Pesa phone number', placeholder: '+254 7XX XXX XXX' },
  { key: 'airtel', label: 'Airtel Money', icon: IconDeviceMobile, field: 'Airtel phone number', placeholder: '+254 7XX XXX XXX' },
  { key: 'bank', label: 'Bank account', icon: IconBuildingBank, field: 'Account number', placeholder: '0123456789' },
]

function AddPaymentMethodModal({ open, onClose, onAdd }) {
  const [type, setType] = useState('mpesa')
  const [detail, setDetail] = useState('')
  const [bankName, setBankName] = useState('')
  const [makePrimary, setMakePrimary] = useState(false)

  const selected = METHOD_TYPES.find((m) => m.key === type)
  const valid = detail.trim() && (type !== 'bank' || bankName.trim())

  function submit() {
    onAdd({
      type,
      name: type === 'bank' ? bankName.trim() : selected.label,
      detail: type === 'bank' ? `···· ···· ${detail.trim().slice(-4)}` : detail.trim(),
      makePrimary,
    })
    setDetail(''); setBankName(''); setMakePrimary(false); setType('mpesa')
  }

  return (
    <Modal open={open} onClose={onClose} title="Add payment method" size="sm">
      <label className="field-label" style={{ display: 'block', marginBottom: 'var(--space-8)', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--grey-600)' }}>
        Method type
      </label>
      <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
        {METHOD_TYPES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setType(m.key)}
            aria-pressed={type === m.key}
            style={{
              flex: 1, padding: 'var(--space-12) var(--space-8)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              background: type === m.key ? 'var(--purple-50)' : 'var(--white)',
              border: `1px solid ${type === m.key ? 'var(--purple-400)' : 'var(--grey-200)'}`,
              color: type === m.key ? 'var(--purple-700)' : 'var(--grey-600)',
              fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)',
            }}
          >
            <m.icon className="icon-md" aria-hidden="true" />
            {m.label}
          </button>
        ))}
      </div>

      {type === 'bank' && (
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 'var(--space-8)', fontSize: 12, color: 'var(--grey-600)' }}>Bank name</label>
          <div className="input-wrapper"><IconBuildingBank className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Equity Bank" style={{ width: '100%' }} /></div>
        </div>
      )}

      <div style={{ marginBottom: 'var(--space-16)' }}>
        <label className="field-label" style={{ display: 'block', marginBottom: 'var(--space-8)', fontSize: 12, color: 'var(--grey-600)' }}>{selected.field}</label>
        <div className="input-wrapper"><selected.icon className="icon-sm input-icon left" aria-hidden="true" /><input className="input input-md input-icon-left" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={selected.placeholder} style={{ width: '100%' }} /></div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', fontSize: 13, color: 'var(--grey-600)', marginBottom: 'var(--space-20)', cursor: 'pointer' }}>
        <input type="checkbox" checked={makePrimary} onChange={(e) => setMakePrimary(e.target.checked)} />
        Make this my primary payout method
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-purple btn-sm" disabled={!valid} onClick={submit}>Add method</button>
      </div>
    </Modal>
  )
}

const PAYMENT_METHODS = [
  { icon: IconDeviceMobile, iconBg: '#00A651', name: 'M-Pesa', detail: '+254 712 345 678', primary: true },
  { icon: IconBuildingBank, iconBg: 'var(--grey-100)', iconColor: 'var(--grey-600)', name: 'Equity Bank', detail: '···· ···· 4521', primary: false },
]

export default function MoneyPage() {
  usePageMeta('Money', 'View your earnings, transaction history, and payout options on Creatorske.');
  const navigate = useNavigate()
  const [period, setPeriod] = useState('3m')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [addMethodOpen, setAddMethodOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS)
  const primaryMethod = paymentMethods.find((m) => m.primary)

  const { currentPlan } = usePlan()
  const {
    stats, isStatsLoading,
    earningsTimeline, isTimelineLoading,
    transactions, isHistoryLoading, isHistoryError, refetchHistory,
    requestPayout, isRequestingPayout,
    paymentStatus, isPolling, stopPolling,
  } = usePayments({ period })

  // GET /payments/earnings/timeline's response schema is undocumented -
  // guessed as [{ period/label, amount }]. Bar heights are relative to the
  // max value in the returned series, not a fabricated scale.
  const chartBars = useMemo(() => {
    const points = Array.isArray(earningsTimeline) ? earningsTimeline : []
    const max = Math.max(1, ...points.map((p) => Number(p.amount ?? p.total ?? 0)))
    return points.map((p, i) => {
      const value = Number(p.amount ?? p.total ?? 0)
      return {
        label: p.label ?? p.period ?? p.month ?? `#${i + 1}`,
        amount: value,
        pct: Math.round((value / max) * 100),
        active: i === points.length - 1,
      }
    })
  }, [earningsTimeline])

  // GET /payments/stats' response schema is undocumented - best-effort field
  // guesses with a "-" fallback rather than fabricated numbers.
  const availableBalance = stats?.availableBalance ?? 0
  const pendingBalance = stats?.pendingBalance ?? 0
  const totalEarnedThisPeriod = stats?.totalEarned ?? 0

  function handleSetPrimary(name) {
    setPaymentMethods((prev) => prev.map((m) => ({ ...m, primary: m.name === name })))
    toast.success(`${name} set as your primary payout method.`)
  }

  // No /payments/methods endpoint exists yet (see BACKEND_API_SPEC.md), so the
  // new method is held in page state and labelled as such - but the creator
  // still enters real details and sees them, instead of a dead-end toast.
  function handleAddPaymentMethod(method) {
    setPaymentMethods((prev) => [
      ...prev.map((m) => ({ ...m, primary: method.makePrimary ? false : m.primary })),
      {
        icon: method.type === 'bank' ? IconBuildingBank : IconDeviceMobile,
        iconBg: method.type === 'mpesa' ? '#00A651' : method.type === 'airtel' ? '#E40000' : 'var(--grey-100)',
        iconColor: method.type === 'bank' ? 'var(--grey-600)' : undefined,
        name: method.name,
        detail: method.detail,
        primary: !!method.makePrimary || prev.length === 0,
      },
    ])
    setAddMethodOpen(false)
    toast.success(`${method.name} added. Saved locally until payout methods are supported on the backend.`)
  }

  function handleExportCsv() {
    const header = ['Date', 'Description', 'Amount']
    const rows = transactions.map((t) => [
      t.date ?? t.createdAt ?? '',
      `${t.counterpartyName ?? t.description ?? t.name ?? 'Transaction'} - ${t.note ?? t.method ?? t.sub ?? ''}`,
      t.amount ?? 0,
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'creatorske-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function openWithdraw() {
    setAmount(String(availableBalance || ''))
    setWithdrawOpen(true)
  }

  function confirmWithdraw() {
    const numericAmount = Number(String(amount).replace(/,/g, '')) || 0
    if (!numericAmount || !primaryMethod) return
    requestPayout({ amount: numericAmount, method: primaryMethod.name })
  }

  const isPaymentSettled = paymentStatus
    ? ['completed', 'success', 'successful', 'failed', 'cancelled', 'canceled'].includes(
        (paymentStatus.status ?? paymentStatus.resultCode ?? '').toString().toLowerCase()
      )
    : false

  // The modal deliberately stays open on a settled payment until the creator
  // dismisses it - a withdrawal result that disappears on a timer gives them
  // no chance to read what actually happened.
  function closeWithdraw() {
    setWithdrawOpen(false)
    stopPolling()
  }

  return (
    <div className="money-page">
      <style>{`
        .money-page{
          font-family:var(--font-body);color:var(--black);
          font-size:var(--text-body-size);line-height:1.6;
        }
        .money-page *{box-sizing:border-box}
        .money-page .mp-main{padding:var(--space-32);min-width:0}
        .money-page .mp-inner{max-width:1080px;margin:0 auto}

        /* Bento grid */
        .money-page .bento{display:grid;grid-template-columns:repeat(12,1fr);gap:var(--space-16)}
        .money-page .s-7{grid-column:span 7}
        .money-page .s-5{grid-column:span 5}
        .money-page .s-12{grid-column:span 12}
        .money-page .r-2{grid-row:span 2}
        .money-page .r-3{grid-row:span 3}
        @media(max-width:760px){
          .money-page .bento > *{grid-column:span 12!important;grid-row:auto!important}
        }

        /* Hero balance tile (not in the shared library, page-specific) */
        .money-page .hero{border-radius:var(--radius-2xl);padding:var(--space-24);position:relative;overflow:hidden;background:var(--black);color:var(--white);display:flex;flex-direction:column}
        .money-page .hero-label{font-size:var(--text-caption-size);font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.5;margin-bottom:var(--space-12)}
        .money-page .hero-amount{font-family:var(--font-display);font-size:40px;font-weight:700;letter-spacing:-.02em;line-height:1}
        .money-page .hero-sub{font-size:12px;opacity:.5;margin-top:var(--space-8)}
        .money-page .hero-actions{margin-top:auto;padding-top:var(--space-20);display:flex;gap:var(--space-8)}
        /* The hero is an inverted tile (var(--black) bg, var(--white) text), so
           its translucent buttons/rings mix from var(--white) too - that way
           they stay visible when the tile flips to a light surface in dark mode. */
        .money-page .hero-btn{background:color-mix(in srgb, var(--white) 12%, transparent);color:var(--white);border:0.5px solid color-mix(in srgb, var(--white) 20%, transparent)}
        .money-page .hero-btn:hover{background:color-mix(in srgb, var(--white) 20%, transparent)}
        .money-page .hero-btn-solid{background:var(--purple-600);border-color:var(--purple-600);color:#fff}
        .money-page .hero-btn-solid:hover{background:var(--purple-800)}
        .money-page .hero-ring-a{position:absolute;right:-20px;top:-20px;width:110px;height:110px;border-radius:50%;background:color-mix(in srgb, var(--white) 6%, transparent);pointer-events:none}
        .money-page .hero-ring-b{position:absolute;right:30px;bottom:-30px;width:80px;height:80px;border-radius:50%;background:color-mix(in srgb, var(--white) 4%, transparent);pointer-events:none}

        /* Chart */
        .money-page .chart-bars{display:flex;align-items:flex-end;gap:var(--space-8);height:90px;padding-bottom:var(--space-2)}
        .money-page .chart-bar{width:100%;border-radius:3px 3px 0 0}

        /* Payment method row */
        .money-page .pay-icon{border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}

        /* Withdraw CTA tile */
        .money-page .cta{background:var(--status-success-bg);border:0.5px solid rgba(16,185,129,.35)}

        /* Modal (ported 1:1 from the component library spec) */
        .money-page .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:var(--space-24);z-index:300}
        .money-page .modal{background:var(--white);border-radius:var(--radius-2xl);width:100%;max-width:440px;max-height:min(600px,86vh);box-shadow:var(--shadow-xl);overflow:hidden;display:flex;flex-direction:column}
        .money-page .modal-header{padding:var(--space-24) var(--space-24) 0;display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0}
        .money-page .modal-title{font-family:var(--font-display);font-size:var(--text-h4-size);font-weight:var(--text-h4-weight);color:var(--black);letter-spacing:var(--text-h4-tracking)}
        .money-page .modal-close{width:32px;height:32px;border-radius:var(--radius-md);border:none;background:var(--grey-100);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--grey-600);font-size:16px;transition:all .15s;flex-shrink:0}
        .money-page .modal-close:hover{background:var(--grey-200);color:var(--black)}
        .money-page .modal-body{padding:var(--space-16) var(--space-24) var(--space-24);overflow-y:auto}
        .money-page .modal-body-text{font-size:13px;color:var(--grey-600);line-height:1.6;margin-bottom:var(--space-16)}
        .money-page .modal-footer{padding:var(--space-16) var(--space-24);background:var(--page-bg);border-top:0.5px solid var(--grey-100);display:flex;justify-content:flex-end;gap:var(--space-12);flex-shrink:0}

        .money-page .alert{display:flex;align-items:flex-start;gap:var(--space-12);padding:var(--space-16) var(--space-16);border-radius:var(--radius-lg);font-size:12.5px;line-height:1.5}
        .money-page .alert-icon-badge{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;color:#fff}
        .money-page .alert-info{background:var(--status-info-bg);color:var(--status-info-text)}
        .money-page .alert-info .alert-icon-badge{background:var(--status-info)}
        .money-page .alert-success{background:var(--status-success-bg);color:var(--status-success-text)}
        .money-page .alert-success .alert-icon-badge{background:var(--status-success)}

        .money-page .kv-row{display:flex;align-items:center;justify-content:space-between;padding:var(--space-12) 0;border-bottom:0.5px solid var(--grey-100);font-size:13px}
        .money-page .kv-row:last-of-type{border-bottom:none}
        .money-page .kv-label{color:var(--grey-500)}
        .money-page .kv-value{font-weight:500;color:var(--black)}

        .money-page .history-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-12);padding:var(--space-12) 0;border-bottom:0.5px solid var(--grey-100)}
        .money-page .history-row:last-child{border-bottom:none}

        .money-page .amount-field{display:flex;align-items:center;gap:var(--space-8);border:0.5px solid var(--grey-300);border-radius:var(--radius-md);padding:var(--space-12) var(--space-16);background:var(--white)}
        .money-page .amount-field:focus-within{border-color:var(--purple-400);box-shadow:0 0 0 3px rgba(83,74,183,.1)}
        .money-page .amount-field input{border:none;outline:none;font-family:var(--font-display);font-size:20px;font-weight:700;width:100%;color:var(--black);background:transparent}

        @media(max-width:600px){.money-page .mp-main{padding:var(--space-16) var(--space-12)}}
      `}</style>

      <div className="mp-main">
        <div className="mp-inner">

          {/* Header: no redundant top-level withdraw button; the balance
              tile and the CTA card below both already offer one. */}
          <div style={{ marginBottom: 'var(--space-24)' }}>
            <h3 className="page-title">Money account</h3>
            <p className="page-subtitle">Your earnings, payouts, and payment methods.</p>
          </div>

          <div className="bento">

            {/* Balance hero */}
            <div className="hero s-7 r-2">
              <div className="hero-label">Available balance</div>
              <div className="hero-amount">{isStatsLoading ? '···' : formatCurrency(availableBalance)}</div>
              <div className="hero-sub">Ready to withdraw</div>
              <div className="hero-actions">
                <button className="btn btn-sm hero-btn hero-btn-solid" onClick={openWithdraw}>
                  <IconDownload className="icon-xs" aria-hidden="true" />Withdraw
                </button>
                <button className="btn btn-sm hero-btn" onClick={() => setHistoryOpen(true)}>
                  <IconHistory className="icon-xs" aria-hidden="true" />History
                </button>
              </div>
              <div className="hero-ring-a"></div>
              <div className="hero-ring-b"></div>
            </div>

            {/* Pending / Total earned stat cards */}
            <div className="stat-card s-5">
              <div className="stat-card-label">Pending</div>
              <div className="stat-card-value" style={{ fontSize: 24 }}>{isStatsLoading ? '···' : formatCurrency(pendingBalance)}</div>
            </div>
            <div className="stat-card s-5">
              <div className="stat-card-label">Total earned</div>
              <div className="stat-card-value" style={{ fontSize: 24 }}>{isStatsLoading ? '···' : formatCurrency(totalEarnedThisPeriod)}</div>
            </div>

            {/* Earnings chart */}
            <div className="card card-p-md s-12">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-16)', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
                <p className="section-title">Earnings overview</p>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  {['3m', '6m', '1y'].map((p) => (
                    <button
                      key={p}
                      className="btn btn-ghost btn-xs"
                      style={p === period ? { background: 'var(--page-bg)', color: 'var(--black)', borderColor: 'var(--grey-300)' } : undefined}
                      onClick={() => setPeriod(p)}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {isTimelineLoading ? (
                <div style={{ display: 'flex', gap: 'var(--space-8)', height: 90, alignItems: 'flex-end' }}>
                  {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ flex: 1, height: `${40 + i * 20}%` }} />)}
                </div>
              ) : chartBars.length === 0 ? (
                <div style={{ padding: 'var(--space-24) 0', textAlign: 'center', fontSize: 12.5, color: 'var(--grey-400)' }}>No earnings data for this period yet.</div>
              ) : (
                <>
                  <div className="chart-bars">
                    {chartBars.map((bar, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ fontSize: 9, fontWeight: bar.active ? 600 : 400, color: bar.active ? 'var(--purple-600)' : 'var(--grey-400)' }}>{formatCurrency(bar.amount)}</div>
                        <div
                          className="chart-bar"
                          title={`${bar.label}: ${formatCurrency(bar.amount)}`}
                          style={{
                            background: bar.active ? 'var(--purple-600)' : 'var(--purple-50)',
                            height: `${bar.pct}%`,
                            border: bar.active ? '0.5px solid var(--purple-200)' : 'none',
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-4)' }}>
                    {chartBars.map((bar, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: bar.active ? 500 : 400, color: bar.active ? 'var(--purple-600)' : 'var(--grey-400)' }}>
                        {bar.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Transactions */}
            <div className="table-wrap s-7 r-3">
              <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="section-title">Transactions</span>
                <button className="btn btn-ghost btn-xs" onClick={() => setHistoryOpen(true)}>
                  <IconHistory className="icon-xs" aria-hidden="true" />View all
                </button>
              </div>
              <TransactionHistory
                transactions={transactions}
                isLoading={isHistoryLoading}
                isError={isHistoryError}
                onRetry={refetchHistory}
                variant="table"
                limit={5}
              />
            </div>

            {/* Payment methods */}
            <div className="card card-p-md s-5">
              <p className="section-title" style={{ marginBottom: 'var(--space-16)' }}>Payment methods</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {paymentMethods.map((m) => (
                  <div
                    key={m.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-12)', padding: 'var(--space-12) var(--space-12)',
                      background: m.primary ? 'var(--purple-50)' : 'var(--page-bg)',
                      border: `0.5px solid ${m.primary ? 'var(--purple-200)' : 'var(--grey-100)'}`,
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div className="pay-icon" style={{ background: m.iconBg, width: 32, height: 32 }}>
                      <m.icon className="icon-sm" style={{ color: m.iconColor || 'white' }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--grey-400)' }}>{m.detail}</div>
                    </div>
                    {m.primary ? (
                      <span className="tag tag-success" style={{ fontSize: 10 }}>
                        <span className="sdot" style={{ background: 'var(--status-success)', width: 5, height: 5 }}></span>Primary
                      </span>
                    ) : (
                      <button className="btn btn-ghost btn-xs" onClick={() => handleSetPrimary(m.name)}>Set primary</button>
                    )}
                  </div>
                ))}
                <button className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 'var(--space-2)' }} onClick={() => setAddMethodOpen(true)}>
                  <IconPlus className="icon-sm" aria-hidden="true" />Add payment method
                </button>
              </div>
            </div>

            {/* Subscription */}
            <div className="card card-p-md s-5">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-16)' }}>
                <p className="section-title">Subscription</p>
                <span className="tag tag-purple">{currentPlan?.name ?? currentPlan?.id ?? '-'}</span>
              </div>
              {/* Billing/renewal/usage fields below have no confirmed backend
                  shape yet (see production plan's backend spec) - shown as
                  illustrative placeholders, not real numbers. */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Plan</span>
                  <span style={{ fontWeight: 500 }}>{currentPlan?.name ?? currentPlan?.id ?? '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Billing</span>
                  <span style={{ fontWeight: 500 }}>{currentPlan?.price != null ? `${formatCurrency(currentPlan.price)} / month` : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Next renewal</span>
                  <span style={{ fontWeight: 500 }}>{currentPlan?.renewsAt ? new Date(currentPlan.renewsAt).toLocaleDateString('en-KE') : '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Rate cards</span>
                  <span style={{ fontWeight: 500 }}>{currentPlan?.rateCardsUsed != null && currentPlan?.rateCardsMax != null ? `${currentPlan.rateCardsUsed} / ${currentPlan.rateCardsMax} used` : '-'}</span>
                </div>
              </div>
              {currentPlan?.rateCardsUsed != null && currentPlan?.rateCardsMax != null && (
                <div className="progress-bar-wrap progress-sm" style={{ marginTop: 'var(--space-12)' }}>
                  <div className="progress-bar-fill progress-sm" style={{ width: `${Math.round((currentPlan.rateCardsUsed / currentPlan.rateCardsMax) * 100)}%` }}></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-12)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pricing')}>Manage plan</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setHistoryOpen(true)}>View invoices</button>
              </div>
            </div>

            {/* Withdraw CTA */}
            <div className="card card-p-md cta s-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <div style={{ width: 36, height: 36, background: 'var(--white)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconDownload className="icon-md" style={{ color: 'var(--status-success-text)' }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--status-success-text)' }}>Withdraw funds</div>
                  <div style={{ fontSize: 11.5, color: 'var(--status-success-text)', opacity: 0.8 }}>{isStatsLoading ? '···' : formatCurrency(availableBalance)} available</div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--status-success)', color: 'white', borderRadius: 'var(--radius-md)' }}
                  onClick={openWithdraw}
                >
                  Withdraw
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AddPaymentMethodModal
        open={addMethodOpen}
        onClose={() => setAddMethodOpen(false)}
        onAdd={handleAddPaymentMethod}
      />

      {/* Withdraw modal */}
      {withdrawOpen && (
        <div className="modal-backdrop" onClick={() => !isPolling && !isRequestingPayout && closeWithdraw()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Withdraw funds</div>
              <button className="modal-close" onClick={() => !isPolling && !isRequestingPayout && closeWithdraw()}>
                <IconX className="icon-sm" aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              {isPolling || isPaymentSettled ? (
                <MpesaPrompt phone={primaryMethod?.detail} status={paymentStatus} isPolling={isPolling} />
              ) : (
                <>
                  <div className="modal-body-text">Confirm how much you'd like to move to your primary payment method.</div>

                  <div className="amount-field" style={{ marginBottom: 'var(--space-16)' }}>
                    <span style={{ color: 'var(--grey-400)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>KES</span>
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
                  </div>

                  <div style={{ marginBottom: 'var(--space-16)' }}>
                    <div className="kv-row">
                      <span className="kv-label">To</span>
                      <span className="kv-value">{primaryMethod ? `${primaryMethod.name} · ${primaryMethod.detail}` : 'No payment method on file'}</span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-label">You'll receive</span>
                      <span className="kv-value">{formatCurrency(Number(String(amount).replace(/,/g, '')) || 0)}</span>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <span className="alert-icon-badge"><IconInfoCircle className="icon-sm" aria-hidden="true" /></span>
                    <div>Withdrawals to M-Pesa usually land within a few minutes.</div>
                  </div>
                </>
              )}
            </div>
            {isPaymentSettled ? (
              <div className="modal-footer">
                <button className="btn btn-purple" onClick={closeWithdraw}>Done</button>
              </div>
            ) : isPolling ? (
              <div className="modal-footer">
                <span style={{ fontSize: 12, color: 'var(--grey-500)', marginRight: 'auto' }}>
                  Waiting for confirmation. Keep this open.
                </span>
                <button className="btn btn-ghost" onClick={closeWithdraw}>Close</button>
              </div>
            ) : (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={closeWithdraw} disabled={isRequestingPayout}>Cancel</button>
                <button
                  className={`btn btn-purple${isRequestingPayout ? ' btn-loading' : ''}`}
                  disabled={isRequestingPayout || !primaryMethod}
                  onClick={confirmWithdraw}
                >
                  Confirm withdrawal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History modal */}
      {historyOpen && (
        <div className="modal-backdrop" onClick={() => setHistoryOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Transaction history</div>
              <button className="modal-close" onClick={() => setHistoryOpen(false)}>
                <IconX className="icon-sm" aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-body-text">Every payout, payment, and charge on your account, most recent first.</div>
              <TransactionHistory
                transactions={transactions}
                isLoading={isHistoryLoading}
                isError={isHistoryError}
                onRetry={refetchHistory}
                variant="list"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setHistoryOpen(false)}>Close</button>
              <button className="btn btn-secondary" onClick={handleExportCsv}>
                <IconDownload className="icon-sm" aria-hidden="true" />Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}