/**
 * Sends crashes that happen in users' browsers to the API (POST /client-errors), which writes them
 * to the server log with the page, the build and the signed-in user. Without this, a broken screen
 * in production is invisible until someone complains.
 *
 * Production builds only; at most MAX_REPORTS per page load, and the same error is sent once.
 * Reporting never throws: a failure to report must not cause a second error.
 */
const MAX_REPORTS = 5;
const sent = new Set();
let count = 0;

const endpoint = () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  return base ? `${base.replace(/\/$/, '')}/client-errors` : null;
};

/**
 * @param {unknown} error           the thrown value
 * @param {object}  [context]       where it happened, e.g. { source: 'error-boundary' }
 */
export function reportError(error, context = {}) {
  try {
    if (!import.meta.env.PROD) return;
    const url = endpoint();
    if (!url || count >= MAX_REPORTS) return;
    const message = String(error?.message ?? error ?? 'Unknown error').slice(0, 500);
    const key = `${message}|${context.source ?? ''}`;
    if (sent.has(key)) return;
    sent.add(key);
    count += 1;

    let userId = null;
    try { userId = JSON.parse(localStorage.getItem('creatorske_user') ?? 'null')?.id ?? null; } catch { /* no user */ }

    const body = JSON.stringify({
      message,
      stack: String(error?.stack ?? '').slice(0, 4000),
      source: context.source ?? 'unknown',
      page: window.location.pathname,
      release: import.meta.env.VITE_RELEASE ?? null,
      userId,
      userAgent: navigator.userAgent,
    });
    // keepalive lets the report finish even if the page is being closed or reloaded.
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {
    /* never let reporting break the page */
  }
}

/** Reports uncaught errors and rejected promises anywhere on the page. Called once from main.jsx. */
export function installGlobalErrorReporting() {
  window.addEventListener('error', (event) => reportError(event.error ?? event.message, { source: 'window.error' }));
  window.addEventListener('unhandledrejection', (event) => reportError(event.reason, { source: 'unhandledrejection' }));
}
