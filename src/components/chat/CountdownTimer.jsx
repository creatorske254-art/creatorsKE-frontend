import { useEffect, useState } from 'react';

function getRemainingMs(deadlineMs) {
  return Math.max(deadlineMs - Date.now(), 0);
}

export default function CountdownTimer({ deadlineMs, className = '' }) {
  const [remaining, setRemaining] = useState(() => getRemainingMs(deadlineMs));

  useEffect(() => {
    const tick = () => setRemaining(getRemainingMs(deadlineMs));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [deadlineMs]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return (
    <span className={className}>
      {hours}:{minutes}:{seconds}
    </span>
  );
}
