import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

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
    onError: () => toast.error('Could not resolve dispute.'),
  });

  // No backend endpoint exists yet (see backend spec) - retry:false avoids
  // hammering a 404, and the seam is ready to work once it's built.
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

export function useDispute(id) {
  return useQuery({
    queryKey: ['admin-dispute', id],
    queryFn: () => adminService.getDispute(id),
    enabled: !!id,
  });
}
