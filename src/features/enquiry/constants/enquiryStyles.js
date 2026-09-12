// Shared enquiry card/detail visual language - lifted out of the original
// EnquiriesPage.jsx prototype so the creator and brand enquiries pages (and
// any future embedding, e.g. a shortlist drawer) render identically without
// copy-pasting the same class definitions. Page-specific layout (bento grid
// areas, breakpoints) stays local to each page - this is only the reusable
// card/detail/pkg/message/meta/actions styling.
export const ENQUIRY_CSS = `
  /* Enquiry card (list item) */
  .enq-card {
    background: var(--white);
    border: 0.5px solid var(--grey-100);
    border-radius: var(--radius-xl);
    padding: var(--space-16);
    transition: all var(--transition-fast);
    cursor: pointer;
  }
  .enq-card:hover { border-color: var(--grey-300); transform: translateY(-1px); }
  .enq-card.selected { border-color: var(--purple-200); background: var(--purple-50); }
  .enq-card-row { display: flex; align-items: flex-start; gap: var(--space-12); }
  .enq-card-body { flex: 1; min-width: 0; }
  .enq-card-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); flex-wrap: wrap; }
  .enq-card-name { font-size: 13.5px; font-weight: 600; color: var(--black); }
  .enq-card-service { font-size: 12px; color: var(--grey-400); margin-top: var(--space-2); }
  .enq-card-time { font-size: 11.5px; color: var(--grey-400); margin-top: var(--space-4); }

  /* Detail panel */
  .enq-detail { position: sticky; top: var(--space-24); }
  .enq-detail-head {
    display: flex;
    align-items: center;
    gap: var(--space-12);
    margin-bottom: var(--space-16);
    padding-bottom: var(--space-16);
    border-bottom: 0.5px solid var(--grey-100);
  }
  .enq-detail-name { font-family: var(--font-display); font-size: var(--text-h4-size); font-weight: var(--text-h4-weight); color: var(--black); }
  .enq-detail-email { font-size: 12px; color: var(--grey-400); margin-top: var(--space-2); }
  .enq-eyebrow { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--grey-400); margin-bottom: var(--space-8); }

  .enq-pkg { background: var(--purple-50); border: 0.5px solid var(--purple-200); border-radius: var(--radius-lg); padding: var(--space-16); margin-bottom: var(--space-16); }
  .enq-pkg-row { display: flex; align-items: center; justify-content: space-between; }
  .enq-pkg-name { font-size: 14px; font-weight: 600; color: var(--black); }
  .enq-pkg-sub { font-size: 11.5px; color: var(--grey-400); margin-top: var(--space-2); }
  .enq-pkg-price { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--purple-600); white-space: nowrap; flex-shrink: 0; margin-left: var(--space-12); }

  .enq-message-wrap { margin-bottom: var(--space-16); }
  .enq-message { font-size: 13px; color: var(--grey-600); line-height: 1.65; background: var(--page-bg); border-radius: var(--radius-md); padding: var(--space-12) var(--space-16); }

  .enq-meta { display: flex; flex-direction: column; gap: var(--space-8); margin-bottom: var(--space-16); font-size: 12.5px; }
  .enq-meta-row { display: flex; justify-content: space-between; color: var(--grey-400); }
  .enq-meta-val { font-weight: 500; color: var(--black); }

  .enq-actions { display: flex; flex-direction: column; gap: var(--space-8); }
`;
