import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/features/portfolio/hooks/usePortfolio';
import { portfolioService } from '@/features/portfolio/services/portfolio.service';
import { useProfile } from '@/features/auth/hooks/useProfile';
import { authService } from '@/features/auth/services/auth.service';
import { usePageMeta } from '@/lib/usePageMeta';
import { useImageUpload } from '@/lib/useImageUpload';
import SmartImage from '@/components/ui/SmartImage';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { IconBrandFacebook, IconBrandGoogle, IconBrandInstagram, IconBrandMedium, IconBrandTiktok, IconBriefcase, IconCheck, IconEye, IconEyeOff, IconMail, IconMapPin, IconPhone, IconPlus, IconSend, IconUpload, IconUser, IconX } from '@tabler/icons-react';

const PORTFOLIO_BUILDER_STYLES = `
.field { display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-12); }
.field .hint { font-size: 12px; color: var(--grey-400); line-height: 1.5; margin-top: var(--space-2); }
.pb-social-verify { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-8); align-items: center; width: 100%; }
.pb-social-verify .inp-wrap { min-width: 0; width: 100%; }
.pb-social-result { grid-column: 1 / -1; font-size: 12px; color: var(--status-success-text); }
.pb-social-error { grid-column: 1 / -1; font-size: 12px; color: var(--status-error); }
.pb-connected-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-12); }
.pb-connected-item { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: var(--space-8); padding: var(--space-12); border: 0.5px solid var(--grey-100); border-radius: var(--radius-md); background: var(--white); }
.pb-connected-name { display: flex; min-width: 0; align-items: center; gap: var(--space-8); color: var(--black); font-size: 13px; font-weight: 500; }
.pb-connected-details { min-width: 0; flex: 1; }
.pb-connected-followers { margin: var(--space-4) 0 0; color: var(--grey-500); font-size: 11px; }
.pb-connected-status { display: inline-flex; flex-shrink: 0; align-items: center; gap: var(--space-4); color: var(--status-success-text); font-size: 12px; font-weight: 500; }
.inp {
  width: 100%;
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--black);
  background: var(--page-bg);
  border: 0.5px solid var(--grey-100);
  outline: none;
  transition: border-color .12s, background-color .12s, box-shadow .12s;
  padding: var(--space-8) var(--space-12);
  border-radius: var(--radius-md);
}
.inp::placeholder { color: var(--grey-400); }
.inp:hover { border-color: var(--grey-200); }
.inp:focus { border-color: var(--grey-300); background: var(--white); box-shadow: 0 0 0 3px var(--purple-50); }
.inp-wrap { position: relative; }
.inp-icon-l { padding-left: var(--space-32) !important; }
.inp-icon-r { padding-right: var(--space-32) !important; }
.inp-icon { position: absolute; top: 50%; transform: translateY(-50%); color: var(--grey-400); pointer-events: none; display: flex; }
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
.pb-form-col { overflow-y: auto; padding: var(--space-32) var(--space-32); display: flex; flex-direction: column; gap: var(--space-16); }
.pb-preview-col { border-left: 0.5px solid var(--grey-100); overflow-y: auto; padding: var(--space-32) var(--space-24); background: var(--page-bg); }
@media (max-width: 900px) {
  .pb-split { grid-template-columns: 1fr; }
  .pb-preview-col { display: none; }
}
@media (max-width: 640px) {
  .pb-g2 { grid-template-columns: 1fr; }
  .pb-connected-grid { grid-template-columns: 1fr; }
}

.pb-section-head { margin-bottom: var(--space-16); }
.pb-section-head.has-hint { margin-bottom: var(--space-4); }
.pb-section-hint { margin: 0 0 var(--space-16); }

.pb-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); }

.pb-preview-label {
  font-size: var(--text-caption-size); font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--grey-400); margin-bottom: var(--space-12); display: flex; align-items: center; gap: var(--space-4);
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
.pb-preview-stat-l { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--grey-400); margin-top: var(--space-2); }
.pb-preview-body { padding: var(--space-16); display: flex; flex-direction: column; gap: var(--space-16); }
.pb-preview-section-l { font-size: 10px; font-weight: 600; color: var(--grey-400); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-8); }
.pb-preview-follow { display: flex; gap: var(--space-8); }
.pb-preview-follow-item { flex: 1; background: var(--page-bg); border: 0.5px solid var(--grey-100); border-radius: var(--radius-md); padding: var(--space-12) var(--space-8); text-align: center; }
.pb-preview-follow-n { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--black); }
.pb-preview-follow-l { font-size: 10px; color: var(--grey-400); margin-top: var(--space-2); }
.pb-preview-contact { border-top: 0.5px solid var(--grey-100); padding-top: var(--space-12); display: flex; flex-direction: column; gap: var(--space-8); }
.pb-preview-contact-row { display: flex; align-items: center; gap: var(--space-8); font-size: 11.5px; color: var(--grey-600); }
.pb-preview-contact-row svg { color: var(--grey-400); }
`;

const DEFAULT_VALUES = {
  photoUrl: '',
  name: '',
  role: '',
  location: '',
  bio: '',
  niches: [],
  socialAccounts: {
    instagram_username: '',
    tiktok_username: '',
    medium_username: '',
  },
  socialStats: {
    igFollowers: '',
    ttFollowers: '',
    fbFollowers: '',
    mediumFollowers: '',
  },
  verifiedSocials: {
    instagram: false,
    tiktok: false,
    facebook: false,
    medium: false,
  },
  contact: {
    phone: '',
    instagramHandle: '',
    email: '',
  },
};

const SOCIAL_ACCOUNTS = [
  { key: 'instagram', platform: 'instagram', username: 'instagram_username', followers: 'igFollowers', label: 'Instagram', Icon: IconBrandInstagram },
  { key: 'tiktok', platform: 'tiktok', username: 'tiktok_username', followers: 'ttFollowers', label: 'TikTok', Icon: IconBrandTiktok },
  { key: 'medium', platform: 'medium', username: 'medium_username', followers: 'mediumFollowers', label: 'Medium', Icon: IconBrandMedium },
];

const LINKED_ACCOUNTS = [
  { id: 'google_id', key: 'google', label: 'Google', Icon: IconBrandGoogle },
  { id: 'tiktok_id', key: 'tiktok', label: 'TikTok', Icon: IconBrandTiktok, followers: 'ttFollowers' },
  { id: 'instagram_id', key: 'instagram', label: 'Instagram', Icon: IconBrandInstagram, followers: 'igFollowers' },
  { id: 'facebook_id', key: 'facebook', label: 'Facebook', Icon: IconBrandFacebook, followers: 'fbFollowers' },
];

const OAUTH_BASE_URL = (import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : ''))
  .replace(/\/api\/?$/i, '')
  .replace(/\/+$/, '');

function formatFollowerCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count)) return value || 'Not verified yet';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}

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

function SectionCard({ title, hint, children }) {
  return (
    <div className="card card-p-md">
      <div className={`pb-section-head${hint ? ' has-hint' : ''}`}>
        <h2 className="section-title">{title}</h2>
      </div>
      {hint && <p className="text-hint pb-section-hint">{hint}</p>}
      {children}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="field">
      <label className={`field-label${required ? ' field-required' : ''}`}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

function LivePreview({ values, creatorName, handle }) {
  const name = values.name || creatorName || 'Your Name';
  const initials = getInitials(name);
  const bio = values.bio?.trim();

  const heroStats = [
    { label: 'Instagram', value: values.verifiedSocials?.instagram ? formatFollowerCount(values.socialStats?.igFollowers) : '–' },
    { label: 'TikTok', value: values.verifiedSocials?.tiktok ? formatFollowerCount(values.socialStats?.ttFollowers) : '–' },
    { label: 'Medium', value: values.verifiedSocials?.medium ? formatFollowerCount(values.socialStats?.mediumFollowers) : '–' },
  ];

  const followerStats = [
    { label: 'Instagram', value: values.socialAccounts?.instagram_username || handle },
    { label: 'TikTok', value: values.socialAccounts?.tiktok_username || 'Not connected' },
    { label: 'Medium', value: values.socialAccounts?.medium_username || 'Not connected' },
  ];

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="pb-preview-hero">
        <div className="pb-preview-top">
          <div className="avatar avatar-lg avatar-purple" style={{ overflow: 'hidden' }}>
            <SmartImage src={values.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} fallback={initials} />
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

      <div className="pb-preview-body">
        <div>
          <div className="pb-preview-section-l">Niche &amp; focus</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
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
          <div className="pb-preview-contact-row"><IconBrandInstagram className="icon-sm" aria-hidden="true" />{values.socialAccounts?.instagram_username || handle}</div>
          <div className="pb-preview-contact-row"><IconBrandTiktok className="icon-sm" aria-hidden="true" />{values.socialAccounts?.tiktok_username || 'TikTok username'}</div>
          <div className="pb-preview-contact-row"><IconBrandMedium className="icon-sm" aria-hidden="true" />{values.socialAccounts?.medium_username || 'Medium username'}</div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioBuilderPage() {
  usePageMeta('Portfolio Builder', 'Build your portfolio to showcase past work and brand collaborations on Creatorske.');

  const { user, updateUser } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const { portfolio, isLoading, autoSave, update, publish, unpublish, refetch: refetchPortfolio, isPublishing, isUnpublishing } =
    usePortfolio(user?.id);

  const [nicheInput, setNicheInput] = useState('');
  const [verifying, setVerifying] = useState({});
  const [verificationErrors, setVerificationErrors] = useState({});

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm({ defaultValues: DEFAULT_VALUES });

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
        socialAccounts: {
          ...DEFAULT_VALUES.socialAccounts,
          ...portfolio.socialAccounts,
          instagram_username: portfolio.socialAccounts?.instagram_username ?? portfolio.contact?.instagramHandle ?? '',
        },
        verifiedSocials: { ...DEFAULT_VALUES.verifiedSocials, ...portfolio.verifiedSocials },
        contact: { ...DEFAULT_VALUES.contact, ...portfolio.contact },
      });
    }
  }, [portfolio, reset, user?.name]);

  useEffect(() => {
    const verified = searchParams.get('verified');
    const platform = SOCIAL_ACCOUNTS.find((social) => social.key === verified);
    if (!platform) return;

    toast.success(`${platform.label} account verified.`);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('verified');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const linked = searchParams.get('linked');
    const account = LINKED_ACCOUNTS.find((item) => item.key === linked);
    if (!account) return undefined;
    let cancelled = false;

    async function refreshLinkedAccount() {
      try {
        const [currentUser] = await Promise.all([
          authService.getCurrentUser(localStorage.getItem('creatorske_token')),
          refetchProfile({ throwOnError: true }),
          refetchPortfolio({ throwOnError: true }),
        ]);
        if (cancelled) return;
        if (currentUser) updateUser(currentUser);
        toast.success(`${account.label} connected.`);
      } catch (error) {
        if (!cancelled) toast.error(error?.message || `Could not refresh your ${account.label} connection.`);
      } finally {
        if (!cancelled) {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('linked');
          setSearchParams(nextParams, { replace: true });
        }
      }
    }

    refreshLinkedAccount();
    return () => { cancelled = true; };
  }, [searchParams, setSearchParams, refetchProfile, refetchPortfolio, updateUser]);

  const formValues = watch();
  useEffect(() => {
    if (portfolio?.id && isDirty) {
      autoSave(portfolio.id, formValues);
    }
  }, [JSON.stringify(formValues), isDirty, portfolio?.id, autoSave]);

  const isPublished = portfolio?.status === 'published';

  function onSave(data) {
    if (portfolio?.id) update({ id: portfolio.id, data });
  }

  const { uploading: photoUploading, onChange: handlePhotoChange } = useImageUpload({
    successMessage: 'Photo uploaded.',
    onUploaded: ({ url }) => setValue('photoUrl', url, { shouldDirty: true }),
  });

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

  function updateSocialUsername(social, username) {
    setValue(`socialAccounts.${social.username}`, username, { shouldDirty: true });
    setValue(`socialStats.${social.followers}`, '', { shouldDirty: true });
    setValue(`verifiedSocials.${social.key}`, false, { shouldDirty: true });
    setVerificationErrors((errors) => ({ ...errors, [social.key]: '' }));
  }

  function connectAccount(account) {
    if (!OAUTH_BASE_URL) {
      toast.error('Account linking is unavailable because the API URL is not configured.');
      return;
    }
    window.location.assign(`${OAUTH_BASE_URL}/auth/${account.key}/link`);
  }

  async function verifySocialAccount(social) {
    const username = (formValues.socialAccounts?.[social.username] ?? '').trim().replace(/^@/, '');
    if (!username) {
      setVerificationErrors((errors) => ({ ...errors, [social.key]: 'Could not verify username, check spelling' }));
      return;
    }

    setVerifying((state) => ({ ...state, [social.key]: true }));
    setVerificationErrors((errors) => ({ ...errors, [social.key]: '' }));
    try {
      const result = await portfolioService.verifySocial(social.platform, username);
      if (!result?.verified || result.followers === null || result.followers === undefined) {
        setVerificationErrors((errors) => ({ ...errors, [social.key]: 'Could not verify username, check spelling' }));
        return;
      }
      setValue(`socialStats.${social.followers}`, result.followers, { shouldDirty: true });
      setValue(`verifiedSocials.${social.key}`, true, { shouldDirty: true });
    } catch {
      setVerificationErrors((errors) => ({ ...errors, [social.key]: 'Could not verify username, check spelling' }));
    } finally {
      setVerifying((state) => ({ ...state, [social.key]: false }));
    }
  }

  const completion = {
    photo: !!formValues.photoUrl,
    identity: !!(formValues.name && formValues.role && (formValues.bio?.trim().length ?? 0) > 10),
    stats: Object.values(formValues.verifiedSocials ?? {}).some(Boolean),
    niches: (formValues.niches?.length ?? 0) > 0,
    contact: !!(formValues.contact?.phone || formValues.contact?.email),
  };
  const completedCount = Object.values(completion).filter(Boolean).length;
  const progressPct = Math.round((completedCount / 5) * 100);
  const connectedAccountUser = { ...user, ...(profile?.user ?? {}), ...profile };

  if (isLoading) {
    return (
      <>
        <style>{PORTFOLIO_BUILDER_STYLES}</style>
        <div style={{ padding: 'var(--space-40)', display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
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
              <IconCheck className="icon-xs" aria-hidden="true" />
              Saved {new Date(portfolio.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          {isPublished ? (
            <button
              type="button"
              className={`btn btn-ghost btn-sm${isUnpublishing ? ' btn-loading' : ''}`}
              onClick={() => unpublish(portfolio.id)}
              disabled={isUnpublishing}
            >
              <IconEyeOff className="icon-sm" aria-hidden="true" />
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              className={`btn btn-purple btn-sm${isPublishing ? ' btn-loading' : ''}`}
              onClick={() => publish(portfolio?.id)}
              disabled={isPublishing}
            >
              <IconSend className="icon-sm" aria-hidden="true" />
              Publish portfolio
            </button>
          )}
        </div>
      </div>

      {/* Split layout */}
      <div className="pb-split">
        {/* LEFT: form */}
        <div className="pb-form-col">
          <div>
            <h4 className="page-title" style={{ marginBottom: 'var(--space-4)' }}>Build your portfolio</h4>
            <div className="text-body-sm" style={{ color: 'var(--grey-400)', marginBottom: 'var(--space-16)' }}>
              This appears on your public portfolio, make it count.
            </div>
            <div className="progress-bar-wrap progress-xs">
              <div className="progress-bar-fill" style={{ width: `${progressPct}%`, height: '100%' }} />
            </div>
            <div className="text-caption" style={{ color: 'var(--grey-400)', marginTop: 'var(--space-8)', textTransform: 'none', letterSpacing: 'normal' }}>
              {completedCount} of 5 sections complete
            </div>
          </div>

          <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {/* 1. Profile photo */}
            <SectionCard title="Profile photo">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                  <label className={`btn btn-ghost btn-sm${photoUploading ? ' btn-loading' : ''}`} style={{ cursor: 'pointer', width: 'fit-content' }}>
                    <IconUpload className="icon-xs" aria-hidden="true" />
                    {formValues.photoUrl ? 'Change photo' : 'Upload photo'}
                    <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} disabled={photoUploading} style={{ display: 'none' }} />
                  </label>
                  <p className="hint" style={{ margin: 0 }}>
                    JPG, PNG &middot; max 5MB &middot; square works best
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* 2. Identity */}
            <SectionCard title="Identity">
              <Field label="Full name" required>
                <div className="inp-wrap"><span className="inp-icon l"><IconUser className="icon-sm" aria-hidden="true" /></span><input className="inp inp-icon-l" placeholder="e.g. Amara Osei" {...register('name')} /></div>
              </Field>
              <Field label="Role / tagline">
                <div className="inp-wrap"><span className="inp-icon l"><IconBriefcase className="icon-sm" aria-hidden="true" /></span><input className="inp inp-icon-l" placeholder="e.g. Lifestyle & travel creator" {...register('role')} /></div>
              </Field>
              <Field label="Location label">
                <div className="inp-wrap">
                  <span className="inp-icon l"><IconMapPin className="icon-sm" aria-hidden="true" /></span>
                  <input className="inp inp-icon-l" placeholder="e.g. Content Creator · Nairobi" {...register('location')} />
                </div>
              </Field>
              <Field label="Bio" hint={`${formValues.bio?.length ?? 0}/280 characters`}>
                <textarea
                  className="inp ta"
                  rows={4}
                  placeholder="Tell brands about yourself…"
                  {...register('bio')}
                />
              </Field>
            </SectionCard>

            {/* 3. Connected accounts */}
            <SectionCard title="Connected Accounts" hint="Link social accounts to verify your identity and refresh audience stats">
              <div className="pb-connected-grid">
                {LINKED_ACCOUNTS.map((account) => {
                  const Icon = account.Icon;
                  const connected = Boolean(connectedAccountUser?.[account.id]);
                  const followerCount = account.followers && formValues.verifiedSocials?.[account.key]
                    ? formValues.socialStats?.[account.followers]
                    : undefined;
                  return (
                    <div className="pb-connected-item" key={account.key}>
                      <div className="pb-connected-details">
                        <div className="pb-connected-name">
                          <Icon className="icon-md" aria-hidden="true" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.label}</span>
                        </div>
                        {followerCount !== undefined && followerCount !== null && followerCount !== '' && (
                          <p className="pb-connected-followers">
                            Verified: {formatFollowerCount(followerCount)} followers
                          </p>
                        )}
                      </div>
                      {connected ? (
                        <span className="pb-connected-status">
                          <IconCheck className="icon-xs" aria-hidden="true" /> Connected
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                          onClick={() => connectAccount(account)}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* 4. Social accounts */}
            <SectionCard title="Social stats" hint="Verify your username to show an automatically refreshed follower count">
              <div className="pb-g2">
                {SOCIAL_ACCOUNTS.map((social) => {
                  const Icon = social.Icon;
                  const verified = formValues.verifiedSocials?.[social.key];
                  return (
                    <Field key={social.key} label={`${social.label} username`}>
                      <div className="pb-social-verify">
                        <div className="inp-wrap">
                          <span className="inp-icon l"><Icon className="icon-sm" aria-hidden="true" /></span>
                          <input
                            className="inp inp-icon-l"
                            placeholder={`Your ${social.label} username`}
                            aria-label={`${social.label} username`}
                            value={formValues.socialAccounts?.[social.username] ?? ''}
                            disabled={!!verifying[social.key]}
                            onChange={(event) => updateSocialUsername(social, event.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={!!verifying[social.key]}
                          onClick={() => verifySocialAccount(social)}
                        >
                          {verifying[social.key] ? 'Verifying…' : 'Verify'}
                        </button>
                        {verificationErrors[social.key] ? (
                          <span className="pb-social-error" role="alert">{verificationErrors[social.key]}</span>
                        ) : verified ? (
                          <output className="pb-social-result" aria-live="polite">
                            <IconCheck className="icon-xs" aria-hidden="true" /> Verified: {formatFollowerCount(formValues.socialStats?.[social.followers])} followers (auto-updates daily)
                          </output>
                        ) : (
                          <output className="text-hint" aria-live="polite">Not verified yet</output>
                        )}
                      </div>
                    </Field>
                  );
                })}
              </div>
            </SectionCard>

            {/* 5. Niches */}
            <SectionCard
              title="Niche & focus areas"
              hint="Press Enter or tap + to add. Tap a tag to remove it."
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
                {(formValues.niches ?? []).map((niche, i) => (
                  <span
                    key={niche}
                    className="tag tag-purple"
                    onClick={() => removeNiche(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {niche}
                    <IconX className="icon-xs" style={{ opacity: 0.6 }} aria-hidden="true" />
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
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
                <button type="button" className="btn btn-secondary btn-sm" onClick={addNiche}>
                  <IconPlus className="icon-sm" aria-hidden="true" />
                  Add
                </button>
              </div>
            </SectionCard>
          </form>
        </div>

        {/* RIGHT: live preview */}
        <div className="pb-preview-col">
          <div className="pb-preview-label">
            <IconEye className="icon-xs" aria-hidden="true" />
            Live Preview
          </div>
          <LivePreview values={formValues} creatorName={user?.name} handle={user?.handle} />
        </div>
      </div>
    </div>
  );
}