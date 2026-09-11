import { useEffect, useState } from 'react'
import { usePageMeta } from '@/lib/usePageMeta'

/*
   MoneyPage: content area only (sidebar/navbar live in the
   dashboard shell). Pulls every color/type/radius/shadow token
   straight from the global design system (index.css :root) so
   it stays in lockstep with the rest of the app, nothing is
   redefined locally. The wrapper itself is transparent; the
   content-area background already comes from --page-bg on the
   shell, and only individual cards get a --white fill.
*/

const CHART = [
  { label: 'Mar', amount: 'KES 34,000', short: '34K', pct: 32 },
  { label: 'Apr', amount: 'KES 68,000', short: '68K', pct: 64 },
  { label: 'May', amount: 'KES 106,000', short: '106K', pct: 100, active: true },
]

const TRANSACTIONS = [
  { name: 'Jumia Kenya', sub: 'Story Post · Paid via M-Pesa', date: '23 May', amount: '+KES 8,000', positive: true },
  { name: 'KFC Kenya', sub: 'Reel + Caption · Paid via M-Pesa', date: '18 May', amount: '+KES 22,000', positive: true },
  { name: 'Withdrawal', sub: 'To M-Pesa +254 712 345 678', date: '15 May', amount: '−KES 40,000', positive: false },
  { name: 'Equity Bank', sub: 'Brand Partnership · Bank transfer', date: '9 May', amount: '+KES 55,000', positive: true },
  { name: 'Creatorske Pro', sub: 'Monthly subscription', date: '1 May', amount: '−KES 1,200', positive: false },
]

const FULL_HISTORY = [
  ...TRANSACTIONS,
  { name: 'Safaricom PLC', sub: 'Carousel Post · Paid via M-Pesa', date: '27 Apr', amount: '+KES 30,000', positive: true },
  { name: 'Withdrawal', sub: 'To M-Pesa +254 712 345 678', date: '20 Apr', amount: '−KES 25,000', positive: false },
  { name: 'Naivas Supermarket', sub: 'Reel · Paid via Bank transfer', date: '11 Apr', amount: '+KES 18,500', positive: true },
  { name: 'Creatorske Pro', sub: 'Monthly subscription', date: '1 Apr', amount: '−KES 1,200', positive: false },
]

const PAYMENT_METHODS = [
  { icon: 'ti-device-mobile', iconBg: '#00A651', name: 'M-Pesa', detail: '+254 712 345 678', primary: true },
  { icon: 'ti-building-bank', iconBg: 'var(--grey-100)', iconColor: 'var(--grey-600)', name: 'Equity Bank', detail: '···· ···· 4521', primary: false },
]

export default function MoneyPage() {
  usePageMeta('Money', 'View your earnings, transaction history, and payout options on Creatorske.');
  const [period, setPeriod] = useState('3m')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [withdrawState, setWithdrawState] = useState('idle') // idle | loading | done
  const [amount, setAmount] = useState('84,000')

  // Pull in the Tabler Icons webfont the design relies on for every <i class="ti ti-*">
  useEffect(() => {
    const id = 'tabler-icons-cdn'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
      document.head.appendChild(link)
    }
  }, [])

  function openWithdraw() {
    setWithdrawState('idle')
    setWithdrawOpen(true)
  }

  function confirmWithdraw() {
    if (withdrawState !== 'idle') return
    setWithdrawState('loading')
    setTimeout(() => {
      setWithdrawState('done')
      setTimeout(() => {
        setWithdrawOpen(false)
        setWithdrawState('idle')
      }, 1400)
    }, 1300)
  }

  return (
    <div className="money-page">
      <style>{`
        .money-page{
          font-family:var(--font-body);color:var(--black);
          font-size:var(--text-body-size);line-height:1.6;
        }
        .money-page *{box-sizing:border-box}
        .money-page .mp-main{padding:28px;min-width:0}
        .money-page .mp-inner{max-width:1080px;margin:0 auto}

        /* Bento grid */
        .money-page .bento{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
        .money-page .s-7{grid-column:span 7}
        .money-page .s-5{grid-column:span 5}
        .money-page .s-12{grid-column:span 12}
        .money-page .r-2{grid-row:span 2}
        .money-page .r-3{grid-row:span 3}
        @media(max-width:760px){
          .money-page .bento > *{grid-column:span 12!important;grid-row:auto!important}
        }

        /* Hero balance tile (not in the shared library, page-specific) */
        .money-page .hero{border-radius:var(--radius-2xl);padding:24px;position:relative;overflow:hidden;background:var(--black);color:var(--white);display:flex;flex-direction:column}
        .money-page .hero-label{font-size:var(--text-caption-size);font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.5;margin-bottom:10px}
        .money-page .hero-amount{font-family:var(--font-display);font-size:40px;font-weight:700;letter-spacing:-.02em;line-height:1}
        .money-page .hero-sub{font-size:12px;opacity:.5;margin-top:6px}
        .money-page .hero-actions{margin-top:auto;padding-top:20px;display:flex;gap:8px}
        .money-page .hero-btn{background:rgba(255,255,255,.12);color:#fff;border:0.5px solid rgba(255,255,255,.2)}
        .money-page .hero-btn:hover{background:rgba(255,255,255,.2)}
        .money-page .hero-btn-solid{background:var(--purple-600);border-color:var(--purple-600)}
        .money-page .hero-btn-solid:hover{background:var(--purple-800)}
        .money-page .hero-ring-a{position:absolute;right:-20px;top:-20px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none}
        .money-page .hero-ring-b{position:absolute;right:30px;bottom:-30px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}

        /* Chart */
        .money-page .chart-bars{display:flex;align-items:flex-end;gap:6px;height:90px;padding-bottom:2px}
        .money-page .chart-bar{width:100%;border-radius:3px 3px 0 0}

        /* Payment method row */
        .money-page .pay-icon{border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-shrink:0}

        /* Withdraw CTA tile */
        .money-page .cta{background:var(--status-success-bg);border:0.5px solid rgba(16,185,129,.35)}

        /* Modal (ported 1:1 from the component library spec) */
        .money-page .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:24px;z-index:300}
        .money-page .modal{background:var(--white);border-radius:var(--radius-2xl);width:100%;max-width:440px;max-height:min(600px,86vh);box-shadow:var(--shadow-xl);overflow:hidden;display:flex;flex-direction:column}
        .money-page .modal-header{padding:24px 24px 0;display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0}
        .money-page .modal-title{font-family:var(--font-display);font-size:var(--text-h4-size);font-weight:var(--text-h4-weight);color:var(--black);letter-spacing:var(--text-h4-tracking)}
        .money-page .modal-close{width:32px;height:32px;border-radius:var(--radius-md);border:none;background:var(--grey-100);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--grey-600);font-size:16px;transition:all .15s;flex-shrink:0}
        .money-page .modal-close:hover{background:var(--grey-200);color:var(--black)}
        .money-page .modal-body{padding:16px 24px 24px;overflow-y:auto}
        .money-page .modal-body-text{font-size:13px;color:var(--grey-600);line-height:1.6;margin-bottom:16px}
        .money-page .modal-footer{padding:16px 24px;background:var(--page-bg);border-top:0.5px solid var(--grey-100);display:flex;justify-content:flex-end;gap:10px;flex-shrink:0}

        .money-page .alert{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:var(--radius-lg);font-size:12.5px;line-height:1.5}
        .money-page .alert-icon-badge{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;color:#fff}
        .money-page .alert-info{background:var(--status-info-bg);color:var(--status-info-text)}
        .money-page .alert-info .alert-icon-badge{background:var(--status-info)}
        .money-page .alert-success{background:var(--status-success-bg);color:var(--status-success-text)}
        .money-page .alert-success .alert-icon-badge{background:var(--status-success)}

        .money-page .kv-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:0.5px solid var(--grey-100);font-size:13px}
        .money-page .kv-row:last-of-type{border-bottom:none}
        .money-page .kv-label{color:var(--grey-500)}
        .money-page .kv-value{font-weight:500;color:var(--black)}

        .money-page .history-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:0.5px solid var(--grey-100)}
        .money-page .history-row:last-child{border-bottom:none}

        .money-page .amount-field{display:flex;align-items:center;gap:8px;border:0.5px solid var(--grey-300);border-radius:var(--radius-md);padding:12px 14px;background:var(--white)}
        .money-page .amount-field:focus-within{border-color:var(--purple-400);box-shadow:0 0 0 3px rgba(83,74,183,.1)}
        .money-page .amount-field input{border:none;outline:none;font-family:var(--font-display);font-size:20px;font-weight:700;width:100%;color:var(--black);background:transparent}

        @media(max-width:600px){.money-page .mp-main{padding:16px 12px}}
      `}</style>

      <div className="mp-main">
        <div className="mp-inner">

          {/* Header: no redundant top-level withdraw button; the balance
              tile and the CTA card below both already offer one. */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: 0 }}>Money account</h3>
            <p style={{ fontSize: 13, color: 'var(--grey-500)', marginTop: 4 }}>Your earnings, payouts, and payment methods.</p>
          </div>

          <div className="bento">

            {/* Balance hero */}
            <div className="hero s-7 r-2">
              <div className="hero-label">Available balance</div>
              <div className="hero-amount">KES 84,000</div>
              <div className="hero-sub">Ready to withdraw</div>
              <div className="hero-actions">
                <button className="btn btn-sm hero-btn hero-btn-solid" onClick={openWithdraw}>
                  <i className="ti ti-download" style={{ fontSize: 12 }}></i>Withdraw
                </button>
                <button className="btn btn-sm hero-btn" onClick={() => setHistoryOpen(true)}>
                  <i className="ti ti-history" style={{ fontSize: 12 }}></i>History
                </button>
              </div>
              <div className="hero-ring-a"></div>
              <div className="hero-ring-b"></div>
            </div>

            {/* Pending / Total earned stat cards */}
            <div className="stat-card s-5">
              <div className="stat-card-label">Pending</div>
              <div className="stat-card-value" style={{ fontSize: 24 }}>KES 22,000</div>
              <div style={{ fontSize: 11.5, color: 'var(--grey-500)' }}>1 payment in transit</div>
            </div>
            <div className="stat-card s-5">
              <div className="stat-card-label">Total earned (May)</div>
              <div className="stat-card-value" style={{ fontSize: 24 }}>KES 106,000</div>
              <div className="stat-card-delta up">
                <span className="tag tag-success" style={{ fontSize: 11 }}>+22%</span>
                <span style={{ color: 'var(--grey-500)' }}>vs April</span>
              </div>
            </div>

            {/* Earnings chart */}
            <div className="card card-p-md s-12">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <p className="card-title" style={{ marginBottom: 0, fontSize: 16 }}>Earnings overview</p>
                <div style={{ display: 'flex', gap: 5 }}>
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
              <div className="chart-bars">
                {CHART.map((bar) => (
                  <div key={bar.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ fontSize: 9, fontWeight: bar.active ? 600 : 400, color: bar.active ? 'var(--purple-600)' : 'var(--grey-400)' }}>{bar.short}</div>
                    <div
                      className="chart-bar"
                      title={`${bar.label}: ${bar.amount}`}
                      style={{
                        background: bar.active ? 'var(--purple-600)' : 'var(--purple-50)',
                        height: `${bar.pct}%`,
                        border: bar.active ? '0.5px solid var(--purple-200)' : 'none',
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                {CHART.map((bar) => (
                  <div key={bar.label} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: bar.active ? 500 : 400, color: bar.active ? 'var(--purple-600)' : 'var(--grey-400)' }}>
                    {bar.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="table-wrap s-7 r-3">
              <div style={{ padding: '16px 18px', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Transactions</span>
                <button className="btn btn-ghost btn-xs" onClick={() => setHistoryOpen(true)}>
                  <i className="ti ti-history" style={{ fontSize: 11 }}></i>View all
                </button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map((t) => (
                    <tr key={t.name + t.date}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 1 }}>{t.sub}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--grey-400)' }}>{t.date}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.positive ? 'var(--status-success-text)' : 'var(--status-error-text)' }}>
                          {t.amount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment methods */}
            <div className="card card-p-md s-5">
              <p className="card-title" style={{ fontSize: 15, marginBottom: 14 }}>Payment methods</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PAYMENT_METHODS.map((m) => (
                  <div
                    key={m.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px',
                      background: m.primary ? 'var(--purple-50)' : 'var(--page-bg)',
                      border: `0.5px solid ${m.primary ? 'var(--purple-200)' : 'var(--grey-100)'}`,
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div className="pay-icon" style={{ background: m.iconBg, width: 32, height: 32 }}>
                      <i className={`ti ${m.icon}`} style={{ color: m.iconColor || 'white', fontSize: 15 }}></i>
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
                      <button className="btn btn-ghost btn-xs">Set primary</button>
                    )}
                  </div>
                ))}
                <button className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 2 }}>
                  <i className="ti ti-plus" style={{ fontSize: 13 }}></i>Add payment method
                </button>
              </div>
            </div>

            {/* Subscription */}
            <div className="card card-p-md s-5">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p className="card-title" style={{ fontSize: 15, marginBottom: 0 }}>Subscription</p>
                <span className="tag tag-purple">Pro</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Plan</span>
                  <span style={{ fontWeight: 500 }}>Creatorske Pro</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Billing</span>
                  <span style={{ fontWeight: 500 }}>KES 1,200 / month</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Next renewal</span>
                  <span style={{ fontWeight: 500 }}>1 Jun 2026</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--grey-400)' }}>Rate cards</span>
                  <span style={{ fontWeight: 500 }}>3 / 5 used</span>
                </div>
              </div>
              <div className="progress-bar-wrap progress-sm" style={{ marginTop: 10 }}>
                <div className="progress-bar-fill progress-sm" style={{ width: '60%' }}></div>
              </div>
              <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
                <button className="btn btn-secondary btn-sm">Manage plan</button>
                <button className="btn btn-ghost btn-sm">View invoices</button>
              </div>
            </div>

            {/* Withdraw CTA */}
            <div className="card card-p-md cta s-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 36, height: 36, background: 'var(--white)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ti ti-download" style={{ fontSize: 16, color: 'var(--status-success-text)' }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--status-success-text)' }}>Withdraw funds</div>
                  <div style={{ fontSize: 11.5, color: 'var(--status-success-text)', opacity: 0.8 }}>KES 84,000 available</div>
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

      {/* Withdraw modal */}
      {withdrawOpen && (
        <div className="modal-backdrop" onClick={() => withdrawState !== 'loading' && setWithdrawOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Withdraw funds</div>
              <button className="modal-close" onClick={() => withdrawState !== 'loading' && setWithdrawOpen(false)}>
                <i className="ti ti-x" style={{ fontSize: 14 }}></i>
              </button>
            </div>
            <div className="modal-body">
              {withdrawState === 'done' ? (
                <div className="alert alert-success">
                  <span className="alert-icon-badge"><i className="ti ti-check"></i></span>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Withdrawal sent</div>
                    <div style={{ opacity: 0.8 }}>KES {amount} is on its way to M-Pesa +254 712 345 678.</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="modal-body-text">Confirm how much you'd like to move to your primary payment method.</div>

                  <div className="amount-field" style={{ marginBottom: 16 }}>
                    <span style={{ color: 'var(--grey-400)', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>KES</span>
                    <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div className="kv-row">
                      <span className="kv-label">To</span>
                      <span className="kv-value">M-Pesa · +254 712 345 678</span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-label">Fee</span>
                      <span className="kv-value">KES 0</span>
                    </div>
                    <div className="kv-row">
                      <span className="kv-label">You'll receive</span>
                      <span className="kv-value">KES {amount}</span>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <span className="alert-icon-badge"><i className="ti ti-info-circle"></i></span>
                    <div>Withdrawals to M-Pesa usually land within a few minutes.</div>
                  </div>
                </>
              )}
            </div>
            {withdrawState !== 'done' && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setWithdrawOpen(false)} disabled={withdrawState === 'loading'}>Cancel</button>
                <button
                  className={`btn btn-purple${withdrawState === 'loading' ? ' btn-loading' : ''}`}
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
                <i className="ti ti-x" style={{ fontSize: 14 }}></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-body-text">Every payout, payment, and charge on your account, most recent first.</div>
              <div>
                {FULL_HISTORY.map((t, i) => (
                  <div className="history-row" key={t.name + t.date + i}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 1 }}>{t.sub} · {t.date}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.positive ? 'var(--status-success-text)' : 'var(--status-error-text)', flexShrink: 0 }}>
                      {t.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setHistoryOpen(false)}>Close</button>
              <button className="btn btn-secondary">
                <i className="ti ti-download" style={{ fontSize: 13 }}></i>Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}