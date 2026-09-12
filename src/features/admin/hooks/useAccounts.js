import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

// GET /admin/accounts and POST /admin/invite don't exist on the backend yet
// (see the production-readiness plan's backend spec) — this hook exists as a
// ready seam so AccountsPage.jsx can swap from useFlaggedAccounts() to this
// once a real "list all accounts" endpoint ships, without a bigger rewrite.
export function useAccounts(params) {
  const query = useQuery({
    queryKey: ['admin-accounts', params],
    queryFn: () => adminService.listAccounts(params),
    retry: false,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }) => adminService.inviteAdmin(email, role),
    retry: false,
    onError: () => toast.error("Inviting admins isn't available yet — this needs backend support."),
  });

  return {
    accounts: query.data?.accounts ?? query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    invite: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
  };
}
