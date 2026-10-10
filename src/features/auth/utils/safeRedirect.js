/**
 * The only post-login destinations allowed are paths inside this app. Anything else (another
 * site, "//host", a backslash trick, a scheme like "javascript:", control characters) returns
 * null, so a crafted ?redirect= link cannot send someone off the site after they sign in.
 *
 * @param {unknown} value  the ?redirect= value or the sessionStorage fallback
 * @returns {string|null}  the path to go to, or null to use the role's home page
 */
export function safeRedirect(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;
  if (value.startsWith('//') || value.includes('\\')) return null;
  if ([...value].some((c) => c.charCodeAt(0) < 32)) return null;
  return value;
}
