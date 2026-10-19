import { toast } from 'sonner';
import { IconBrandFacebook, IconBrandGoogle, IconBrandTiktok } from '@tabler/icons-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

const PROVIDERS = [
  { id: 'google', label: 'Continue with Google', Icon: IconBrandGoogle },
  { id: 'facebook', label: 'Continue with Facebook (for Instagram)', Icon: IconBrandFacebook },
  { id: 'tiktok', label: 'Continue with TikTok', Icon: IconBrandTiktok },
];

export default function SocialLoginButtons() {
  function startOAuth(provider) {
    if (!API_BASE_URL) {
      toast.error('Social sign-in is unavailable because the API URL is not configured.');
      return;
    }

    window.location.assign(`${API_BASE_URL.replace(/\/+$/, '')}/auth/${provider}`);
  }

  return (
    <div className="flex flex-col gap-3" aria-label="Continue with a social account">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => startOAuth(id)}
          className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--grey-200)] bg-[var(--white)] px-4 py-3 text-[13px] font-medium text-[var(--black)] transition-colors hover:bg-[var(--grey-50)]"
        >
          <Icon className="icon-sm" aria-hidden="true" />
          {label}
        </button>
      ))}
      <div className="flex items-center gap-3 py-1 text-[11px] text-[var(--grey-400)]" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--grey-200)]" />
        or continue with email
        <span className="h-px flex-1 bg-[var(--grey-200)]" />
      </div>
    </div>
  );
}
