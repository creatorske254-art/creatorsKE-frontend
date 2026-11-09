import { IconChevronDown, IconChevronUp, IconPin } from '@tabler/icons-react';
import { formatCurrency } from '@/lib/utils';

export default function RateCard({ rateCard, collapsed = false, onToggle, compact = false }) {
  const packages = rateCard?.packages ?? [];

  return (
    <section className={`w-full rounded-2xl border border-[#DDEDE3] bg-white ${compact ? 'p-3' : 'p-4 shadow-sm'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <IconPin className="icon-sm shrink-0 text-[#00A651]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900">Rate Card</p>
            <p className="truncate text-[11px] text-slate-500">{rateCard?.creatorName || 'Creator'}</p>
          </div>
        </div>
        {onToggle && (
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand rate card' : 'Collapse rate card'}
            aria-expanded={!collapsed}
          >
            {collapsed
              ? <IconChevronDown className="icon-sm" aria-hidden="true" />
              : <IconChevronUp className="icon-sm" aria-hidden="true" />}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {packages.map((item) => (
            <div
              key={item.id ?? item.name}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                String(item.id) === String(rateCard?.selectedPackageId) ? 'bg-[#F0FAF4]' : 'bg-slate-50'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-800">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{item.description}</p>
                )}
              </div>
              <span className="shrink-0 text-xs font-semibold text-[#008F45]">
                {item.price ? formatCurrency(item.price) : 'Ask for price'}
              </span>
            </div>
          ))}
          {packages.length === 0 && (
            <p className="text-xs text-slate-500">No services added yet.</p>
          )}
        </div>
      )}
    </section>
  );
}
