import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/features/reviews/services/review.service';
import ReviewResponse from '@/features/reviews/components/ReviewResponse';
import {
  IconBrandInstagram, IconBrandTiktok, IconBrandYoutube, IconBrandX,
  IconCheck, IconSend, IconShare, IconLayoutGrid,
  IconBrandWhatsapp, IconShieldCheck, IconCircleCheck, IconClock,
  IconStar, IconStarHalfFilled, IconLeaf, IconArrowRight, IconPackage,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { usePageMeta } from '@/lib/usePageMeta';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { POST_AUTH_REDIRECT_KEY } from '@/features/auth/constants/roles';
import Modal from '@/components/ui/Modal';
import { EnquiryForm } from '@/features/enquiry';
import EmptyState from '@/components/shared/EmptyState';

function openWhatsApp(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) {
    toast.error("This creator hasn't added a WhatsApp number yet.");
    return;
  }
  window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer');
}

async function shareRateCard(name) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: `${name} | Rate Card`, url });
    } catch {
      // user cancelled the native share sheet - nothing to do
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard.');
  } catch {
    toast.error('Could not copy link.');
  }
}

const PLATFORM_ICONS = {
  Instagram: IconBrandInstagram,
  TikTok: IconBrandTiktok,
  YouTube: IconBrandYoutube,
  'Twitter / X': IconBrandX,
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchRateCard(handle) {
  const res = await api.get(`/public/creators/${handle}/rate-card`);
  return res.data;
}

// ─── Small pieces ───────────────────────────────────────────────────────────

function StarRow({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <IconStar key={i} className="text-[var(--purple-500)] icon-xs" fill="currentColor" />;
        if (i === full && half) return <IconStarHalfFilled key={i} className="text-[var(--purple-500)] icon-xs" fill="currentColor" />;
        return <IconStar key={i} className="text-[var(--grey-200)] icon-xs" />;
      })}
    </div>
  );
}

function formatFollowers(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n;
}

// ─── Package card ─────────────────────────────────────────────────────────────

function PackageCard({ pkg, onEnquire }) {
  const dark = pkg.customPricing;
  return (
    <div
      className={`rounded-[16px] p-5 transition-all flex flex-col ${
        dark
          ? 'bg-[var(--black)] border border-[0.5px] border-transparent'
          : pkg.featured
            ? 'bg-[var(--purple-50)] border border-[0.5px] border-[var(--purple-200)]'
            : 'bg-white border border-[0.5px] border-[var(--grey-100)] hover:border-[var(--grey-200)] hover:shadow-[var(--shadow-sm)] hover:-translate-y-px'
      }`}
    >
      {pkg.featured && (
        <span className="self-start text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-1 rounded-[999px] bg-[var(--purple-500)] text-on-accent mb-3">
          Most popular
        </span>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <div className={`text-[16px] font-semibold ${dark ? 'text-white' : 'text-[var(--black)]'}`}>{pkg.name}</div>
        <div className="text-right flex-shrink-0">
          {pkg.customPricing ? (
            <div className="text-[15px] text-white/60">Custom pricing</div>
          ) : (
            <>
              <div className={`text-[20px] font-semibold ${pkg.featured ? 'text-[var(--purple-600)]' : 'text-[var(--black)]'}`}>
                KES {pkg.price.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--grey-400)] mt-0.5">per campaign</div>
            </>
          )}
        </div>
      </div>

      <p className={`text-[13px] leading-[1.6] mb-3 ${dark ? 'text-white/55' : 'text-[var(--grey-500)]'}`}>{pkg.description}</p>

      {pkg.deliverables?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pkg.deliverables.map((d, i) => (
            <span
              key={i}
              className={`text-[11px] px-3 py-1 rounded-[4px] border border-[0.5px] ${
                dark
                  ? 'bg-white/[0.08] border-white/[0.12] text-white/60'
                  : pkg.featured
                    ? 'bg-[var(--purple-100)] border-[var(--purple-200)] text-[var(--purple-700)]'
                    : 'bg-[var(--grey-50)] border-[var(--grey-100)] text-[var(--grey-600)]'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      )}

      {onEnquire && (
        <button
          type="button"
          onClick={() => onEnquire(pkg)}
          className={`mt-3 self-start inline-flex items-center gap-2 text-[12.5px] font-medium px-3 py-2 rounded-[8px] transition-all ${
            dark
              ? 'bg-white/[0.1] text-white hover:bg-white/[0.16]'
              : 'bg-[var(--purple-500)] text-on-accent hover:opacity-90'
          }`}
        >
          <IconSend className="icon-xs" /> Enquire about this
        </button>
      )}
    </div>
  );
}

// ─── Review card ────────────────────────────────────────────────────────────

function ReviewCard({ review, canReply, onReply, isReplying }) {
  return (
    <div className="bg-white border border-[0.5px] border-[var(--grey-100)] rounded-[12px] p-4 mb-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-[var(--grey-100)] flex items-center justify-center text-[12px] font-semibold text-[var(--grey-600)] flex-shrink-0">
          {review.initials}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--black)]">{review.brand}</div>
          <div className="text-[11px] text-[var(--grey-400)]">{review.date}</div>
        </div>
        <div className="ml-auto"><StarRow value={review.rating} /></div>
      </div>
      <p className="text-[13px] text-[var(--grey-600)] leading-[1.65] m-0">{review.comment}</p>
      <ReviewResponse
        review={review}
        canReply={canReply}
        isSubmitting={isReplying}
        onSubmit={(text) => onReply(review.id, text)}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RateCardPage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-rate-card', handle],
    queryFn: () => fetchRateCard(handle),
    staleTime: 60_000,
  });

  const isOwnCard = isAuthenticated && user?.role === 'creator' && user?.handle === handle;
  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }) => reviewService.replyToReview(reviewId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-rate-card', handle] });
      toast.success('Reply posted.');
    },
    onError: (err) => toast.error(err?.message || 'Could not post your reply.'),
  });

  usePageMeta(
    data?.creator?.displayName ? `${data.creator.displayName} | Rate Card` : 'Creator Rate Card',
    data?.creator?.bio || "View this creator's packages, pricing, and portfolio on Creatorske."
  );

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const packages = data?.packages ?? [];

  function handleSendEnquiryClick(pkg) {
    if (!isAuthenticated) {
      const target = `/c/${handle}?enquire=1&package=${pkg.id}`;
      sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, target);
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }
    setSelectedPackage(pkg);
    setEnquiryOpen(true);
  }

  // Reopen the enquiry modal automatically after the auth round-trip.
  useEffect(() => {
    if (isAuthenticated && searchParams.get('enquire') === '1' && packages.length) {
      const pkg = packages.find((p) => String(p.id) === searchParams.get('package')) ?? packages[0];
      setSelectedPackage(pkg);
      setEnquiryOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, packages.length]);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--black)] mb-2">
            Rate card not found
          </div>
          <p className="text-[13px] text-[var(--grey-500)] mb-6">
            This creator hasn't published a rate card yet, or the link is incorrect.
          </p>
          <Link
            to="/directory"
            className="text-[13px] font-medium text-[var(--purple-500)] hover:text-[var(--purple-700)]"
          >
            Browse the directory
          </Link>
        </div>
      </div>
    );
  }

  const creator = data?.creator ?? {};
  const niches = data?.niches ?? [];
  const stats = data?.stats ?? {};
  const reviews = data?.reviews ?? [];
  const avgRating = data?.averageRating ?? 0;

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">

      {/* Public nav */}
      <nav className="h-[52px] flex items-center justify-between px-[var(--gutter-public)] border-b border-[var(--grey-100)] bg-white sticky top-0 z-10">
        <Link to="/" className="font-[var(--font-display)] text-[19px] font-semibold tracking-[-0.01em] text-[var(--black)]">
          Creatorske<span className="text-[var(--purple-500)]">.</span>
        </Link>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-[8px] bg-[var(--black)] text-white hover:opacity-90"
        >
          Create yours free
        </Link>
      </nav>

      {isLoading ? (
        <div className="max-w-[1000px] w-full mx-auto px-[var(--gutter-public)] py-12">
          <div className="flex items-start gap-6">
            <div className="skeleton w-20 h-20 flex-shrink-0" style={{ borderRadius: '50%' }} />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-6 w-1/3" />
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-14 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hero band */}
          <div className="bg-[var(--black)] text-white pt-12 relative overflow-hidden">
            <div className="max-w-[1000px] mx-auto px-[var(--gutter-public)]">
              <div className="flex items-start gap-6 flex-wrap mb-8">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--purple-400)] to-[var(--purple-800)] flex items-center justify-center text-[28px] font-semibold text-on-accent border-[2.5px] border-white/20">
                    {creator.initials}
                  </div>
                  <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-[var(--status-success)] border-2 border-[var(--black)] flex items-center justify-center">
                    <IconCheck className="text-on-accent icon-xs" />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <div className="font-[var(--font-display)] text-[28px] font-semibold tracking-[-0.02em] leading-[1.1] text-white mb-1">
                    {creator.displayName}
                  </div>
                  <div className="text-[14px] text-white/50 mb-3">@{creator.handle}</div>
                  {creator.bio && (
                    <p className="text-[14px] text-white/70 leading-[1.6] max-w-[520px] mb-4">{creator.bio}</p>
                  )}
                  {creator.platforms?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {creator.platforms.map((p) => {
                        const Icon = PLATFORM_ICONS[p.name];
                        return (
                          <div key={p.name} className="flex items-center gap-2 px-3 py-2 rounded-[999px] bg-white/[0.08] border border-[0.5px] border-white/[0.15] text-[12px] font-medium text-white/80">
                            {Icon && <Icon size={14} />}
                            {p.name} · {formatFollowers(p.followers)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                  <button
                    type="button"
                    onClick={() => handleSendEnquiryClick(selectedPackage ?? packages.find((p) => p.featured) ?? packages[0])}
                    disabled={!packages.length}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-[8px] bg-[var(--purple-500)] text-on-accent text-[13px] font-medium hover:opacity-90 hover:-translate-y-px transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <IconSend className="icon-sm" /> Send enquiry
                  </button>
                  <button
                    onClick={() => shareRateCard(creator.displayName)}
                    className="inline-flex items-center gap-2 px-5 py-[8.5px] rounded-[8px] border border-[0.5px] border-white/20 text-white/70 text-[13px] hover:bg-white/[0.06]"
                  >
                    <IconShare className="icon-sm" /> Share
                  </button>
                  <Link
                    to={`/c/${handle}/portfolio`}
                    className="inline-flex items-center gap-2 px-5 py-[8.5px] rounded-[8px] border border-[0.5px] border-white/20 text-white/70 text-[13px] hover:bg-white/[0.06]"
                  >
                    <IconLayoutGrid className="icon-sm" /> Full portfolio
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats band */}
            <div className="max-w-[1000px] mx-auto px-[var(--gutter-public)] pb-0">
              <div className="flex border-t border-white/10 flex-wrap">
                {[
                  { label: 'Avg. engagement', value: stats.avgEngagement },
                  { label: 'Total reach', value: stats.totalReach },
                  { label: 'Client rating', value: avgRating > 0 ? avgRating.toFixed(1) : null, icon: avgRating > 0 ? IconStar : null },
                  { label: 'Campaigns done', value: stats.campaignsDone },
                  { label: 'Turnaround', value: stats.turnaroundDays },
                ].filter((s) => s.value).map((s) => (
                  <div key={s.label} className="flex-1 min-w-[50%] sm:min-w-0 py-4 text-center border-r border-white/10 last:border-r-0">
                    <div className="font-[var(--font-display)] text-[22px] font-semibold text-white leading-none flex items-center justify-center gap-1">
                      {s.value}
                      {s.icon && <s.icon size={15} fill="currentColor" />}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.07em] text-white/40 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-[1000px] w-full mx-auto px-[var(--gutter-public)] py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start flex-1">

            {/* Left column */}
            <div>
              {niches.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 mb-7">
                  {niches.map((n, i) => (
                    <span
                      key={n}
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-[999px] ${
                        i === 0
                          ? 'bg-[var(--purple-50)] text-[var(--purple-700)] border border-[0.5px] border-[var(--purple-200)]'
                          : 'bg-[var(--grey-50)] text-[var(--grey-600)] border border-[0.5px] border-[var(--grey-100)]'
                      }`}
                    >
                      {i === 0 && <IconLeaf className="icon-xs" />}
                      {n}
                    </span>
                  ))}
                  {creator.availability === 'available' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-[999px] bg-[#EAF7EE] text-[var(--status-success-text)] border border-[0.5px] border-[#B9E6C4]">
                      <IconCircleCheck className="icon-xs" /> Available now
                    </span>
                  )}
                </div>
              )}

              <div className="font-[var(--font-display)] text-[18px] font-semibold text-[var(--black)] mb-4">
                Packages &amp; pricing
              </div>

              {packages.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={<IconPackage />}
                  title="No packages yet"
                  description="This creator hasn't published any packages yet. Check back soon."
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {packages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} onEnquire={handleSendEnquiryClick} />
                  ))}
                </div>
              )}

              {reviews.length > 0 && (
                <div className="mt-8">
                  <div className="font-[var(--font-display)] text-[18px] font-semibold text-[var(--black)] mb-4">Client reviews</div>
                  {reviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      review={r}
                      canReply={isOwnCard}
                      isReplying={replyMutation.isPending}
                      onReply={(reviewId, text) => replyMutation.mutate({ reviewId, reply: text })}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: sidebar */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-[72px]">
              <div className="bg-white border border-[0.5px] border-[var(--grey-100)] rounded-[16px] p-5 shadow-[var(--shadow-md)]">
                <div className="font-[var(--font-display)] text-[16px] font-semibold text-[var(--black)] mb-1">
                  Book {creator.displayName}
                </div>
                <div className="text-[12px] text-[var(--grey-400)] mb-4">Choose a package above, then send an enquiry</div>

                <button
                  type="button"
                  onClick={() => handleSendEnquiryClick(selectedPackage ?? packages.find((p) => p.featured) ?? packages[0])}
                  disabled={!packages.length}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-[8px] bg-[var(--purple-500)] text-on-accent text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <IconSend className="icon-sm" /> Send enquiry
                </button>
                <button
                  onClick={() => openWhatsApp(creator.phone)}
                  className="flex items-center justify-center gap-2 w-full mt-2 px-6 py-3 rounded-[8px] bg-[#25D366] text-on-accent text-[13px] font-medium hover:opacity-90 transition-all"
                >
                  <IconBrandWhatsapp className="icon-sm" /> Chat on WhatsApp
                </button>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--grey-100)]">
                  <span className="flex items-center gap-1 text-[11px] text-[var(--grey-400)]"><IconShieldCheck className="text-[var(--status-success)] icon-sm" /> Secure</span>
                  <span className="flex items-center gap-1 text-[11px] text-[var(--grey-400)]"><IconCircleCheck className="text-[var(--status-success)] icon-sm" /> No spam</span>
                  <span className="flex items-center gap-1 text-[11px] text-[var(--grey-400)]"><IconClock className="text-[var(--status-success)] icon-sm" /> Replies in 24hrs</span>
                </div>
              </div>

              <div className="bg-white border border-[0.5px] border-[var(--grey-100)] rounded-[16px] p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--grey-400)] mb-3">Creator details</div>
                {[
                  { label: 'Based in', value: creator.location },
                  { label: 'Languages', value: creator.languages },
                  { label: 'Turnaround', value: data?.turnaroundDays },
                  { label: 'Payment', value: creator.paymentMethods },
                  { label: 'On Creatorske', value: creator.memberSince ? `Since ${creator.memberSince}` : null },
                ].filter((row) => row.value).map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--grey-100)] last:border-b-0">
                    <span className="text-[12px] text-[var(--grey-600)]">{row.label}</span>
                    <span className="text-[12px] font-medium text-[var(--black)]">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="text-center py-3">
                <div className="text-[11px] text-[var(--grey-400)] mb-2">Rate card powered by</div>
                <div className="font-[var(--font-display)] text-[16px] text-[var(--black)]">
                  Creatorske<span className="text-[var(--purple-500)]">.</span>
                </div>
                <Link to="/signup" className="inline-block mt-2 text-[12px] px-4 py-2 rounded-[8px] border border-[0.5px] border-[var(--grey-200)] text-[var(--grey-600)] hover:bg-[var(--grey-50)]">
                  Create yours free
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center pb-4">
            <Link
              to={`/c/${handle}/portfolio`}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--purple-500)] hover:text-[var(--purple-700)] transition-colors"
            >
              View {creator.displayName}'s portfolio <IconArrowRight className="icon-sm" />
            </Link>
          </div>
        </>
      )}

      <footer className="px-[var(--gutter-public)] py-5 border-t border-[var(--grey-100)] bg-white flex items-center justify-between flex-wrap gap-2 text-[12px] text-[var(--grey-400)] mt-auto">
        <div className="font-[var(--font-display)] text-[14px] text-[var(--black)]">Creatorske<span className="text-[var(--purple-500)]">.</span></div>
        <div>© 2026 Creatorske. All rights reserved.</div>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-[var(--black)]">Privacy</Link>
          <Link to="/terms" className="hover:text-[var(--black)]">Terms</Link>
          <a href={`mailto:trust@creatorske.com?subject=${encodeURIComponent(`Report: ${creator.displayName || handle}`)}`} className="hover:text-[var(--black)]">Report</a>
        </div>
      </footer>

      <Modal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} title="Send an enquiry">
        <EnquiryForm
          creatorId={creator.id ?? handle}
          packages={packages}
          initialPackageId={selectedPackage?.id}
          onSuccess={() => setEnquiryOpen(false)}
          onCancel={() => setEnquiryOpen(false)}
        />
      </Modal>
    </div>
  );
}