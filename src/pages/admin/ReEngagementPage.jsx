import { useMemo, useState } from 'react';
import { usePageMeta } from '@/lib/usePageMeta';
import { useReengagement } from '@/features/admin/hooks/useOperations';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';
import { ChartFrame, BarChart, TrendChart, Meter, SERIES } from '@/components/charts';
import { IconMailForward, IconSend, IconUsers, IconEye } from '@tabler/icons-react';

/*
   Re-engagement (admin). Creators who stalled - abandoned an onboarding
   draft, never published, went quiet, or left an enquiry unanswered - grouped
   into segments the admin can email. Each send is logged with open / click /
   reactivation counts so the copy can be judged. Backed by GET /admin/
   re-engagement and POST /admin/re-engagement/send (BACKEND_API_SPEC.md).
*/

const TEMPLATES = {
  abandoned_drafts: { subject: 'Your Creatorske rate card is 2 minutes from done', preview: 'You started a rate card on Creatorske. Brands can only find you once it is published - pick up where you left off.' },
  never_published:  { subject: 'Brands are searching - your card is still hidden', preview: 'Your rate card is complete but unpublished. One tap makes it visible in the directory.' },
  inactive_30d:     { subject: 'New brands joined Creatorske this month', preview: 'It has been a while. Here is what changed on Creatorske and who is booking creators like you.' },
  no_enquiry_reply: { subject: 'A brand is waiting to hear from you', preview: 'You have an enquiry that has been unanswered for 2 days. Brands move on fast - reply from your dashboard.' },
};

function rate(part, whole) { return whole ? Math.round((part / whole) * 100) : 0; }

export default function ReEngagementPage() {
  usePageMeta('Re-engagement', 'Segments of stalled creators and the emails sent to bring them back.');
  const [compose, setCompose] = useState(null); // segment
  const [subject, setSubject] = useState('');
  const [preview, setPreview] = useState('');

  const { query, data, send, isSending, sendingId } = useReengagement();
  const re = { data, isLoading: query.isLoading };
  const segments = re.data?.segments ?? [];
  const history = useMemo(() => [...(re.data?.history ?? [])].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)), [re.data]);
  const funnel = re.data?.abandonedByStep ?? [];

  const totals = useMemo(() => {
    const sum = (k) => history.reduce((s, h) => s + Number(h[k] ?? 0), 0);
    return { reachable: segments.reduce((s, g) => s + Number(g.count ?? 0), 0), sent: sum('recipients'), opened: sum('opened'), clicked: sum('clicked'), reactivated: sum('reactivated') };
  }, [segments, history]);

  const trendRows = useMemo(() => history.slice().reverse().map((h) => ({
    label: formatDate(h.sentAt), open: rate(h.opened, h.recipients), click: rate(h.clicked, h.recipients), reactivated: rate(h.reactivated, h.recipients),
  })), [history]);

  function openCompose(seg) {
    const t = TEMPLATES[seg.id] ?? { subject: `A note from Creatorske`, preview: '' };
    setSubject(t.subject); setPreview(t.preview); setCompose(seg);
  }
  function submit() {
    if (!compose) return;
    send({ segmentId: compose.id, label: compose.label, subject: subject.trim(), preview: preview.trim() });
    setCompose(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <div>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>Re-engagement</h1>
        <p className="page-subtitle">Creators who stalled, grouped by why, and the emails that bring them back. Open rate target is 30%.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-16)' }}>
        {[
          ['Reachable now', totals.reachable, 'across all segments', null],
          ['Open rate', `${rate(totals.opened, totals.sent)}%`, `${totals.opened.toLocaleString('en-KE')} of ${totals.sent.toLocaleString('en-KE')} sent`, rate(totals.opened, totals.sent) < 30 ? 'var(--status-warning-text)' : undefined],
          ['Click rate', `${rate(totals.clicked, totals.sent)}%`, 'came back to the app', null],
          ['Reactivated', totals.reactivated, 'published or replied after an email', null],
        ].map(([label, value, sub, color]) => (
          <div className="stat-card" key={label}>
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value" style={{ fontSize: 22, color }}>{re.isLoading ? <Skeleton width={60} height={24} /> : value}</div>
            <div className="stat-card-delta" style={{ color: 'var(--grey-500)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Segments */}
      <section>
        <h2 className="section-title" style={{ marginBottom: 'var(--space-12)' }}>Segments</h2>
        {re.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-16)' }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} width="100%" height={120} />)}</div>
        ) : query.isError ? (
          <ErrorState title="Couldn't load segments" description="This tool needs the admin/re-engagement endpoint to be live." onRetry={query.refetch} />
        ) : segments.length === 0 ? (
          <div className="card card-p-md"><EmptyState size="sm" icon={<IconUsers />} title="No one to re-engage" description="Every creator is active. Segments fill as people stall." /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-16)' }}>
            {segments.map((seg) => {
              const busy = isSending && sendingId === seg.id;
              const share = rate(seg.count, totals.reachable);
              return (
                <div key={seg.id} className="card card-p-md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-12)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>{seg.label}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--grey-500)' }}>{seg.description}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--black)', lineHeight: 1, flexShrink: 0 }}>{Number(seg.count ?? 0).toLocaleString('en-KE')}</div>
                  </div>
                  <Meter value={share} max={100} label="Share of reachable creators" />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-12)', marginTop: 'auto' }}>
                    <span className="text-hint" style={{ margin: 0 }}>{seg.lastSentAt ? `Last emailed ${formatRelativeDate(seg.lastSentAt)}` : 'Never emailed'}</span>
                    <button className={`btn btn-purple btn-sm${busy ? ' btn-loading' : ''}`} disabled={!seg.count} onClick={() => openCompose(seg)}>
                      <IconSend className="icon-sm" aria-hidden="true" />Email segment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'var(--space-16)' }}>
        <ChartFrame
          title="Email performance"
          subtitle="Per send, as a share of recipients"
          legend={[{ label: 'Opened', color: SERIES[0] }, { label: 'Clicked', color: SERIES[1] }, { label: 'Reactivated', color: SERIES[2] }]}
          loading={re.isLoading} empty={!trendRows.length} emptyTitle="No sends yet" height={200}
        >
          <TrendChart data={trendRows} series={[{ key: 'open', label: 'Opened' }, { key: 'click', label: 'Clicked' }, { key: 'reactivated', label: 'Reactivated' }]} format={(v) => `${v}%`} height={200} />
        </ChartFrame>
        <ChartFrame title="Where drafts stall" subtitle="Abandoned onboarding drafts by last completed step" loading={re.isLoading} empty={!funnel.length} emptyTitle="No abandoned drafts" height={200}>
          <BarChart data={funnel} series={[{ key: 'value', label: 'Drafts' }]} layout="horizontal" labels height={200} />
        </ChartFrame>
      </div>

      {/* Send history */}
      <section className="table-wrap">
        <div style={{ padding: 'var(--space-16) var(--space-20)', borderBottom: '0.5px solid var(--grey-100)' }}>
          <h2 className="section-title">Send history</h2>
        </div>
        {re.isLoading ? (
          <div style={{ padding: 'var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>{[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={40} />)}</div>
        ) : history.length === 0 ? (
          <EmptyState icon={<IconMailForward />} title="Nothing sent yet" description="Email a segment above and its results will be tracked here." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 640 }}>
              <thead><tr><th>Sent</th><th>Segment</th><th style={{ textAlign: 'right' }}>Recipients</th><th style={{ textAlign: 'right' }}>Opened</th><th style={{ textAlign: 'right' }}>Clicked</th><th style={{ textAlign: 'right' }}>Reactivated</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(h.sentAt)}</td>
                    <td style={{ color: 'var(--black)', fontWeight: 500 }}>{h.segment}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{h.recipients}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: rate(h.opened, h.recipients) < 30 ? 'var(--status-warning-text)' : undefined }}>{h.opened} <span style={{ color: 'var(--grey-400)' }}>({rate(h.opened, h.recipients)}%)</span></td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{h.clicked} <span style={{ color: 'var(--grey-400)' }}>({rate(h.clicked, h.recipients)}%)</span></td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--status-success-text)', fontWeight: 500 }}>{h.reactivated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={!!compose} onClose={() => setCompose(null)} title={compose ? `Email: ${compose.label}` : ''} size="md">
        {compose && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', fontSize: 13, color: 'var(--grey-600)' }}>
              <IconUsers className="icon-sm" aria-hidden="true" />Goes to <strong style={{ color: 'var(--black)' }}>{Number(compose.count).toLocaleString('en-KE')}</strong> creators, one email each, from hello@creatorske.com.
            </div>
            <div>
              <label className="field-label" htmlFor="re-subject">Subject<span className="field-required">*</span></label>
              <input id="re-subject" className="input input-md" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Your rate card is 2 minutes from done" />
            </div>
            <div>
              <label className="field-label" htmlFor="re-preview">Message<span className="field-required">*</span></label>
              <textarea id="re-preview" className="input input-md" rows={5} value={preview} onChange={(e) => setPreview(e.target.value)} placeholder="Short, personal, one clear next step." />
              <span className="field-hint">The email ends with a button back to the creator's dashboard.</span>
            </div>
            <div className="card card-p-sm" style={{ background: 'var(--page-bg)' }}>
              <div className="eyebrow" style={{ marginBottom: 'var(--space-8)' }}><IconEye className="icon-xs" aria-hidden="true" /> Preview</div>
              <div style={{ fontWeight: 600, color: 'var(--black)', fontSize: 14 }}>{subject || 'Subject'}</div>
              <div style={{ fontSize: 13, color: 'var(--grey-600)', marginTop: 'var(--space-4)', whiteSpace: 'pre-wrap' }}>{preview || 'Message body'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setCompose(null)}>Cancel</button>
              <button className="btn btn-purple btn-sm" disabled={!subject.trim() || preview.trim().length < 20} onClick={submit}><IconSend className="icon-sm" aria-hidden="true" />Send to {Number(compose.count).toLocaleString('en-KE')}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
