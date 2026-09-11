import { useEffect } from 'react';

const SITE_NAME = 'Creatorske';
const DEFAULT_DESCRIPTION =
  "Creatorske — the marketplace for Kenya's content creators and the brands who book them.";

/**
 * Sets document.title and the meta-description tag for the page it's
 * called from, restoring the previous values on unmount. Needed because
 * this is a client-rendered SPA with one static index.html — without this,
 * every route shows the same browser-tab title and search-result snippet.
 *
 * @param {string} [title] - page title; omit for the bare site name (home page)
 * @param {string} [description]
 */
export function usePageMeta(title, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;

    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content');
    if (meta && description) {
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription != null) {
        meta.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
