import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/features/portfolio/hooks/usePortfolio';
import { usePageMeta } from '@/lib/usePageMeta';

// Same as CreatorLayout.jsx: the component library loads icons via a <link>
// tag in <head>, not a package import. This page normally renders inside
// CreatorLayout (which already injects the stylesheet), but the effect is
// idempotent, safe to call again here so this page still renders correctly
// if it's ever mounted standalone (e.g. in isolation for testing).
const TABLER_ICONS_URL = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css';
function useTablerIcons() {
  useEffect(() => {
    if (document.getElementById('tabler-icons-cdn')) return;
    const link = document.createElement('link');
    link.id = 'tabler-icons-cdn';
    link.rel = 'stylesheet';
    link.href = TABLER_ICONS_URL;
    document.head.appendChild(link);
  }, []);
}

// Component-library chrome (.btn, .card, .tag, .avatar, .input, .badge,
// .progress-bar-*) lives in index.css, ported 1:1 from the Creatorske
// Component Library, reused as-is below, nothing reinvented.
//
// `.field` / `.label` / `.hint` / `.inp` / `.inp-wrap` / `.inp-icon` /
// `.inp-pre` / `.ta` mirror the input-form styling used in
// RateCardBuilderPage.jsx (icon-prefixed inputs, uppercase micro-labels,
// grey-on-white focus states) so the two builder flows feel identical,
//
// Everything else in this block (`.pb-*`) is this page's own layout: the
// split form/preview panel, the section-card icon header, and the live
// preview mock-up. None of it is shared elsewhere, so, again mirroring
// CreatorLayout.jsx's reasoning, it stays scoped here instead of
// polluting the global stylesheet, while still only ever referencing the
// shared color/type/radius/space tokens (never a hardcoded hex or px value
// that isn't already a token).
const PORTFOLIO_BUILDER_STYLES = `
.field { display: flex; flex-direction: column; gap: 5px; margin-bottom: var(--space-12); }
.field .label { font-size: var(--text-caption-size); font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--grey-600); }
.field .label.req::after { content: ' *'; color: var(--status-error); }
.field .hint { font-size: 12px; color: var(--grey-400); line-height: 1.5; margin-top: 2px; }
.inp {
  width: 100%;
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--black);
  background: var(--page-bg);
  border: 0.5px solid var(--grey-100);
  outline: none;
  transition: border-color .12s, background-color .12s, box-shadow .12s;
  padding: 8.5px 12px;
  border-radius: var(--radius-md);
}
.inp::placeholder { color: var(--grey-400); }
.inp:hover { border-color: var(--grey-200); }
.inp:focus { border-color: var(--grey-300); background: var(--white); box-shadow: 0 0 0 3px var(--purple-50); }
.inp-wrap { position: relative; }
.inp-icon-l { padding-left: 34px !important; }
.inp-icon-r { padding-right: 34px !important; }
.inp-icon { position: absolute; top: 50%; transform: translateY(-50%); color: var(--grey-400); font-size: 14px; pointer-events: none; display: flex; }
.inp-icon.l { left: 10px; }
.inp-icon.r { right: 10px; }
.ta { resize: vertical; min-height: 100px; line-height: 1.6; font-family: var(--font-body); }

.pb-shell { display: flex; flex-direction: column; height: 100%; border-radius: var(--radius-xl); overflow: hidden; }
.pb-topbar {
  background: var(--white);
  border-bottom: 0.5px solid var(--grey-100);
  padding: 0 var(--space-32);
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}
.pb-topbar-title { font-family: var(--font-display); font-size: var(--text-h4-size); font-weight: var(--text-h4-weight); color: var(--black); }
.pb-topbar-saved { font-size: 12px; color: var(--grey-400); margin-left: var(--space-12); display: inline-flex; align-items: center; gap: var(--space-4); }

.pb-split { display: grid; grid-template-columns: 1fr 400px; flex: 1; overflow: hidden; }
.pb-form-col { overflow-y: auto; padding: var(--space-28) var(--space-32); display: flex; flex-direction: column; gap: var(--space-16); }
.pb-preview-col { border-left: 0.5px solid var(--grey-100); overflow-y: auto; padding: var(--space-28) var(--space-24); background: var(--page-bg); }
@media (max-width: 900px) {
  .pb-split { grid-template-columns: 1fr; }
  .pb-preview-col { display: none; }
}

.pb-section-head { display: flex; align-items: center; gap: var(--space-8); margin-bottom: var(--space-14); }
.pb-section-head.has-hint { margin-bottom: var(--space-4); }
.pb-section-icon {
  width: 26px; height: 26px;
  border-radius: var(--radius-md);
  background: var(--page-bg);
  border: 0.5px solid var(--grey-100);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: var(--grey-500); flex-shrink: 0;
}
.pb-section-title { font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--black); }
.pb-section-hint { font-size: 12px; color: var(--grey-400); margin: 0 0 var(--space-14); }

.pb-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-10); }

.pb-preview-label {
  font-size: var(--text-caption-size); font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--grey-400); margin-bottom: var(--space-12); display: flex; align-items: center; gap: var(--space-5);
}
.pb-preview-hero { padding: var(--space-24) var(--space-20) 0; }
.pb-preview-top { display: flex; gap: var(--space-12); align-items: center; margin-bottom: var(--space-16); }
.pb-preview-name { font-family: var(--font-display); font-size: var(--text-h5-size); font-weight: 700; color: var(--black); line-height: 1.15; }
.pb-preview-role { font-size: 12px; color: var(--grey-500); margin-top: var(--space-2); }
.pb-preview-bio { font-size: 12px; color: var(--grey-600); line-height: 1.65; margin-bottom: var(--space-16); }
.pb-preview-stats { display: flex; border-top: 0.5px solid var(--grey-100); }
.pb-preview-stat { flex: 1; padding: var(--space-12) var(--space-4); text-align: center; border-right: 0.5px solid var(--grey-100); }
.pb-preview-stat:last-child { border-right: none; }
.pb-preview-stat-n { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--black); }
.pb-preview-stat-l { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--grey-400); margin-top: var(--space-2); }
.pb-preview-body { padding: var(--space-16); display: flex; flex-direction: column; gap: var(--space-14); }
.pb-preview-section-l { font-size: 10px; font-weight: 600; color: var(--grey-400); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-7); }
.pb-preview-follow { display: flex; gap: var(--space-8); }
.pb-preview-follow-item { flex: 1; background: var(--page-bg); border: 0.5px solid var(--grey-100); border-radius: var(--radius-md); padding: var(--space-10) var(--space-6); text-align: center; }
.pb-preview-follow-n { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--black); }
.pb-preview-follow-l { font-size: 9px; color: var(--grey-400); margin-top: var(--space-2); }
.pb-preview-contact { border-top: 0.5px solid var(--grey-100); padding-top: var(--space-12); display: flex; flex-direction: column; gap: var(--space-8); }
.pb-preview-contact-row { display: flex; align-items: center; gap: var(--space-8); font-size: 11.5px; color: var(--grey-600); }
.pb-preview-contact-row i { color: var(--grey-400); font-size: 13px; }
`;

/* field set / defaults
   Phase 4, client-facing portfolio:
     photoUrl
     name, role, location, bio
     niches: string[]
     socialStats: { igFollowers, igEngagement, ttFollowers, ttAvgViews, mediumFollowers, audienceAge }
     contact: { phone, instagramHandle, email }
*/
const DEFAULT_VALUES = {
  photoUrl: '',
  name: '',
  role: '',
  location: '',
  bio: '',
  niches: [],
  socialStats: {
    igFollowers: '',
    igEngagement: '',
    ttFollowers: '',
    ttAvgViews: '',
    mediumFollowers: '',
    audienceAge: '',
  },
  contact: {
    phone: '',
    instagramHandle: '',
    email: '',
  },
};

function getInitials(name) {
  return (
    (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '–'
  );
}

/* shared field bits */

function SectionCard({ icon, title, hint, children }) {
  return (
    <div className="card card-p-md">
      <div className={`pb-section-head${hint ? ' has-hint' : ''}`}>
        <div className="pb-section-icon">
          <i className={`ti ${icon}`} aria-hidden="true" />
        </div>
        <span className="pb-section-title">{title}</span>
      </div>
      {hint && <p className="pb-section-hint">{hint}</p>}
      {children}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="field">
      <label className={`label${required ? ' req' : ''}`}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

/* live preview
   A compact mock-up of the published portfolio, built entirely from
   component-library primitives (.card / .avatar / .tag) plus the
   .pb-preview-* layout classes above.
*/
function LivePreview({ values, creatorName, handle }) {
  const name = values.name || creatorName || 'Your Name';
  const initials = getInitials(name);
  const bio = values.bio?.trim();

  const heroStats = [
    { label: 'IG eng.', value: values.socialStats?.igEngagement || '–' },
    { label: 'TikTok views', value: values.socialStats?.ttAvgViews || '–' },
    { label: 'WhatsApp', value: values.contact?.phone || '–' },
  ];

  const followerStats = [
    { label: 'Instagram', value: values.socialStats?.igFollowers || '–' },
    { label: 'TikTok', value: values.socialStats?.ttFollowers || '–' },
    { label: 'Medium', value: values.socialStats?.mediumFollowers || '–' },
  ];

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Hero */}
      <div className="pb-preview-hero">
        <div className="pb-preview-top">
          <div className="avatar avatar-lg avatar-purple" style={{ overflow: 'hidden' }}>
            {values.photoUrl ? (
              <img src={values.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="pb-preview-name">{name}</div>
            <div className="pb-preview-role">
              {values.role || 'Online Portfolio'}
              {values.location ? ` · ${values.location}` : ''}
            </div>
          </div>
        </div>

        {bio && <p className="pb-preview-bio">{bio.length > 140 ? `${bio.slice(0, 140)}…` : bio}</p>}

        <div className="pb-preview-stats">
          {heroStats.map((s) => (
            <div key={s.label} className="pb-preview-stat">
              <div className="pb-preview-stat-n">{s.value}</div>
              <div className="pb-preview-stat-l">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="pb-preview-body">
        <div>
          <div className="pb-preview-section-l">Niche &amp; focus</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {values.niches?.length > 0 ? (
              values.niches.map((n) => (
                <span key={n} className="tag tag-purple">{n}</span>
              ))
            ) : (
              <span style={{ fontSize: 11, color: 'var(--grey-400)' }}>No niches added yet</span>
            )}
          </div>
        </div>

        <div className="pb-preview-follow">
          {followerStats.map((s) => (
            <div key={s.label} className="pb-preview-follow-item">
              <div className="pb-preview-follow-n">{s.value}</div>
              <div className="pb-preview-follow-l">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="pb-preview-contact">
          <div className="pb-preview-contact-row"><i className="ti ti-phone" aria-hidden="true" />{values.contact?.phone || 'No phone yet'}</div>
          <div className="pb-preview-contact-row"><i className="ti ti-brand-instagram" aria-hidden="true" />{values.contact?.instagramHandle || handle}</div>
          <div className="pb-preview-contact-row"><i className="ti ti-mail" aria-hidden="true" />{values.contact?.email || 'No email yet'}</div>
        </div>
      </div>
    </div>
  );
}

/* page */

export default function PortfolioBuilderPage() {
  usePageMeta('Portfolio Builder', 'Build your portfolio to showcase past work and brand collaborations on Creatorske.');
  useTablerIcons();

  const { user } = useAuth();
  const { portfolio, isLoading, autoSave, publish, unpublish, isPublishing, isUnpublishing } =
    usePortfolio(user?.id);

  const [nicheInput, setNicheInput] = useState('');

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  // Populate form once data loads
  useEffect(() => {
    if (portfolio) {
      reset({
        photoUrl: portfolio.photoUrl ?? '',
        name: portfolio.name ?? user?.name ?? '',
        role: portfolio.role ?? '',
        location: portfolio.location ?? '',
        bio: portfolio.bio ?? '',
        niches: portfolio.niches ?? [],
        socialStats: { ...DEFAULT_VALUES.socialStats, ...portfolio.socialStats },
        contact: { ...DEFAULT_VALUES.contact, ...portfolio.contact },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio, reset]);

  // Auto-save on every change
  const formValues = watch();
  useEffect(() => {
    if (portfolio?.id && isDirty) {
      autoSave(portfolio.id, formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formValues), isDirty]);

  const isPublished = portfolio?.status === 'published';

  function onSave(data) {
    // Explicit save (not just draft), wire up if you add a save button
    console.info('Manual save', data);
  }

  const handlePhotoChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setValue('photoUrl', ev.target.result, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    },
    [setValue]
  );

  function addNiche() {
    const val = nicheInput.trim();
    if (!val || formValues.niches?.includes(val)) return;
    setValue('niches', [...(formValues.niches ?? []), val], { shouldDirty: true });
    setNicheInput('');
  }

  function removeNiche(index) {
    const next = [...(formValues.niches ?? [])];
    next.splice(index, 1);
    setValue('niches', next, { shouldDirty: true });
  }

  // Completion tracking for the progress bar
  const completion = {
    photo: !!formValues.photoUrl,
    identity: !!(formValues.name && formValues.role && (formValues.bio?.trim().length ?? 0) > 10),
    stats: !!(formValues.socialStats?.igFollowers && formValues.socialStats?.ttFollowers),
    niches: (formValues.niches?.length ?? 0) > 0,
    contact: !!(formValues.contact?.phone || formValues.contact?.email),
  };
  const completedCount = Object.values(completion).filter(Boolean).length;
  const progressPct = Math.round((completedCount / 5) * 100);

  if (isLoading) {
    return (
      <>
        <style>{PORTFOLIO_BUILDER_STYLES}</style>
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="pb-shell">
      <style>{PORTFOLIO_BUILDER_STYLES}</style>

      {/* Top bar */}
      <div className="pb-topbar">
        <div>
          <span className="pb-topbar-title">Portfolio</span>
          {portfolio?.updatedAt && (
            <span className="pb-topbar-saved">
              <i className="ti ti-check" style={{ fontSize: 11 }} aria-hidden="true" />
              Saved {new Date(portfolio.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {isPublished ? (
            <button
              type="button"
              className={`btn btn-ghost btn-sm${isUnpublishing ? ' btn-loading' : ''}`}
              onClick={() => unpublish(portfolio.id)}
              disabled={isUnpublishing}
            >
              <i className="ti ti-eye-off" style={{ fontSize: 13 }} aria-hidden="true" />
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn-purple btn-sm${isPublishing ? ' btn-loading' : ''}`}
              onClick={() => publish(portfolio?.id)}
              disabled={isPublishing}
            >
              <i className="ti ti-send" style={{ fontSize: 13 }} aria-hidden="true" />
              Publish portfolio
            </button>
          )}
        </div>
      </div>

      {/* Split layout */}
      <div className="pb-split">
        {/* LEFT: form */}
        <div className="pb-form-col">
          {/* Header + progress */}
          <div>
            <h4 style={{ marginBottom: 4 }}>Build your portfolio</h4>
            <div className="text-body-sm" style={{ color: 'var(--grey-400)', marginBottom: 14 }}>
              This appears on your public portfolio, make it count.
            </div>
            <div className="progress-bar-wrap progress-xs">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%`, height: '100%' }} />
            </div>
            <div className="text-caption" style={{ color: 'var(--grey-400)', marginTop: 6, textTransform: 'none', letterSpacing: 'normal' }}>
              {completedCount} of 5 sections complete
            </div>
          </div>

          <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 1. Profile photo */}
            <SectionCard icon="ti-camera" title="Profile photo">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="avatar avatar-lg avatar-purple" style={{ overflow: 'hidden' }}>
                  {formValues.photoUrl ? (
                    <img
                      src={formValues.photoUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(formValues.name || user?.name)
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', width: 'fit-content' }}>
                    <i className="ti ti-upload" style={{ fontSize: 12 }} aria-hidden="true" />
                    Upload photo
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>
                  <p className="hint" style={{ margin: 0 }}>
                    JPG, PNG &middot; max 5MB &middot; square works best
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* 2. Identity */}
            <SectionCard icon="ti-id-badge" title="Identity">
              <Field label="Full name" required>
                <input className="inp" placeholder="e.g. Amara Osei" {...register('name')} />
              </Field>
              <Field label="Role / tagline">
                <input className="inp" placeholder="e.g. Lifestyle & travel creator" {...register('role')} />
              </Field>
              <Field label="Location label">
                <div className="inp-wrap">
                  <span className="inp-icon l"><i className="ti ti-map-pin" aria-hidden="true" /></span>
                  <input className="inp inp-icon-l" placeholder="e.g. Content Creator · Nairobi" {...register('location')} />
                </div>
              </Field>
              <Field label="Bio" hint={`${formValues.bio?.length ?? 0}/280 characters`}>
                <textarea
                  className="inp ta"
                  rows={4}
                  placeholder="Tell brands about yourself..."
                  {...register('bio')}
                />
              </Field>
            </SectionCard>

            {/* 3. Social stats */}
            <SectionCard icon="ti-chart-bar" title="Social stats" hint="Shown on your portfolio to build trust with brands">
              <div className="pb-g2" style={{ marginBottom: 12 }}>
                <Field label="Instagram followers">
                  <div className="inp-wrap">
                    <span className="inp-icon l"><i className="ti ti-brand-instagram" style={{ color: '#E1306C' }} aria-hidden="true" /></span>
                    <input className="inp inp-icon-l" placeholder="e.g. 82.5K" {...register('socialStats.igFollowers')} />
                  </div>
                </Field>
                <Field label="Engagement rate">
                  <div className="inp-wrap">
                    <input className="inp inp-icon-r" placeholder="e.g. 5.25" {...register('socialStats.igEngagement')} />
                    <span className="inp-icon r" style={{ fontSize: 12, fontWeight: 600 }}>%</span>
                  </div>
                </Field>
              </div>
              <div className="pb-g2" style={{ marginBottom: 12 }}>
                <Field label="TikTok followers">
                  <div className="inp-wrap">
                    <span className="inp-icon l"><i className="ti ti-brand-tiktok" aria-hidden="true" /></span>
                    <input className="inp inp-icon-l" placeholder="e.g. 73.1K" {...register('socialStats.ttFollowers')} />
                  </div>
                </Field>
                <Field label="Avg. views/video">
                  <input className="inp" placeholder="e.g. 6,400" {...register('socialStats.ttAvgViews')} />
                </Field>
              </div>
              <div className="pb-g2">
                <Field label="Medium followers">
                  <div className="inp-wrap">
                    <span className="inp-icon l"><i className="ti ti-brand-medium" aria-hidden="true" /></span>
                    <input className="inp inp-icon-l" placeholder="e.g. 259" {...register('socialStats.mediumFollowers')} />
                  </div>
                </Field>
                <Field label="Core audience age">
                  <input className="inp" placeholder="e.g. 18-30" {...register('socialStats.audienceAge')} />
                </Field>
              </div>
            </SectionCard>

            {/* 4. Niches */}
            <SectionCard
              icon="ti-tag"
              title="Niche & focus areas"
              hint="Press Enter or tap + to add. Tap a tag to remove it."
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {(formValues.niches ?? []).map((niche, i) => (
                  <span
                    key={niche}
                    className="tag tag-purple"
                    onClick={() => removeNiche(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {niche}
                    <i className="ti ti-x" style={{ fontSize: 10, opacity: 0.6 }} aria-hidden="true" />
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="inp"
                  style={{ flex: 1 }}
                  placeholder="Add a niche (e.g. Comedy)"
                  value={nicheInput}
                  onChange={(e) => setNicheInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addNiche();
                    }
                  }}
                />
                <button type="button" className="btn btn-purple btn-square" onClick={addNiche} aria-label="Add niche">
                  <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              </div>
            </SectionCard>

            {/* 5. Contact */}
            <SectionCard icon="ti-address-book" title="Contact details">
              <Field label="Phone / WhatsApp">
                <div className="inp-wrap">
                  <span className="inp-icon l"><i className="ti ti-phone" aria-hidden="true" /></span>
                  <input className="inp inp-icon-l" placeholder="+254..." {...register('contact.phone')} />
                </div>
              </Field>
              <Field label="Instagram handle">
                <div className="inp-wrap">
                  <span className="inp-pre">@</span>
                  <input className="inp" style={{ paddingLeft: 20 }} placeholder="yourhandle" {...register('contact.instagramHandle')} />
                </div>
              </Field>
              <Field label="Email">
                <div className="inp-wrap">
                  <span className="inp-icon l"><i className="ti ti-mail" aria-hidden="true" /></span>
                  <input
                    className="inp inp-icon-l"
                    type="email"
                    placeholder="you@email.com"
                    {...register('contact.email')}
                  />
                </div>
              </Field>
            </SectionCard>
          </form>
        </div>

        {/* RIGHT: live preview */}
        <div className="pb-preview-col">
          <div className="pb-preview-label">
            <i className="ti ti-eye" style={{ fontSize: 12 }} aria-hidden="true" />
            Live preview
          </div>
          <div style={{ position: 'sticky', top: 0 }}>
            <LivePreview
              values={formValues}
              creatorName={user?.name}
              handle={user?.handle ? `@${user.handle}` : '@yourhandle'}
            />
            <p className="hint" style={{ textAlign: 'center', marginTop: 10 }}>
              Updates as you type
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}