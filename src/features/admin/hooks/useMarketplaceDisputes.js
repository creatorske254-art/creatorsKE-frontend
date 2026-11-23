import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

/**
 * Marketplace (campaign) disputes: a queue of their own, separate from escrow disputes.
 * Fields and the resolve payload differ from GET /admin/disputes, so the two lists are never
 * merged. Backed by:
 *
 * GET   /admin/disputes/marketplace
 * GET   /admin/disputes/marketplace/:id
 * POST  /admin/disputes/marketplace/:id/reply    { message }
 * PATCH /admin/disputes/marketplace/:id/resolve  { outcome, creatorShare, note }
 */
export const MARKETPLACE_DISPUTES_KEY = ['admin-marketplace-disputes'];

export function useMarketplaceDisputes() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: MARKETPLACE_DISPUTES_KEY });

  const query = useQuery({
    queryKey: MARKETPLACE_DISPUTES_KEY,
    queryFn: () => adminService.listMarketplaceDisputes(),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, decision }) => adminService.resolveMarketplaceDispute(id, decision),
    onSuccess: () => { invalidate(); toast.success('Campaign dispute resolved.'); },
    onError: (err) => toast.error(err?.message || 'Could not resolve that dispute.'),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => adminService.replyToMarketplaceDispute(id, message),
    onSuccess: () => { invalidate(); toast.success('Reply sent to both parties.'); },
    onError: (err) => toast.error(err?.message || 'Could not post your reply.'),
  });

  return {
    disputes: query.data?.disputes ?? query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    resolve: resolveMutation.mutate,
    isResolving: resolveMutation.isPending,
    reply: replyMutation.mutate,
    isReplying: replyMutation.isPending,
  };
}

/** One campaign dispute in full, loaded when a case is selected. */
export function useMarketplaceDispute(id) {
  return useQuery({
    queryKey: [...MARKETPLACE_DISPUTES_KEY, id],
    queryFn: () => adminService.getMarketplaceDispute(id),
    enabled: !!id,
  });
}
