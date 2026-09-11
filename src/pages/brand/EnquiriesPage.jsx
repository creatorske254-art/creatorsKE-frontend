import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEnquiries, EnquiryCard, EnquiryDetail, EnquiryPipeline } from '@/features/enquiry'
import { ENQUIRY_CSS } from '@/features/enquiry/constants/enquiryStyles'
import { usePageMeta } from '@/lib/usePageMeta'

/**
 * EnquiriesPage — brand side. Mirrors the creator page structurally
 * (same shared ENQUIRY_CSS/components), but read-only: a brand can't
 * accept/decline its own outgoing enquiry.
 */

const PAGE_CSS = `
  .enq-bento-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1.4fr;
    grid-template-areas:
      "s1   s2   s3   s4"
      "list list list side";
    gap: var(--space-16);
  }
  .enq-list-area { grid-area: list; display: flex; flex-direction: column; gap: var(--space-10); }
  .enq-side-area { grid-area: side; }

  @media (max-width: 900px) {
    .enq-bento-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas:
        "s1 s2"
        "s3 s4"
        "list list"
        "side side";
    }
  }
  @media (max-width: 560px) {
    .enq-bento-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        "s1"
        "s2"
        "s3"
        "s4"
        "list"
        "side";
    }
  }
`

export default function EnquiriesPage() {
  usePageMeta('Enquiries', 'Track enquiries you have sent to creators and chat with them on Creatorske.');
  const { enquiries, pipelineCounts, isLoading, error } = useEnquiries()
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!selectedId && enquiries.length > 0) {
      setSelectedId(enquiries[0].id)
    }
  }, [selectedId, enquiries])

  const selectedEnquiry = enquiries.find((e) => e.id === selectedId) ?? null

  return (
    <div style={{ flex: 1, padding: 'var(--space-28)', overflowY: 'auto', minWidth: 0, width: '100%' }}>
      <style>{ENQUIRY_CSS}</style>
      <style>{PAGE_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-24)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
        <div>
          <h3 style={{ margin: 0 }}>Enquiries</h3>
          <p className="text-body-sm" style={{ color: 'var(--grey-600)', marginTop: 2 }}>
            Track enquiries you've sent to creators and chat with them here.
          </p>
        </div>
      </div>

      {error ? (
        <div className="card card-p-lg" style={{ textAlign: 'center', color: 'var(--grey-500)' }}>
          Couldn't load your enquiries. Please try again later.
        </div>
      ) : (
        <div className="enq-bento-grid">
          <EnquiryPipeline pipelineCounts={pipelineCounts} />

          <div className="enq-list-area">
            {isLoading ? (
              <div className="enq-empty">Loading enquiries…</div>
            ) : enquiries.length === 0 ? (
              <div className="enq-empty">
                You haven't sent any enquiries yet.
                <br />
                <Link to="/directory" className="btn btn-purple btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>
                  Browse creators
                </Link>
              </div>
            ) : (
              enquiries.map((enq) => (
                <EnquiryCard
                  key={enq.id}
                  enquiry={enq}
                  selected={enq.id === selectedId}
                  onSelect={() => setSelectedId(enq.id)}
                  variant="brand"
                />
              ))
            )}
          </div>

          <div className="enq-side-area">
            <EnquiryDetail enquiry={selectedEnquiry} isLoading={isLoading} variant="brand" />
          </div>
        </div>
      )}
    </div>
  )
}
