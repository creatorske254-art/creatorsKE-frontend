import { useState, useEffect } from 'react'
import { useEnquiries, EnquiryCard, EnquiryCardSkeleton, EnquiryDetail, EnquiryPipeline } from '@/features/enquiry'
import { ENQUIRY_CSS } from '@/features/enquiry/constants/enquiryStyles'
import { usePageMeta } from '@/lib/usePageMeta'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'
import { IconInbox } from '@tabler/icons-react';

/**
 * EnquiriesPage - creator side. Layout/visual language kept from the
 * original prototype (bento grid, .enq-* classes); the data source and the
 * detail panel's internals are now real (useEnquiries + EnquiryDetail),
 * replacing the previous hardcoded mock list and static detail panel.
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
  .enq-list-area { grid-area: list; display: flex; flex-direction: column; gap: var(--space-12); }
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
  usePageMeta('Enquiries', 'Manage incoming brand enquiries and bookings on Creatorske.');
  const { enquiries, pipelineCounts, isLoading, error, refetch, accept, decline } = useEnquiries()
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!selectedId && enquiries.length > 0) {
      setSelectedId(enquiries[0].id)
    }
  }, [selectedId, enquiries])

  const selectedEnquiry = enquiries.find((e) => e.id === selectedId) ?? null

  return (
    <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
      <style>{ENQUIRY_CSS}</style>
      <style>{PAGE_CSS}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-24)', flexWrap: 'wrap', gap: 'var(--space-12)' }}>
        <div>
          <h3 className="page-title">Enquiries</h3>
          <p className="page-subtitle">
            Manage incoming brand requests and bookings.
          </p>
        </div>
      </div>

      {error ? (
        <div className="card">
          <ErrorState
            title="Couldn't load your enquiries"
            description="Something went wrong fetching your enquiries. Please try again."
            onRetry={refetch}
          />
        </div>
      ) : (
        <div className="enq-bento-grid">
          <EnquiryPipeline pipelineCounts={pipelineCounts} />

          <div className="enq-list-area">
            {isLoading ? (
              [0, 1, 2].map((i) => <EnquiryCardSkeleton key={i} />)
            ) : enquiries.length === 0 ? (
              <EmptyState
                icon={<IconInbox />}
                title="No enquiries yet"
                description="They'll show up here once a brand reaches out about your rate card."
              />
            ) : (
              enquiries.map((enq) => (
                <EnquiryCard
                  key={enq.id}
                  enquiry={enq}
                  selected={enq.id === selectedId}
                  onSelect={() => setSelectedId(enq.id)}
                  variant="creator"
                />
              ))
            )}
          </div>

          <div className="enq-side-area">
            <EnquiryDetail
              enquiry={selectedEnquiry}
              isLoading={isLoading}
              variant="creator"
              onAccept={() => accept(selectedId)}
              onDecline={() => decline(selectedId)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
