import { useEffect, useState } from 'react';

/**
 * Tracks the browser's own connectivity (navigator.onLine + the online/offline
 * events). This reflects "does this device have a network link at all", not
 * "can we reach the Creatorske API" - a device can be online while the API
 * itself is unreachable, which individual pages/hooks already surface via
 * their own error states.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
