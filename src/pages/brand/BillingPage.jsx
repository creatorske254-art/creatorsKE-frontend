import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePageMeta } from '@/lib/usePageMeta';
import { useBrandBilling } from '@/features/brand-dashboard/hooks/useBrandBilling';
import { useDemoFallback } from '@/lib/useDemoFallback';
import { DEMO_BRAND_BILLING } from '@/lib/demoData';
import { formatCurrency, formatDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import DemoTag from '@/components/shared/DemoTag';
import { ChartFrame, BarChart, SERIES, kes } from '@/components/charts';
import { IconCreditCard, IconDownload, IconFileInvoice, IconReceipt2, IconSearch } from '@tabler/icons-react';

/*
   Billing & invoices (brand). Three things a finance person needs:
   1. What am I paying for - the plan, when it renews, the card on file.
   2. What have I been charged - invoices, filterable, downloadable.
   3. Where did the money go - campaign spend vs platform fees by month.
   Backed by GET /brands/billing + /brands/invoices (BACKEND_API_SPEC.md).
*/

const STATUS_TAG = {
  paid:     { cls: 'tag-success', label: 'Paid' },
  due:      { cls: 'tag-warning', label: 'Due' },
  overdue:  { cls: 'tag-error',   label: 'Overdue' },
  refunded: { cls: 'tag-default', label: 'Refunded' },
  void:     { cls: 'tag-default', label: 'Void' },
};
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'open', label: 'Due / overdue' },
  { id: 'refunded', label: 'Refunded' },
];

function monthKey(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : `${d.getFullYear()}-${d.getMonth()}`;
}

export default function BillingPage() {
  usePageMeta('Billing & invoices', 'Your Creatorske plan, payment method, and invoice history.');
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const { billing, invoices, invoiceRows, invoicePdfUrl } = useBrandBilling();
  const billingData = useDemoFallback(billing, DEMO_BRAND_BILLING);
  const invoiceData = useDemoFallback(invoices, DEMO_BRAND_BILLING.invoices);

  const plan = billingData.data?.plan ?? null;
  const method = billingData.data?.paymentMethod ?? null;
  const rows = useMemo(() => (Array.isArray(invoiceData.data) ? invoiceData.data : invoiceData.data?.invoices ?? []), [invoiceData.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((inv) => {
      if (filter === 'paid' && inv.status !== 'paid') return false;
      if (filter === 'open' && !['due', 'overdue'].includes(inv.status)) return false;
      if (filter === 'refunded' && inv.status !== 'refunded') return false;
      if (q && !`${inv.number} ${inv.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filter, query]);

  const totals = useMemo(() => {
    const paid = rows.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount ?? 0), 0);
    const open = rows.filter((i) => ['due', 'overdue'].includes(i.status)).reduce((s, i) => s + Number(i.amount ?? 0), 0);
    const now = new Date();
    const thisMonth = rows.filter((i) => monthKey(i.issuedAt) === `${now.getFullYear()}-${now.getMonth()}` && i.status !== 'refunded' && i.status !== 'void')
      .reduce((s, i) => s + Number(i.amount ?? 0), 0);
    return { paid, open, thisMonth, openCount: rows.filter((i) => ['due', 'overdue'].includes(i.status)).length };
  }, [rows]);

  // Spend by month, split campaign vs platform fee (plan charges).
  const spendRows = useMemo(() => {
    const months = new Map();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.set(`${d.getFullYear()}-${d.getMonth()}`, { label: d.toLocaleDateString('en-KE', { month: 'short' }), campaigns: 0, fees: 0 });
    }
    for (const inv of rows) {
      const row = months.get(monthKey(inv.issuedAt));
      if (!row || inv.status === 'refunded' || inv.status === 'void') continue;
      if (/plan|subscription|fee/i.test(inv.description ?? '')) row.fees += Number(inv.amount ?? 0);
      else row.campaigns += Number(inv.amount ?? 0);
    }
    return [...months.values()];
  }, [rows]);

  function download(inv) {
    if (invoiceData.isDemo) { toast.info('PDF downloads need the invoices endpoint. This is sample data.'); return; }
    window.open(invoicePdfUrl(inv.id), '_blank', 'noopener');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>Billing & invoices{(billingData.isDemo || invoiceData.isDemo) && <DemoTag />}</h1>
          <p className="page-subtitle">Your plan, payment method, and every charge on the account.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/brand/transactions')}>
          <IconReceipt2 className="icon-sm" aria-hidden="true" />Transaction history
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 'var(--space-16)' }}>
        <div className="stat-card">
          <div className="stat-card-label">Charged this month</div>
          <div className="stat-card-value">{invoiceData.isLoading ? <Skeleton width={90} height={26} /> : formatCurrency(totals.thisMonth)}</div>
          <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>campaigns + plan</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Outstanding</div>
          <div className="stat-card-value" style={{ color: totals.open ? 'var(--status-error-text)' : undefined }}>{invoiceData.isLoading ? <Skeleton width={90} height={26} /> : formatCurrency(totals.open)}</div>
          <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>{totals.openCount} {totals.openCount === 1 ? 'invoice' : 'invoices'} due</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Paid all time</div>
          <div className="stat-card-value">{invoiceData.isLoading ? <Skeleton width={90} height={26} /> : formatCurrency(totals.paid)}</div>
          <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>{rows.filter((i) => i.status === 'paid').length} settled invoices</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-16)', alignItems: 'start' }}>
        {/* Plan + payment method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          <section className="card card-p-md">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Your plan</h2>
            {billingData.isLoading ? (
              <Skeleton width="100%" height={72} />
            ) : billing.isError && !billingData.isDemo ? (
              <ErrorState size="sm" title="Couldn't load your plan" onRetry={billing.refetch} />
            ) : plan ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--black)' }}>{plan.name}</span>
                  <span className={`tag ${plan.status === 'active' ? 'tag-success' : 'tag-warning'}`}>{plan.status === 'active' ? 'Active' : plan.status}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--grey-600)' }}>{formatCurrency(plan.price)} / {plan.interval}{plan.renewsAt ? ` · renews ${formatDate(plan.renewsAt)}` : ''}</div>
                <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-16)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pricing')}>Change plan</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/brand/settings')}>Manage</button>
                </div>
              </>
            ) : (
              <EmptyState size="sm" icon={<IconFileInvoice />} title="No plan yet" description="Pick a plan to unlock campaign tools." action={<button className="btn btn-purple btn-sm" onClick={() => navigate('/pricing')}>See plans</button>} />
            )}
          </section>

          <section className="card card-p-md">
            <h2 className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Payment method</h2>
            {billingData.isLoading ? (
              <Skeleton width="100%" height={48} />
            ) : method ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                <div style={{ width: 40, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--grey-50)', border: '0.5px solid var(--grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCreditCard className="icon-md" style={{ color: 'var(--grey-600)' }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)' }}>{method.brand ?? method.type} ···· {method.last4}</div>
                  <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>{method.expiry ? `Expires ${method.expiry}` : method.type}</div>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={() => navigate('/brand/settings')}>Update</button>
              </div>
            ) : (
              <EmptyState size="sm" icon={<IconCreditCard />} title="No payment method" description="Add a card or M-Pesa number in Settings." action={<button className="btn btn-secondary btn-sm" onClick={() => navigate('/brand/settings')}>Add method</button>} />
            )}
          </section>
        </div>

        {/* Spend by month - stacked columns: campaigns vs platform fees */}
        <ChartFrame
          className="lg:col-span-2"
          title="Charges by month"
          subtitle="Campaign payments vs plan fees, last 6 months"
          legend={[{ label: 'Campaign payments', color: SERIES[0] }, { label: 'Plan & fees', color: SERIES[1] }]}
          loading={invoiceData.isLoading}
          error={!invoiceData.isDemo && invoices.isError}
          empty={spendRows.every((r) => !r.campaigns && !r.fees)}
          emptyTitle="No charges yet"
          emptyDescription="Invoices will chart here as campaigns are booked."
          demo={invoiceData.isDemo}
          height={220}
        >
          <BarChart data={spendRows} series={[{ key: 'campaigns', label: 'Campaign payments' }, { key: 'fees', label: 'Plan & fees' }]} stacked format={kes} height={220} />
        </ChartFrame>
      </div>

      {/* Invoices */}
      <section className="table-wrap">
        <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
          <h2 className="section-title">Invoices</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
            <div className="tabs" role="tablist" aria-label="Filter invoices">
              {FILTERS.map((f) => (
                <button key={f.id} role="tab" aria-selected={filter === f.id} className={`tab${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
              ))}
            </div>
            <div className="input-wrapper" style={{ width: 220 }}>
              <IconSearch className="icon-sm input-icon left" aria-hidden="true" />
              <input className="input input-sm input-icon-left" placeholder="Invoice number or campaign" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search invoices" />
            </div>
          </div>
        </div>

        {invoiceData.isLoading ? (
          <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={40} />)}
          </div>
        ) : invoices.isError && !invoiceData.isDemo ? (
          <ErrorState title="Couldn't load invoices" description="Invoices need the billing endpoints to be live." onRetry={invoices.refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<IconFileInvoice />} title={rows.length ? 'No invoices match' : 'No invoices yet'} description={rows.length ? 'Try a different filter or search.' : 'Your first campaign booking or plan charge will create one.'} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 680 }}>
              <thead>
                <tr><th>Invoice</th><th>Issued</th><th>Description</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const tag = STATUS_TAG[inv.status] ?? STATUS_TAG.due;
                  return (
                    <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => setPreviewInvoice(inv)}>
                      <td style={{ fontWeight: 500, color: 'var(--black)', fontVariantNumeric: 'tabular-nums' }}>{inv.number ?? inv.id}</td>
                      <td>{formatDate(inv.issuedAt)}</td>
                      <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.description}</td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--black)', fontWeight: 500 }}>{formatCurrency(inv.amount)}</td>
                      <td><span className={`tag ${tag.cls}`}>{tag.label}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost btn-xs" onClick={(e) => { e.stopPropagation(); download(inv); }}>
                          <IconDownload className="icon-xs" aria-hidden="true" />PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={!!previewInvoice} onClose={() => setPreviewInvoice(null)} title={previewInvoice ? `Invoice ${previewInvoice.number ?? previewInvoice.id}` : ''} size="sm">
        {previewInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', fontSize: 13 }}>
            {[
              ['Issued', formatDate(previewInvoice.issuedAt)],
              ['Description', previewInvoice.description],
              ['Amount', formatCurrency(previewInvoice.amount)],
              ['Status', (STATUS_TAG[previewInvoice.status] ?? STATUS_TAG.due).label],
              ['Billed to', billingData.data?.billingName ?? billingData.data?.companyName ?? '-'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-16)', borderBottom: '0.5px solid var(--grey-100)', paddingBottom: 'var(--space-8)' }}>
                <span style={{ color: 'var(--grey-500)' }}>{k}</span><span style={{ color: 'var(--black)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPreviewInvoice(null)}>Close</button>
              <button className="btn btn-purple btn-sm" onClick={() => download(previewInvoice)}><IconDownload className="icon-sm" aria-hidden="true" />Download PDF</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
