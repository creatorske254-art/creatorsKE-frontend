import { Link } from 'react-router-dom';
import { IconBrandInstagram, IconBrandTiktok, IconBrandYoutube, IconBrandX } from '@tabler/icons-react';
import AvailabilityBadge from '@/components/shared/AvailabilityBadge';
import { formatCount as formatNumber } from '@/lib/utils';

const PLATFORM_ICONS = {
  Instagram: IconBrandInstagram,
  TikTok: IconBrandTiktok,
  YouTube: IconBrandYoutube,
  'Twitter / X': IconBrandX,
};

/**
 * Creator directory card.
 *
 * @param {Object} creator - {
 *   id, handle, displayName, niche, avatar, initials,
 *   platforms: [{ name, followers }],
 *   availability: 'OPEN' | 'LIMITED' | 'FULLY_BOOKED',
 *   startingPrice: number,
 *   location: string,
 * }
 */
export default function CreatorCard({ creator }) {
  const {
    handle,
    displayName,
    niche,
    initials,
    platforms = [],
    availability,
    startingPrice,
    location,
  } = creator;

  const primaryPlatform = platforms[0];
  const otherPlatforms  = platforms.slice(1, 3);

  return (
    <div className="bg-white border border-[0.5px] border-[var(--grey-100)] rounded-[12px] transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-px overflow-hidden">

      {/* Top accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--purple-400)] to-[var(--purple-300)]" />

      <div className="p-5">

        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-[var(--purple-100)] flex items-center justify-center text-[15px] font-semibold text-[var(--purple-600)] font-[var(--font-display)] flex-shrink-0 border border-[1.5px] border-[var(--purple-200)]">
              {initials}
            </div>
            <div>
              <div className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--black)] leading-tight">
                {displayName}
              </div>
              <div className="text-[12px] text-[var(--grey-400)] mt-0.5">@{handle}</div>
            </div>
          </div>
          <AvailabilityBadge status={availability} />
        </div>

        {/* Niche + location */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center text-[11px] font-medium px-3 py-1 rounded-[999px] bg-[var(--purple-50)] text-[var(--purple-700)] border border-[0.5px] border-[var(--purple-200)]">
            {niche}
          </span>
          {location && (
            <span className="text-[11px] text-[var(--grey-400)]">{location}</span>
          )}
        </div>

        {/* Primary platform stat */}
        {primaryPlatform && (
          <div className="bg-[var(--grey-50)] rounded-[8px] px-3 py-3 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[12px] text-[var(--grey-600)]">
              {(() => {
                const Icon = PLATFORM_ICONS[primaryPlatform.name];
                return Icon ? <Icon size={14} className="text-[var(--grey-500)]" /> : null;
              })()}
              {primaryPlatform.name}
            </div>
            <span className="text-[13px] font-semibold font-[var(--font-display)] text-[var(--black)]">
              {formatNumber(primaryPlatform.followers)}
            </span>
          </div>
        )}

        {/* Other platforms */}
        {otherPlatforms.length > 0 && (
          <div className="flex gap-2 mb-4">
            {otherPlatforms.map((p) => {
              const Icon = PLATFORM_ICONS[p.name];
              return (
                <div
                  key={p.name}
                  className="flex items-center gap-2 text-[11px] text-[var(--grey-500)] bg-white border border-[0.5px] border-[var(--grey-200)] rounded-[6px] px-2 py-1"
                >
                  {Icon && <Icon size={12} />}
                  {formatNumber(p.followers)}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--grey-100)]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--grey-400)] font-medium mb-0.5">
              Starting from
            </div>
            <div className="font-[var(--font-display)] text-[16px] font-semibold text-[var(--black)]">
              {startingPrice ? `KES ${startingPrice.toLocaleString()}` : 'View card'}
            </div>
          </div>
          <Link
            to={`/c/${handle}`}
            className="inline-flex items-center justify-content gap-2 px-4 py-2 rounded-[8px] bg-[var(--black)] text-white text-[13px] font-medium transition-all hover:bg-[var(--grey-800)] hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
          >
            View card
          </Link>
        </div>

      </div>
    </div>
  );
}
