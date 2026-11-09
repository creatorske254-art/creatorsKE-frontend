import { useEffect, useRef, useState } from 'react';

function getRemainingMs(deadlineMs) {
  return Math.max(deadlineMs - Date.now(), 0);
}

export default function CountdownTimer({ deadlineMs, className = '', onComplete }) {
  const [remaining, setRemaining] = useState(() => getRemainingMs(deadlineMs));
  const notifiedRef = useRef(false);

  useEffect(() => {
    notifiedRef.current = false;
    const tick = () => setRemaining(getRemainingMs(deadlineMs));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [deadlineMs]);

  useEffect(() => {
    if (remaining === 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      onComplete?.();
    }
  }, [remaining, onComplete]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return (
    <span className={className} role="timer" aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds`}>
      {hours}:{minutes}:{seconds}
    </span>
  );
}
