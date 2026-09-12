import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCreatorStats, getEarningsTimeline } from '@/features/payments/services/payment.service';
import { getCardHealth } from '@/features/rate-card/services/rate-card.service';
import { useRateCards } from '@/features/rate-card/hooks/useRateCard';

const PERIODS = ['7d', '30d', '90d'];

// GET /rate-cards/health is documented as a generic module-up check, not a
// per-creator completeness score - see CLAUDE.md. These package/payment-method
// caps are the real, documented per-plan limits from
// features/plans/constants/pricingTiers.js, reused here instead of inventing
// new numbers. `null` = unlimited (Elite tier).
const PACKAGE_LIMITS = { starter: 10, pro: 20, business: null };
const PAYMENT_METHOD_LIMITS = { starter: 1, pro: 2, business: 5 };

function resolvePlanId(user) {
  const raw = typeof user?.plan === 'string' ? user.plan : (user?.plan?.id ?? user?.plan?.name);
  return raw?.toLowerCase?.() ?? 'starter';
}

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

  // Raw module-up signal only - not used for scoring, see note above.
  const [healthError, setHealthError] = useState(null);

  const { rateCards, isLoading: rateCardsLoading } = useRateCards();

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

  // --- Rate-cards module status (not used for the completeness score below) ---
  useEffect(() => {
    let cancelled = false;
    getCardHealth().catch((err) => {
      if (!cancelled) setHealthError(err.message ?? 'Rate cards module unavailable');
    });
    return () => { cancelled = true; };
  }, []);

  // --- Card health: computed client-side from the creator's own rate card(s) ---
  const cardHealth = useMemo(() => {
    const primaryCard = rateCards?.[0];
    const planId = resolvePlanId(user);

    const pkgCurrent = primaryCard?.packages?.length ?? 0;
    const pkgMax = PACKAGE_LIMITS[planId] ?? PACKAGE_LIMITS.starter;

    const payCurrent = primaryCard?.paymentMethods?.length ?? 0;
    const payMax = PAYMENT_METHOD_LIMITS[planId] ?? PAYMENT_METHOD_LIMITS.starter;

    const checks = [!!primaryCard, !!primaryCard?.published, pkgCurrent > 0, payCurrent > 0];
    const completeness = primaryCard
      ? Math.round((checks.filter(Boolean).length / checks.length) * 100)
      : 0;

    return {
      completeness,
      packages: { current: pkgCurrent, max: pkgMax },
      paymentMethods: { current: payCurrent, max: payMax },
    };
  }, [rateCards, user]);

  // --- Public URL ---
  // No API endpoint for this - it's just the creator's own handle, which
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
    healthLoading: rateCardsLoading,
    healthError,

    publicUrl,
    copyPublicLink,
  };
}