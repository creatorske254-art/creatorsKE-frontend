/**
 * Marks a block that is showing sample data. Only ever rendered when
 * `useDemoFallback` (src/lib/useDemoFallback.js) has swapped in its sample -
 * which it does in dev builds alone, when the backend can't serve the query.
 * Never fabricate a figure without this tag next to it.
 */
export default function DemoTag() {
  return <span className="tag tag-default" style={{ fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>Demo data</span>;
}
