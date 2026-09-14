import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  IconBrandInstagram, IconBrandTiktok, IconBrandYoutube, IconBrandX,
  IconCurrencyDollar, IconBrandWhatsapp, IconShare, IconUser,
  IconSparkles, IconVideo, IconCalendarEvent, IconPencil,
  IconMoodSmile, IconPlane, IconPhone, IconMail,
  IconEdit,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { usePageMeta } from '@/lib/usePageMeta';

function openWhatsApp(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) {
    toast.error("This creator hasn't added a WhatsApp number yet.");
    return;
  }
  window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer');
}

async function sharePortfolio(name) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: `${name} | Portfolio`, url });
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

const EXPERTISE_ICONS = [IconBrandInstagram, IconVideo, IconCalendarEvent, IconPencil];
const NICHE_ICONS = { Comedy: IconMoodSmile, Beauty: IconSparkles, Travel: IconPlane };

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchPortfolio(handle) {
  const res = await api.get(`/public/creators/${handle}/portfolio`);
  return res.data;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SectionSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { handle } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-portfolio', handle],
    queryFn: () => fetchPortfolio(handle),
    staleTime: 60_000,
  });

  usePageMeta(
    data?.creator?.displayName ? `${data.creator.displayName} | Portfolio` : 'Creator Portfolio',
    "Explore this creator's past work, brand collaborations, and areas of expertise on Creatorske."
  );

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--black)] mb-2">
            Portfolio not found
          </div>
          <p className="text-[13px] text-[var(--grey-500)] mb-6">
            This creator hasn't published their portfolio yet.
          </p>
          <Link to="/directory" className="text-[13px] font-medium text-[var(--purple-500)] hover:text-[var(--purple-700)]">
            Browse the directory
          </Link>
        </div>
      </div>
    );
  }

  const creator = data?.creator ?? {};
  const about = data?.about ?? {};
  const expertise = data?.expertise ?? [];
  const niches = data?.niches ?? [];
  const whyWorkWithMe = data?.whyWorkWithMe ?? [];
  const collaborations = data?.collaborations ?? [];
  const socialStats = data?.socialStats ?? [];
  const contact = data?.contact ?? {};

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col">

      {/* Public nav */}
      <nav className="h-[52px] flex items-center justify-between px-[var(--gutter-public)] border-b border-[var(--grey-100)] bg-white sticky top-0 z-10">
        <Link to="/" className="font-[var(--font-display)] text-[19px] font-semibold tracking-[-0.01em] text-[var(--black)]">
          Creatorske<span className="text-[var(--purple-500)]">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`/creator/portfolio`}
            className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-[8px] border border-[0.5px] border-[var(--grey-200)] text-[var(--grey-600)] hover:bg-[var(--grey-50)]"
          >
            <IconEdit className="icon-sm" /> Edit portfolio
          </Link>
          <Link
            to={`/c/${handle}`}
            className="inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-[8px] bg-[var(--purple-500)] text-on-accent hover:opacity-90"
          >
            <IconCurrencyDollar className="icon-sm" /> View rate card
          </Link>
        </div>
      </nav>

      {isLoading ? (
        <div className="max-w-[1000px] w-full mx-auto px-[var(--gutter-public)] py-16">
          <div className="flex items-start gap-5">
            <div className="skeleton w-[260px] h-[220px]" style={{ borderRadius: 24 }} />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-8 w-2/3" />
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-14 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="py-16 relative overflow-hidden">
            <div className="max-w-[1000px] mx-auto px-[var(--gutter-public)]">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-center">
                <div>
                  <div className="font-[var(--font-display)] text-[clamp(36px,5vw,56px)] font-semibold tracking-[-0.03em] leading-[1.05] text-[var(--black)] mb-2">
                    {creator.displayName}
                  </div>
                  {creator.role && (
                    <div className="italic font-[var(--font-display)] text-[clamp(14px,2vw,17px)] text-[var(--grey-400)] mb-4">
                      {creator.role}
                    </div>
                  )}
                  {creator.bio && (
                    <p className="text-[14px] leading-[1.7] text-[var(--grey-600)] max-w-[480px] mb-7">{creator.bio}</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/c/${handle}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] border border-[0.5px] border-[var(--grey-200)] text-[var(--black)] text-[14px] font-medium hover:bg-[var(--grey-50)]"
                    >
                      <IconCurrencyDollar className="icon-sm" /> View rate card
                    </Link>
                    <button
                      onClick={() => openWhatsApp(contact.phone)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] border border-[0.5px] border-[var(--grey-200)] text-[var(--grey-600)] text-[14px] font-medium hover:bg-[var(--grey-50)]"
                    >
                      <IconBrandWhatsapp className="icon-sm" /> WhatsApp me
                    </button>
                    <button
                      onClick={() => sharePortfolio(creator.displayName)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] border border-[0.5px] border-[var(--grey-200)] text-[var(--grey-600)] text-[14px] font-medium hover:bg-[var(--grey-50)]"
                    >
                      <IconShare className="icon-sm" /> Share
                    </button>
                  </div>
                </div>

                <div className="flex-shrink-0 self-center hidden md:block">
                  <div
                    className="w-[260px] h-[310px] bg-[var(--grey-50)] flex items-center justify-center overflow-hidden"
                    style={{ borderRadius: '60% 40% 60% 40% / 50% 60% 40% 50%' }}
                  >
                    <IconUser className="text-[var(--grey-200)] icon-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="max-w-[1000px] w-full mx-auto px-[var(--gutter-public)] pb-20 flex-1">

            {/* About */}
            {(about.whoIAm || about.whatIDo) && (
              <div className="flex flex-col gap-7 mb-12">
                {about.whoIAm && (
                  <div>
                    <div className="font-[var(--font-display)] text-[20px] font-semibold tracking-[-0.01em] text-[var(--black)] mb-2">Who I am</div>
                    <p className="text-[14px] text-[var(--grey-600)] leading-[1.7] max-w-[640px]">{about.whoIAm}</p>
                  </div>
                )}
                {about.whatIDo && (
                  <div>
                    <div className="font-[var(--font-display)] text-[20px] font-semibold tracking-[-0.01em] text-[var(--black)] mb-2">What I do</div>
                    <p className="text-[14px] text-[var(--grey-600)] leading-[1.7] max-w-[640px]">{about.whatIDo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Expertise */}
            {(isLoading || expertise.length > 0) && (
              <div className="mb-10">
                <div className="flex items-baseline justify-between mb-5">
                  <div className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--black)] tracking-[-0.01em]">My expertise</div>
                  <div className="text-[12px] text-[var(--grey-400)]">{expertise.length} specialisations</div>
                </div>
                {isLoading ? <SectionSkeleton rows={4} /> : (
                  <div className="flex flex-col gap-0.5">
                    {expertise.map((e, i) => {
                      const Icon = EXPERTISE_ICONS[i % EXPERTISE_ICONS.length];
                      return (
                        <div key={e.title} className="flex items-start gap-4 p-4 rounded-[12px] hover:bg-white transition-colors group">
                          <div className="w-9 h-9 rounded-[8px] bg-[var(--grey-50)] group-hover:bg-[var(--purple-50)] flex items-center justify-center flex-shrink-0 transition-colors">
                            <Icon size={16} className="text-[var(--grey-500)] group-hover:text-[var(--purple-500)] transition-colors" />
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-[var(--black)] mb-0.5">{e.title}</div>
                            <div className="text-[12px] text-[var(--grey-600)] leading-[1.55]">{e.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Niches */}
            {niches.length > 0 && (
              <div className="mb-10">
                <div className="flex items-baseline justify-between mb-5">
                  <div className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--black)] tracking-[-0.01em]">Niche and focus areas</div>
                  <div className="text-[12px] text-[var(--grey-400)]">{niches.length} niches</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {niches.map((n) => {
                    const Icon = NICHE_ICONS[n.name] ?? IconSparkles;
                    return (
                      <div key={n.name} className="bg-white rounded-[16px] p-6 flex flex-col gap-2 hover:bg-[var(--purple-50)] transition-colors">
                        <Icon size={22} className="text-[var(--purple-500)] mb-1" />
                        <div className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--purple-600)]">{n.name}</div>
                        <div className="text-[12px] text-[var(--grey-600)] leading-[1.6]">{n.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Why work with me */}
            {whyWorkWithMe.length > 0 && (
              <div className="mb-10">
                <div className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--black)] tracking-[-0.01em] mb-5">Why work with me</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {whyWorkWithMe.map((w) => (
                    <div key={w.title} className="bg-white rounded-[16px] p-6 flex flex-col gap-3">
                      {w.icon && <w.icon size={20} className="text-[var(--purple-500)]" />}
                      <div className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--black)]">{w.title}</div>
                      <div className="text-[12px] text-[var(--grey-600)] leading-[1.65]">{w.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborations */}
            {(isLoading || collaborations.length > 0) && (
              <div className="mb-10">
                <div className="flex items-baseline justify-between mb-5">
                  <div className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--black)] tracking-[-0.01em]">Collaborations and partnerships</div>
                  <div className="text-[12px] text-[var(--grey-400)]">{collaborations.length} brands</div>
                </div>
                {isLoading ? <SectionSkeleton rows={3} /> : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {collaborations.map((c, i) => (
                      <div key={i} className="bg-white rounded-[16px] p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-[8px] bg-[var(--grey-50)] flex items-center justify-center font-[var(--font-display)] text-[13px] font-bold text-[var(--grey-600)]">
                            {c.initial ?? c.brand?.charAt(0) ?? '?'}
                          </div>
                          <div className="text-[16px] font-semibold text-[var(--black)]">{c.brand}</div>
                        </div>
                        <div className="text-[12px] text-[var(--grey-600)] leading-[1.6]">{c.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Social presence */}
            {(isLoading || socialStats.length > 0) && (
              <div className="mb-10">
                <div className="flex items-baseline justify-between mb-5">
                  <div className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--black)] tracking-[-0.01em]">Social media presence</div>
                  <div className="text-[12px] text-[var(--grey-400)]">{socialStats.length} platforms</div>
                </div>
                {isLoading ? <SectionSkeleton rows={2} /> : (
                  <div className="flex flex-col gap-0.5">
                    {socialStats.map((s) => {
                      const Icon = PLATFORM_ICONS[s.platform];
                      return (
                        <div key={s.platform} className="bg-white rounded-[16px] p-5 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-5 hover:bg-[var(--grey-50)] transition-colors">
                          <div className="w-11 h-11 rounded-[12px] bg-[var(--grey-50)] flex items-center justify-center flex-shrink-0">
                            {Icon && <Icon size={20} className="text-[var(--grey-600)]" />}
                          </div>
                          <div>
                            <div className="font-[var(--font-display)] text-[15px] font-semibold text-[var(--black)]">{s.platform}</div>
                            <div className="text-[12px] text-[var(--grey-400)]">{s.handle}</div>
                          </div>
                          <div className="flex gap-8 items-center">
                            {s.metrics?.map((m, i) => (
                              <div key={m.label} className="flex flex-col items-center gap-0.5 min-w-[64px]">
                                {i > 0 && <div className="hidden sm:block w-px h-7 bg-[var(--grey-100)] absolute -ml-4" />}
                                <div className="text-[18px] font-[var(--font-display)] font-semibold text-[var(--purple-500)]">{m.value}</div>
                                <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--grey-400)]">{m.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Contact strip */}
            {(contact.phone || contact.instagram || contact.email) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 bg-[var(--grey-50)] rounded-[16px] overflow-hidden mb-10">
                {contact.phone && (
                  <div className="flex items-center gap-4 p-5 hover:bg-[var(--purple-50)] transition-colors">
                    <div className="w-[38px] h-[38px] rounded-[8px] bg-[var(--purple-50)] flex items-center justify-center flex-shrink-0">
                      <IconPhone className="text-[var(--purple-500)] icon-md" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--grey-400)]">WhatsApp / Phone</div>
                      <div className="text-[13px] font-medium text-[var(--black)] truncate">{contact.phone}</div>
                    </div>
                  </div>
                )}
                {contact.instagram && (
                  <div className="flex items-center gap-4 p-5 hover:bg-[var(--purple-50)] transition-colors">
                    <div className="w-[38px] h-[38px] rounded-[8px] bg-[var(--purple-50)] flex items-center justify-center flex-shrink-0">
                      <IconBrandInstagram className="text-[var(--purple-500)] icon-md" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--grey-400)]">Instagram</div>
                      <div className="text-[13px] font-medium text-[var(--black)] truncate">{contact.instagram}</div>
                    </div>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-4 p-5 hover:bg-[var(--purple-50)] transition-colors">
                    <div className="w-[38px] h-[38px] rounded-[8px] bg-[var(--purple-50)] flex items-center justify-center flex-shrink-0">
                      <IconMail className="text-[var(--purple-500)] icon-md" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--grey-400)]">Email</div>
                      <div className="text-[13px] font-medium text-[var(--black)] truncate">{contact.email}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA banner */}
            {!isLoading && (
              <div className="bg-[var(--grey-50)] rounded-[24px] p-12 text-center">
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--purple-500)] mb-3">Let's collaborate</div>
                <div className="font-[var(--font-display)] text-[clamp(22px,3vw,32px)] font-semibold text-[var(--black)] mb-3 tracking-[-0.02em]">
                  Let's create something amazing together
                </div>
                <p className="text-[14px] text-[var(--grey-600)] mb-7 max-w-[400px] mx-auto">
                  Ready to elevate your brand with authentic, strategic content? View my packages and reach out today.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    to={`/c/${handle}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] bg-[var(--black)] text-white text-[14px] font-medium hover:opacity-90"
                  >
                    <IconCurrencyDollar className="icon-sm" /> View rate card
                  </Link>
                  <button
                    onClick={() => openWhatsApp(contact.phone)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[8px] border border-[0.5px] border-[var(--grey-200)] text-[var(--grey-600)] text-[14px] font-medium hover:bg-white"
                  >
                    <IconBrandWhatsapp className="icon-sm" /> WhatsApp me
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <footer className="px-[var(--gutter-public)] py-5 border-t border-[var(--grey-100)] bg-white flex items-center justify-between flex-wrap gap-2 text-[12px] text-[var(--grey-400)] mt-auto">
        <div className="font-[var(--font-display)] text-[14px] text-[var(--black)]">Creatorske<span className="text-[var(--purple-500)]">.</span></div>
        <div>© 2026 Creatorske. All rights reserved.</div>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-[var(--black)]">Privacy</Link>
          <Link to="/terms" className="hover:text-[var(--black)]">Terms</Link>
          <a href="mailto:support@creatorske.com" className="hover:text-[var(--black)]">Support</a>
        </div>
      </footer>
    </div>
  );
}