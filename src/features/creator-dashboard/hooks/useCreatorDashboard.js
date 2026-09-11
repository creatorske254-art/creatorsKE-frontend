import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCreatorStats, getEarningsTimeline } from '@/features/payments/services/payment.service';
import { getCardHealth } from '@/features/rate-card/services/rate-card.service';

const PERIODS = ['7d', '30d', '90d'];

export function useCreatorDashboard() {
  const { user } = useAuth();
  const [statsPeriod, setStatsPeriod] = useState('30d');
  const [earningsPeriod, setEarningsPeriod] = useState('30d');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [earningsTimeline, setEarningsTimeline] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState(null);

  const [cardHealth, setCardHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const [publicUrl, setPublicUrl] = useState('');

  // --- Stats ---
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await getCreatorStats({ period: statsPeriod });
      setStats(data);
    } catch (err) {
      setStatsError(err.message ?? 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, [statsPeriod]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // --- Earnings timeline ---
  const fetchEarnings = useCallback(async () => {
    setEarningsLoading(true);
    setEarningsError(null);
    try {
      const data = await getEarningsTimeline({ period: earningsPeriod });
      setEarningsTimeline(data);
    } catch (err) {
      setEarningsError(err.message ?? 'Failed to load earnings');
    } finally {
      setEarningsLoading(false);
    }
  }, [earningsPeriod]);

  useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

  // --- Card health ---
  useEffect(() => {
    let cancelled = false;
    setHealthLoading(true);
    getCardHealth()
      .then((data) => { if (!cancelled) setCardHealth(data); })
      .catch((err) => { if (!cancelled) setHealthError(err.message ?? 'Failed to load card health'); })
      .finally(() => { if (!cancelled) setHealthLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // --- Public URL ---
  // No API endpoint for this — it's just the creator's own handle, which
  // already lives on the authenticated user object.
  useEffect(() => {
    if (user?.handle) {
      setPublicUrl(`${window.location.origin}/c/${user.handle}`);
    }
  }, [user?.handle]);

  // --- Quick action handlers ---
  const copyPublicLink = useCallback(async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      return { success: true };
    } catch {
      return { success: false };
    }
  }, [publicUrl]);

  return {
    statsPeriod,
    setStatsPeriod,
    earningsPeriod,
    setEarningsPeriod,
    PERIODS,

    stats,
    statsLoading,
    statsError,
    refetchStats: fetchStats,

    earningsTimeline,
    earningsLoading,
    earningsError,
    refetchEarnings: fetchEarnings,

    cardHealth,
    healthLoading,
    healthError,

    publicUrl,
    copyPublicLink,
  };
}