import { useEffect, useState } from 'react';

/**
 * An <img> that falls back to `fallback` (usually an initials avatar) when the
 * source is empty or fails to load, instead of showing the browser's broken
 * image icon. Uploaded URLs can 404 (a file was cleared, a stale URL, an
 * offline dev server), and a signed-in account should never see a broken gap
 * where a face should be.
 */
export default function SmartImage({ src, alt = '', className, style, fallback = null }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return fallback;
  return <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} />;
}
