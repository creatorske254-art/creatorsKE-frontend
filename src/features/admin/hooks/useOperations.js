import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

/**
 * Admin operations queues: escrow cases, account-deletion requests, and the
 * re-engagement email tool. All three endpoints are specified in
 * BACKEND_API_SPEC.md and not yet built - `retry: false`, and the pages show
 * a dev-only tagged sample via useDemoFallback while they 404.
 */
const NOT_YET = (what) => () => toast.error(`${what} isn't available yet. It needs backend support.`);

export function useEscrowCases(params) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-escrow', params], queryFn: () => adminService.listEscrow(params), retry: false });
  const action = useMutation({
    mutationFn: ({ id, action, note }) => adminService.escrowAction(id, action, note),
    retry: false,
    onSuccess: (_d, v) => { toast.success(v.action === 'release' ? 'Funds released to the creator.' : 'Escrow hold extended.'); qc.invalidateQueries({ queryKey: ['admin-escrow'] }); },
    onError: NOT_YET('Escrow actions'),
  });
  return { query, rows: query.data?.cases ?? query.data ?? [], act: action.mutate, isActing: action.isPending, actingId: action.variables?.id };
}

export function useDeletionRequests(params) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-deletion-requests', params], queryFn: () => adminService.listDeletionRequests(params), retry: false });
  const resolve = useMutation({
    mutationFn: ({ id, decision, reason }) => adminService.resolveDeletionRequest(id, decision, reason),
    retry: false,
    onSuccess: (_d, v) => { toast.success(v.decision === 'approve' ? 'Account scheduled for deletion.' : 'Deletion request rejected.'); qc.invalidateQueries({ queryKey: ['admin-deletion-requests'] }); },
    onError: NOT_YET('Resolving deletion requests'),
  });
  return { query, rows: query.data?.requests ?? query.data ?? [], resolve: resolve.mutate, isResolving: resolve.isPending, resolvingId: resolve.variables?.id };
}

export function useReengagement() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-re-engagement'], queryFn: () => adminService.getReengagement(), retry: false });
  const send = useMutation({
    mutationFn: ({ segmentId, ...options }) => adminService.sendReengagement(segmentId, options),
    retry: false,
    onSuccess: (_d, v) => { toast.success(`Re-engagement email queued for "${v.label}".`); qc.invalidateQueries({ queryKey: ['admin-re-engagement'] }); },
    onError: NOT_YET('Sending re-engagement emails'),
  });
  return { query, data: query.data, send: send.mutate, isSending: send.isPending, sendingId: send.variables?.segmentId };
}
