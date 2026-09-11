import { IconSearch, IconRefresh } from '@tabler/icons-react';

/**
 * Shown when the directory search returns no results.
 *
 * @param {function} onReset - clears all active filters
 */
export default function EmptyDirectoryState({ onReset }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-[16px] bg-[var(--grey-50)] border border-[0.5px] border-[var(--grey-100)] flex items-center justify-content-center mb-4 flex items-center justify-center">
        <IconSearch size={24} className="text-[var(--grey-400)]" />
      </div>
      <h3 className="font-[var(--font-display)] text-[17px] font-semibold text-[var(--black)] mb-2">
        No creators found
      </h3>
      <p className="text-[13px] text-[var(--grey-500)] max-w-[280px] leading-[1.65] mb-6">
        Try adjusting your filters or search term. There may be creators in a different niche or platform that fit your brief.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] border border-[0.5px] border-[var(--grey-300)] bg-white text-[13px] font-medium text-[var(--black)] transition-all hover:border-[var(--black)] hover:bg-[var(--grey-50)]"
      >
        <IconRefresh size={14} />
        Clear all filters
      </button>
    </div>
  );
}
