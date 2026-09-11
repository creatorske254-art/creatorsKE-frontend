import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '@/lib/usePageMeta';
import { IconCheck, IconMinus, IconArrowRight } from '@tabler/icons-react';
import { BRAND_PRICING_TIERS, CREATOR_PRICING_TIERS } from '@/features/plans/constants/pricingTiers';
import { formatCurrency } from '@/lib/utils';

const AUDIENCES = [
  { id: 'brands', label: 'For Brands', tiers: BRAND_PRICING_TIERS },
  { id: 'creators', label: 'For Creators', tiers: CREATOR_PRICING_TIERS },
];

function PricingCard({ tier }) {
  const navigate = useNavigate();
  const isFree = tier.price === 0;

  return (
    <div
      className={`rounded-[16px] p-6 flex flex-col transition-all ${
        tier.featured
          ? 'bg-[var(--purple-50)] border-[1.5px] border-[var(--purple-300)] shadow-[var(--shadow-md)]'
          : 'bg-white border border-[0.5px] border-[var(--grey-100)]'
      }`}
    >
      {tier.featured && (
        <span className="self-start text-[9px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-[999px] bg-[var(--purple-500)] text-white mb-3">
          Most popular
        </span>
      )}

      <div className="text-[16px] font-semibold text-[var(--black)] mb-1">{tier.name}</div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="font-[var(--font-display)] text-[32px] font-semibold text-[var(--black)]">
          {isFree ? 'Free' : formatCurrency(tier.price)}
        </span>
        {!isFree && <span className="text-[12px] text-[var(--grey-400)]">/{tier.cadence.replace('per ', '')}</span>}
      </div>
      <div className="text-[12px] text-[var(--grey-400)] mb-5">
        {isFree ? 'No credit card needed' : 'Billed monthly, cancel anytime'}
      </div>

      <button
        type="button"
        onClick={() => navigate('/signup')}
        className={`w-full mb-6 flex items-center justify-center gap-1.5 px-5 py-3 rounded-[8px] text-[13.5px] font-medium transition-all ${
          tier.featured
            ? 'bg-[var(--purple-600)] text-white hover:bg-[var(--purple-700)]'
            : 'bg-[var(--black)] text-white hover:opacity-90'
        }`}
      >
        {isFree ? 'Get started free' : 'Get started'} <IconArrowRight size={14} />
      </button>

      <div className="flex flex-col gap-2.5">
        {tier.features.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-[12.5px] text-[var(--grey-700)] leading-[1.5]">
            <IconCheck size={14} className="text-[var(--purple-500)] flex-shrink-0 mt-0.5" />
            {f}
          </div>
        ))}
        {tier.limitations?.map((l, i) => (
          <div key={i} className="flex items-start gap-2 text-[12.5px] text-[var(--grey-400)] leading-[1.5]">
            <IconMinus size={14} className="text-[var(--grey-300)] flex-shrink-0 mt-0.5" />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingPage() {
  usePageMeta('Pricing', 'Simple, transparent pricing for creators and brands on Creatorske. Start free, upgrade only when you need to.');
  const navigate = useNavigate();
  const [audience, setAudience] = useState('brands');
  const active = AUDIENCES.find((a) => a.id === audience);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">
      <style>{`
        .pr-nav-link { font-size:13px; color:var(--grey-600); padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:500; background:none; border:none; font-family:var(--font-body); transition:all .15s; }
        .pr-nav-link:hover { color:var(--black); background:var(--grey-50); }
        .pr-nav-link.active { color:var(--black); background:var(--grey-100); }
        .pr-btn-ghost { background:transparent; color:var(--grey-600); border-radius:8px; font-size:13px; padding:7px 16px; border:0.5px solid var(--grey-200); cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .pr-btn-ghost:hover { color:var(--black); border-color:var(--grey-400); background:var(--grey-50); }
        .pr-btn-purple { background:var(--purple-600); color:#fff; border-radius:8px; font-size:13px; padding:7px 16px; border:none; cursor:pointer; font-family:var(--font-body); font-weight:500; transition:all .15s; }
        .pr-btn-purple:hover { background:var(--purple-700); }
        .pr-toggle { display:inline-flex; background:var(--white); border:0.5px solid var(--grey-200); border-radius:999px; padding:4px; gap:2px; }
        .pr-toggle-btn { border:none; background:none; padding:9px 22px; border-radius:999px; font-size:13.5px; font-weight:500; color:var(--grey-500); cursor:pointer; font-family:var(--font-body); transition:all .15s; }
        .pr-toggle-btn.active { background:var(--black); color:#fff; }
      `}</style>

      {/* Nav */}
      <nav className="h-[60px] flex items-center justify-between px-10 border-b border-[0.5px] border-[var(--grey-100)] bg-white/[0.92] backdrop-blur-md sticky top-0 z-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-[var(--font-display)] text-[20px] font-semibold tracking-[-0.01em] text-[var(--black)]"
        >
          Creatorske<span className="text-[var(--purple-500)]">.</span>
        </button>
        <div className="hidden md:flex gap-1">
          <button className="pr-nav-link" onClick={() => navigate('/directory')}>Browse creators</button>
          <button className="pr-nav-link active" onClick={() => navigate('/pricing')}>Pricing</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="pr-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
          <button className="pr-btn-purple" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-[720px] mx-auto text-center px-8 pt-16 pb-10">
        <h1 className="font-[var(--font-display)] text-[28px] sm:text-[36px] font-semibold tracking-[-0.02em] text-[var(--black)] mb-3 leading-[1.15]">
          Simple pricing, for every stage
        </h1>
        <p className="text-[15px] text-[var(--grey-500)] leading-[1.6] mb-8">
          Whether you're a brand booking creators or a creator getting booked, start free and upgrade only when you need to.
        </p>

        <div className="pr-toggle">
          {AUDIENCES.map((a) => (
            <button
              key={a.id}
              className={`pr-toggle-btn${audience === a.id ? ' active' : ''}`}
              onClick={() => setAudience(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing grid */}
      <div className="max-w-[1080px] w-full mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {active.tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>

        <p className="text-center text-[12px] text-[var(--grey-400)] mt-8">
          All prices in Kenyan Shillings (KES). You can switch plans or cancel anytime from Settings.
        </p>
      </div>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-[0.5px] border-[var(--grey-100)] bg-white flex items-center justify-between flex-wrap gap-2 text-[12px] text-[var(--grey-400)] mt-auto">
        <div className="font-[var(--font-display)] text-[14px] text-[var(--black)]">
          Creatorske<span className="text-[var(--purple-500)]">.</span>
        </div>
        <div>© 2026 Creatorske. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-[var(--black)]">Privacy</a>
          <a href="#" className="hover:text-[var(--black)]">Terms</a>
        </div>
      </footer>
    </div>
  );
}
