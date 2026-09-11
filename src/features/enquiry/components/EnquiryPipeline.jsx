const TILES = [
  { key: 'new', label: 'New', dot: 'var(--status-warning)' },
  { key: 'in_review', label: 'In review', dot: 'var(--purple-600)' },
  { key: 'booked', label: 'Booked', dot: 'var(--status-success)' },
  { key: 'completed', label: 'Completed', dot: 'var(--grey-400)' },
];

/**
 * Status summary tiles. Expects to be rendered inside a grid whose areas are
 * named s1..s4 (see each page's own bento-grid layout CSS) — kept a plain
 * fragment rather than owning the grid itself so callers control layout.
 */
export default function EnquiryPipeline({ pipelineCounts }) {
  return (
    <>
      {TILES.map((t, i) => (
        <div className="stat-card" key={t.key} style={{ gridArea: `s${i + 1}` }}>
          <div className="stat-card-label">
            <span className="sdot" style={{ background: t.dot }} />
            {t.label}
          </div>
          <div className="stat-card-value" style={{ fontSize: 24 }}>
            {pipelineCounts?.[t.key] ?? 0}
          </div>
        </div>
      ))}
    </>
  );
}
