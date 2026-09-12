import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Theme + accent preference, persisted to localStorage and applied to
 * <html> so it survives reloads and covers every page (index.css already
 * ships a full `.dark` token set — this is what actually switches it on).
 *
 * Storage keys follow the existing `creatorske_*` convention from AuthContext.
 */
const THEME_KEY = 'creatorske_theme';
const ACCENT_KEY = 'creatorske_accent';

const DEFAULT_ACCENT = '#534AB7'; // --purple-600, the stylesheet's own default

const ThemeContext = createContext(null);

function readStored(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

// Darkens/lightens a hex by a percentage, so one picked accent can fill the
// 500/600/700 ramp the stylesheet expects rather than flattening all three.
function shiftHex(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(((num >> 16) & 0xff) + amt);
  const g = clamp(((num >> 8) & 0xff) + amt);
  const b = clamp((num & 0xff) + amt);
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

export function applyTheme(theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
}

export function applyAccent(hex) {
  const root = document.documentElement;
  if (!hex || hex === DEFAULT_ACCENT) {
    // Clear the overrides so index.css's own tokens (including the different
    // dark-mode accent) take over again.
    ['--purple-500', '--purple-600', '--purple-700', '--ring'].forEach((token) =>
      root.style.removeProperty(token)
    );
    return;
  }
  root.style.setProperty('--purple-500', shiftHex(hex, 8));
  root.style.setProperty('--purple-600', hex);
  root.style.setProperty('--purple-700', shiftHex(hex, -10));
  root.style.setProperty('--ring', hex);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => readStored(THEME_KEY, 'light'));
  const [accent, setAccentState] = useState(() => readStored(ACCENT_KEY, DEFAULT_ACCENT));

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    // Follow the OS while on "system"
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* storage unavailable */ }
  }, []);

  const setAccent = useCallback((next) => {
    setAccentState(next);
    try { localStorage.setItem(ACCENT_KEY, next); } catch { /* storage unavailable */ }
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, accent, setAccent, DEFAULT_ACCENT }),
    [theme, setTheme, accent, setAccent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider');
  return ctx;
}
