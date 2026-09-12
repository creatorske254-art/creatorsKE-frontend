import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  initiateSTKPush,
  pollPaymentStatus,
  initiatePayout,
  getTransactionHistory,
  getCreatorStats,
  getEarningsTimeline,
} from '../services/payment.service';

const STATS_KEY = (period) => ['payments', 'stats', period];
const TIMELINE_KEY = (period) => ['payments', 'earnings-timeline', period];
const HISTORY_KEY = ['payments', 'transactions'];

// GET /payments/status/:id has no documented response schema — checked
// defensively against a few likely status field/value names. Capped at 20
// polls (~1 min at 3s intervals) so a stuck payment doesn't poll forever.
const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 3000;

function isPaymentSettled(status) {
  const value = (status?.status ?? status?.resultCode ?? '').toString().toLowerCase();
  return ['completed', 'success', 'successful', 'failed', 'cancelled', 'canceled'].includes(value);
}

export function usePayments({ period = '30d' } = {}) {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: STATS_KEY(period),
    queryFn: () => getCreatorStats({ period }),
  });

  const timelineQuery = useQuery({
    queryKey: TIMELINE_KEY(period),
    queryFn: () => getEarningsTimeline({ period }),
  });

  const historyQuery = useQuery({
    queryKey: HISTORY_KEY,
    queryFn: () => getTransactionHistory(),
  });

  const [pollingId, setPollingId] = useState(null);
  const pollAttempts = useRef(0);

  const statusQuery = useQuery({
    queryKey: ['payments', 'status', pollingId],
    queryFn: () => pollPaymentStatus(pollingId),
    enabled: !!pollingId,
    refetchInterval: (query) => (isPaymentSettled(query.state.data) ? false : POLL_INTERVAL_MS),
  });

  useEffect(() => {
    if (!pollingId) return;
    if (isPaymentSettled(statusQuery.data)) {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
      queryClient.invalidateQueries({ queryKey: STATS_KEY(period) });
      setPollingId(null);
      pollAttempts.current = 0;
      return;
    }
    pollAttempts.current += 1;
    if (pollAttempts.current > MAX_POLL_ATTEMPTS) {
      setPollingId(null);
      pollAttempts.current = 0;
      toast.error('Payment confirmation timed out. Check your transaction history shortly.');
    }
  }, [statusQuery.data, pollingId, queryClient, period]);

  const startPolling = (checkoutId) => {
    if (!checkoutId) return;
    pollAttempts.current = 0;
    setPollingId(checkoutId);
  };

  const stkPushMutation = useMutation({
    mutationFn: (data) => initiateSTKPush(data),
    onSuccess: (res) => {
      startPolling(res?.checkoutRequestId ?? res?.CheckoutRequestID ?? res?.id);
      toast.success('Payment request sent — check your phone to complete it.');
    },
    onError: () => toast.error('Could not start the payment. Please try again.'),
  });

  const payoutMutation = useMutation({
    mutationFn: (data) => initiatePayout(data),
    onSuccess: (res) => {
      startPolling(res?.checkoutRequestId ?? res?.id);
      toast.success('Withdrawal initiated.');
    },
    onError: () => toast.error('Could not process withdrawal. Please try again.'),
  });

  return {
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,
    isStatsError: statsQuery.isError,

    earningsTimeline: timelineQuery.data ?? [],
    isTimelineLoading: timelineQuery.isLoading,

    transactions: historyQuery.data?.transactions ?? historyQuery.data ?? [],
    isHistoryLoading: historyQuery.isLoading,
    isHistoryError: historyQuery.isError,
    refetchHistory: historyQuery.refetch,

    initiateStkPush: stkPushMutation.mutate,
    isInitiatingStkPush: stkPushMutation.isPending,

    requestPayout: payoutMutation.mutate,
    isRequestingPayout: payoutMutation.isPending,

    paymentStatus: statusQuery.data,
    isPolling: !!pollingId,
    stopPolling: () => { setPollingId(null); pollAttempts.current = 0; },
  };
}
