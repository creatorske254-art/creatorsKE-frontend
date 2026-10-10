import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

/** Accounts flagged for review, and the warn / suspend / reinstate actions on them. */
const FLAGGED_KEY = ['admin-flagged-accounts'];

export function useFlaggedAccounts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: FLAGGED_KEY,
    queryFn: () => adminService.listFlaggedAccounts(),
  });

  const accounts = query.data?.accounts ?? query.data ?? [];

  const actionMutation = useMutation({
    mutationFn: ({ id, action, reason }) => adminService.takeAccountAction(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLAGGED_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      toast.success('Action applied.');
    },
    onError: (err) => toast.error(err?.message || 'Could not apply action.'),
  });

  return {
    accounts,
    flaggedAccountCount: accounts.length,
    isLoading: query.isLoading,
    takeAction: actionMutation.mutate,
    isTakingAction: actionMutation.isPending,
  };
}
