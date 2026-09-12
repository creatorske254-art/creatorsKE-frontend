import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * 404 - catch-all for any URL that doesn't match a route. Standalone (not
 * nested in any layout) since a bad URL can come from any part of the app,
 * logged in or not.
 */
export default function NotFoundPage() {
  usePageMeta('Page not found', 'The page you were looking for could not be found.');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex flex-col items-center justify-center px-8 text-center">
      <Link to="/" className="font-[var(--font-display)] text-[20px] font-semibold tracking-[-0.01em] text-[var(--black)] mb-10">
        Creatorske<span className="text-[var(--purple-500)]">.</span>
      </Link>

      <div className="font-[var(--font-display)] text-[88px] font-semibold tracking-[-0.03em] leading-none text-[var(--purple-300)] mb-2">
        404
      </div>
      <h1 className="font-[var(--font-display)] text-[24px] font-semibold text-[var(--black)] mb-3">
        Page not found
      </h1>
      <p className="text-[14px] text-[var(--grey-500)] max-w-[380px] leading-[1.7] mb-8">
        The page you're looking for doesn't exist, may have moved, or the link might be broken.
      </p>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] border border-[0.5px] border-[var(--grey-200)] text-[var(--black)] text-[13.5px] font-medium hover:bg-[var(--grey-50)]"
        >
          <IconArrowLeft className="icon-sm" /> Go back
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[8px] bg-[var(--black)] text-white text-[13.5px] font-medium hover:opacity-90"
        >
          <IconHome className="icon-sm" /> Go to homepage
        </Link>
      </div>
    </div>
  );
}
