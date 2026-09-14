import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { brandService } from '../services/brand.service';

const METHODS_KEY = ['brand-payment-methods'];
const TEAM_KEY = ['brand-team'];

/** How the brand pays creators: GET/POST/DELETE /brands/payment-methods. */
export function useBrandPaymentMethods() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: METHODS_KEY });
    queryClient.invalidateQueries({ queryKey: ['brand-billing'] });
  };
  const query = useQuery({ queryKey: METHODS_KEY, queryFn: brandService.listPaymentMethods });

  const add = useMutation({
    mutationFn: brandService.addPaymentMethod,
    onSuccess: (m) => { invalidate(); toast.success(`${m?.name ?? 'Payment method'} connected.`); },
    onError: (err) => toast.error(err?.message || 'Could not connect that payment method.'),
  });
  const remove = useMutation({
    mutationFn: brandService.removePaymentMethod,
    onSuccess: () => { invalidate(); toast.success('Payment method disconnected.'); },
    onError: (err) => toast.error(err?.message || 'Could not disconnect that method.'),
  });

  return {
    methods: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    addMethod: add.mutate,
    isAdding: add.isPending,
    removeMethod: remove.mutate,
  };
}

/** Members of the brand account: GET /brands/team, invite, role change, remove. */
export function useBrandTeam() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: TEAM_KEY });
  const query = useQuery({ queryKey: TEAM_KEY, queryFn: brandService.listTeam });

  const invite = useMutation({
    mutationFn: ({ email, role }) => brandService.inviteTeamMember(email, role),
    onSuccess: (_m, { email }) => { invalidate(); toast.success(`Invitation sent to ${email}.`); },
    onError: (err) => toast.error(err?.message || 'Could not send the invite.'),
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }) => brandService.updateTeamMember(id, { role }),
    onSuccess: invalidate,
    onError: (err) => toast.error(err?.message || 'Could not change that role.'),
  });
  const remove = useMutation({
    mutationFn: brandService.removeTeamMember,
    onSuccess: invalidate,
    onError: (err) => toast.error(err?.message || 'Could not remove that member.'),
  });

  return {
    members: query.data?.members ?? query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    invite: invite.mutate,
    isInviting: invite.isPending,
    changeRole: changeRole.mutate,
    remove: remove.mutate,
  };
}
