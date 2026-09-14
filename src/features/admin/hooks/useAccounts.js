import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

// Every account on the platform (GET /admin/accounts) plus admin invites.
export function useAccounts(params) {
  const query = useQuery({
    queryKey: ['admin-accounts', params],
    queryFn: () => adminService.listAccounts(params),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }) => adminService.inviteAdmin(email, role),
    onError: (err) => toast.error(err?.message || 'Could not send the invite.'),
  });

  return {
    accounts: query.data?.accounts ?? query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    invite: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
  };
}
