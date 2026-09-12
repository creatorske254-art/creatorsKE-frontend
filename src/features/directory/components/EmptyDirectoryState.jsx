import { IconSearch, IconRefresh } from '@tabler/icons-react';
import EmptyState from '@/components/shared/EmptyState';

/**
 * Shown when the directory search returns no results.
 *
 * @param {function} onReset - clears all active filters
 */
export default function EmptyDirectoryState({ onReset }) {
  return (
    <EmptyState
      icon={<IconSearch size={22} />}
      title="No creators found"
      description="Try adjusting your filters or search term. There may be creators in a different niche or platform that fit your brief."
      action={
        <button
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 4 }}
        >
          <IconRefresh size={14} />
          Clear all filters
        </button>
      }
    />
  );
}
