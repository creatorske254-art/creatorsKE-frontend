import { IconAward, IconBrandFacebook, IconBrandInstagram, IconBrandLinkedin, IconBrandTiktok, IconBrandX, IconBrandYoutube, IconBuildingStore, IconChartBar, IconEye, IconLayoutCards, IconMicrophone, IconPencil, IconTrendingUp, IconWorld } from '@tabler/icons-react';
const PLATFORM_LABELS = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  podcast: 'Podcast',
  blog: 'Blog / Newsletter',
  other: 'Other',
};

const PLATFORM_ICONS = {
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
  youtube: IconBrandYoutube,
  twitter: IconBrandX,
  facebook: IconBrandFacebook,
  linkedin: IconBrandLinkedin,
  podcast: IconMicrophone,
  blog: IconPencil,
  other: IconWorld,
};

function formatNumber(n) {
  const num = Number(n);
  if (!n || isNaN(num)) return '-';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * PortfolioPreview
 * Renders a read-only, brand-facing view of the portfolio
 * fed by react-hook-form's watch() values in real time.
 */
export function PortfolioPreview({ values, creatorName = 'Your Name', handle = '@yourhandle' }) {
  const { socialStats = [], expertise = [], collaborations = [] } = values ?? {};

  const hasStats = socialStats.some((s) => s.platform);
  const hasExpertise = expertise.some((e) => e.area);
  const hasCollabs = collaborations.some((c) => c.brandName);
  const isEmpty = !hasStats && !hasExpertise && !hasCollabs;

  return (
    <div
      style={{
        background: 'var(--page-bg)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Preview label */}
      <div
        style={{
          background: 'var(--purple-50)',
          borderBottom: '0.5px solid var(--purple-200)',
          padding: 'var(--space-12) var(--space-20)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
        }}
      >
        <IconEye className="icon-sm" style={{ color: 'var(--purple-500)' }} aria-hidden="true" />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--purple-500)',
          }}
        >
          Live preview: what brands see
        </span>
      </div>

      <div style={{ padding: 'var(--space-24)', display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
        {/* Creator header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--purple-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--purple-600)',
              fontFamily: 'var(--font-display)',
              flexShrink: 0,
            }}
          >
            {creatorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--black)',
                letterSpacing: '-0.01em',
              }}
            >
              {creatorName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--grey-400)', marginTop: 'var(--space-2)' }}>{handle}</div>
          </div>
        </div>

        {isEmpty && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-32) 0',
              color: 'var(--grey-300)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-8)',
            }}
          >
            <IconLayoutCards className="icon-xl" aria-hidden="true" />
            <p style={{ fontSize: 13 }}>Fill in the form on the left to see your portfolio preview here.</p>
          </div>
        )}

        {/* Social Stats */}
        {hasStats && (
          <section>
            <SectionHeading icon={IconChartBar} label="Reach & Engagement" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', marginTop: 'var(--space-12)' }}>
              {socialStats
                .filter((s) => s.platform)
                .map((stat, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--white)',
                      border: '0.5px solid var(--grey-100)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-12) var(--space-16)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-12)',
                    }}
                  >
                    {(() => { const PlatformIcon = PLATFORM_ICONS[stat.platform] ?? IconWorld; return <PlatformIcon className="icon-md" style={{ color: 'var(--purple-400)' }} aria-hidden="true" />; })()}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)' }}>
                        {PLATFORM_LABELS[stat.platform] ?? stat.platform}
                        {stat.handle && (
                          <span style={{ fontSize: 12, color: 'var(--grey-400)', marginLeft: 'var(--space-8)' }}>
                            {stat.handle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-20)' }}>
                      <Metric label="Followers" value={formatNumber(stat.followers)} />
                      {stat.avgViews && <Metric label="Avg. views" value={formatNumber(stat.avgViews)} />}
                      {stat.engagementRate && (
                        <Metric label="Engagement" value={`${stat.engagementRate}%`} />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Expertise */}
        {hasExpertise && (
          <section>
            <SectionHeading icon={IconAward} label="Expertise" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--space-12)',
                marginTop: 'var(--space-12)',
              }}
            >
              {expertise
                .filter((e) => e.area)
                .map((exp, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--white)',
                      border: '0.5px solid var(--grey-100)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-16) var(--space-16)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--black)',
                        marginBottom: exp.description ? 'var(--space-4)' : 0,
                      }}
                    >
                      {exp.area}
                    </div>
                    {exp.description && (
                      <div style={{ fontSize: 12, color: 'var(--grey-500)', lineHeight: 1.5 }}>
                        {exp.description}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Collaborations */}
        {hasCollabs && (
          <section>
            <SectionHeading icon={IconBuildingStore} label="Past Collaborations" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', marginTop: 'var(--space-12)' }}>
              {collaborations
                .filter((c) => c.brandName)
                .map((collab, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--white)',
                      border: '0.5px solid var(--grey-100)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-16) var(--space-16)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--black)',
                        marginBottom: 'var(--space-4)',
                      }}
                    >
                      {collab.brandName}
                    </div>
                    {collab.campaignDescription && (
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--grey-500)',
                          lineHeight: 1.6,
                          marginBottom: collab.resultMetric ? 'var(--space-8)' : 0,
                        }}
                      >
                        {collab.campaignDescription}
                      </div>
                    )}
                    {collab.resultMetric && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-4)',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--status-success-text)',
                          background: 'var(--status-success-bg)',
                          padding: 'var(--space-4) var(--space-12)',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        <IconTrendingUp className="icon-xs" aria-hidden="true" />
                        {collab.resultMetric}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ─── small helper components ─────────────────────────────────── */

function SectionHeading({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
      <Icon className="icon-sm" style={{ color: 'var(--purple-400)' }} aria-hidden="true" />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--grey-600)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--black)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--grey-400)', marginTop: 'var(--space-2)' }}>{label}</div>
    </div>
  );
}