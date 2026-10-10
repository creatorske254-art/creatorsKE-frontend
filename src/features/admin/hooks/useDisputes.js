import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

/** Dispute cases for admins: the list, resolving one with a split, and replying on a case. */
const DISPUTES_KEY = ['admin-disputes'];

export function useDisputes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: DISPUTES_KEY,
    queryFn: () => adminService.listDisputes(),
  });

  const disputes = query.data?.disputes ?? query.data ?? [];
  const openDisputeCount = disputes.filter((d) => d.status !== 'resolved').length;

  const resolveMutation = useMutation({
    mutationFn: ({ id, decision }) => adminService.resolveDispute(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISPUTES_KEY });
      toast.success('Dispute resolved.');
    },
    onError: (err) => toast.error(err?.message || 'Could not resolve dispute.'),
  });

  // POST /admin/disputes/:id/reply: a message on the case that keeps it open.
  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => adminService.replyToDispute(id, message),
    onError: (err) => toast.error(err?.message || 'Could not post your reply.'),
  });

  return {
    disputes,
    isError: query.isError,
    openDisputeCount,
    isLoading: query.isLoading,
    resolve: resolveMutation.mutate,
    isResolving: resolveMutation.isPending,
    reply: replyMutation.mutate,
    isReplying: replyMutation.isPending,
  };
}

