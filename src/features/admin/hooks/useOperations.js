import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

/* Admin operations queues: escrow cases, account-deletion requests, and the
   re-engagement email tool (GET/POST /admin/escrow, /admin/deletion-requests,
   /admin/re-engagement - see BACKEND_API_SPEC.md). */
const fail = (fallback) => (err) => toast.error(err?.message || fallback);

export function useEscrowCases(params) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-escrow', params], queryFn: () => adminService.listEscrow(params) });
  const action = useMutation({
    mutationFn: ({ id, action, note }) => adminService.escrowAction(id, action, note),
    onSuccess: (_d, v) => { toast.success(v.action === 'release' ? 'Funds released to the creator.' : 'Escrow hold extended.'); qc.invalidateQueries({ queryKey: ['admin-escrow'] }); },
    onError: fail('Could not update that escrow case.'),
  });
  return { query, rows: query.data?.cases ?? query.data ?? [], act: action.mutate, isActing: action.isPending, actingId: action.variables?.id };
}

export function useDeletionRequests(params) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-deletion-requests', params], queryFn: () => adminService.listDeletionRequests(params) });
  const resolve = useMutation({
    mutationFn: ({ id, decision, reason }) => adminService.resolveDeletionRequest(id, decision, reason),
    onSuccess: (_d, v) => { toast.success(v.decision === 'approve' ? 'Account scheduled for deletion.' : 'Deletion request rejected.'); qc.invalidateQueries({ queryKey: ['admin-deletion-requests'] }); },
    onError: fail('Could not resolve that request.'),
  });
  return { query, rows: query.data?.requests ?? query.data ?? [], resolve: resolve.mutate, isResolving: resolve.isPending, resolvingId: resolve.variables?.id };
}

export function useReengagement() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-re-engagement'], queryFn: () => adminService.getReengagement() });
  const send = useMutation({
    mutationFn: ({ segmentId, ...options }) => adminService.sendReengagement(segmentId, options),
    onSuccess: (_d, v) => { toast.success(`Re-engagement email queued for "${v.label}".`); qc.invalidateQueries({ queryKey: ['admin-re-engagement'] }); },
    onError: fail('Could not queue the email.'),
  });
  return { query, data: query.data, send: send.mutate, isSending: send.isPending, sendingId: send.variables?.segmentId };
}
