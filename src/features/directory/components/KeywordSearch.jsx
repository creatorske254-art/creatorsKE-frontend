import { IconSearch, IconX } from '@tabler/icons-react';

/**
 * Debounced free-text search input.
 * The debounce lives in useDirectory; this component is purely presentational.
 *
 * @param {string}   value      - current keyword value
 * @param {function} onChange   - called with the new string on every keystroke
 */
export default function KeywordSearch({ value, onChange }) {
  return (
    <div className="relative w-full">
      <IconSearch
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--grey-400)] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, handle, or keyword…"
        className="w-full pl-9 pr-9 py-[9px] rounded-[999px] border border-[0.5px] border-[var(--grey-200)] bg-white text-sm font-[var(--font-body)] text-[var(--black)] outline-none transition-all placeholder:text-[var(--grey-300)] focus:border-[var(--purple-400)] focus:shadow-[0_0_0_3px_rgba(84,69,232,0.08)]"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--grey-400)] hover:text-[var(--black)] transition-colors"
          aria-label="Clear search"
        >
          <IconX size={14} />
        </button>
      )}
    </div>
  );
}
