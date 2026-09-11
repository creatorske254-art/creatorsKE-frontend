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

  return {
    disputes,
    openDisputeCount,
    isLoading: query.isLoading,
    resolve: resolveMutation.mutate,
    isResolving: resolveMutation.isPending,
  };
}

export function useDispute(id) {
  return useQuery({
    queryKey: ['admin-dispute', id],
    queryFn: () => adminService.getDispute(id),
    enabled: !!id,
  });
}
