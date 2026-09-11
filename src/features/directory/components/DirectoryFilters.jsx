import { NICHES, PLATFORMS, FOLLOWER_RANGES, AVAILABILITY_OPTIONS } from '../constants/filters';

/**
 * Filter bar for the creator directory.
 *
 * @param {Object}   filters      - current filter state from useDirectory
 * @param {function} updateFilter - (key, value) => void
 * @param {Object}   filterOptions - { niches, platforms } from the backend (used as fallback to static constants)
 */
export default function DirectoryFilters({ filters, updateFilter, filterOptions }) {
  const niches    = filterOptions?.niches?.length    ? filterOptions.niches    : NICHES;
  const platforms = filterOptions?.platforms?.length ? filterOptions.platforms : PLATFORMS;

  const selectClass =
    'appearance-none w-full bg-white border border-[0.5px] border-[var(--grey-200)] rounded-[8px] px-3 py-[9px] pr-8 text-sm text-[var(--black)] font-[var(--font-body)] outline-none cursor-pointer transition-all focus:border-[var(--purple-400)] focus:shadow-[0_0_0_3px_rgba(84,69,232,0.08)]';

  return (
    <div className="flex flex-wrap gap-3 items-center">

      {/* Niche */}
      <div className="relative">
        <select
          value={filters.niche}
          onChange={(e) => updateFilter('niche', e.target.value)}
          className={selectClass}
          style={{ minWidth: 148 }}
        >
          <option value="">All niches</option>
          {niches.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--grey-400)] text-xs">▾</span>
      </div>

      {/* Platform */}
      <div className="relative">
        <select
          value={filters.platform}
          onChange={(e) => updateFilter('platform', e.target.value)}
          className={selectClass}
          style={{ minWidth: 140 }}
        >
          <option value="">All platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--grey-400)] text-xs">▾</span>
      </div>

      {/* Follower range */}
      <div className="relative">
        <select
          value={filters.followerRange}
          onChange={(e) => updateFilter('followerRange', e.target.value)}
          className={selectClass}
          style={{ minWidth: 172 }}
        >
          {FOLLOWER_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--grey-400)] text-xs">▾</span>
      </div>

      {/* Location */}
      <input
        type="text"
        value={filters.location}
        onChange={(e) => updateFilter('location', e.target.value)}
        placeholder="Location"
        className="bg-white border border-[0.5px] border-[var(--grey-200)] rounded-[8px] px-3 py-[9px] text-sm font-[var(--font-body)] text-[var(--black)] outline-none placeholder:text-[var(--grey-300)] focus:border-[var(--purple-400)] focus:shadow-[0_0_0_3px_rgba(84,69,232,0.08)] transition-all"
        style={{ minWidth: 130 }}
      />

      {/* Availability */}
      <div className="relative">
        <select
          value={filters.availability}
          onChange={(e) => updateFilter('availability', e.target.value)}
          className={selectClass}
          style={{ minWidth: 148 }}
        >
          {AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--grey-400)] text-xs">▾</span>
      </div>

    </div>
  );
}
