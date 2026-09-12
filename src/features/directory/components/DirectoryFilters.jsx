import { NICHES, PLATFORMS, FOLLOWER_RANGES, AVAILABILITY_OPTIONS } from '../constants/filters';
import Select from '@/components/ui/Select';

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

  return (
    <div className="flex flex-wrap gap-3 items-center">

      {/* Niche */}
      <Select
        variant="pill"
        aria-label="Niche"
        value={filters.niche}
        onChange={(v) => updateFilter('niche', v)}
        options={[{ value: '', label: 'All niches' }, ...niches.map((n) => ({ value: n, label: n }))]}
        style={{ minWidth: 148 }}
      />

      {/* Platform */}
      <Select
        variant="pill"
        aria-label="Platform"
        value={filters.platform}
        onChange={(v) => updateFilter('platform', v)}
        options={[{ value: '', label: 'All platforms' }, ...platforms.map((p) => ({ value: p, label: p }))]}
        style={{ minWidth: 140 }}
      />

      {/* Follower range */}
      <Select
        variant="pill"
        aria-label="Follower range"
        value={filters.followerRange}
        onChange={(v) => updateFilter('followerRange', v)}
        options={FOLLOWER_RANGES}
        style={{ minWidth: 172 }}
      />

      {/* Location */}
      <input
        type="text"
        value={filters.location}
        onChange={(e) => updateFilter('location', e.target.value)}
        placeholder="e.g. Nairobi, Kenya"
        className="bg-white border border-[0.5px] border-[var(--grey-200)] rounded-[8px] px-3 py-2 text-sm font-[var(--font-body)] text-[var(--black)] outline-none placeholder:text-[var(--grey-300)] focus:border-[var(--purple-400)] focus:shadow-[0_0_0_3px_rgba(84,69,232,0.08)] transition-all"
        style={{ minWidth: 130 }}
      />

      {/* Availability */}
      <Select
        variant="pill"
        aria-label="Availability"
        value={filters.availability}
        onChange={(v) => updateFilter('availability', v)}
        options={AVAILABILITY_OPTIONS}
        style={{ minWidth: 148 }}
      />

    </div>
  );
}
