import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  listPayoutMethods,
  addPayoutMethod,
  setPrimaryPayoutMethod,
  removePayoutMethod,
} from '../services/payment.service';

export const PAYOUT_METHODS_KEY = ['payments', 'methods'];

/** The creator's saved payout destinations, plus add / set-primary / remove. */
export function usePayoutMethods() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: PAYOUT_METHODS_KEY });

  const query = useQuery({ queryKey: PAYOUT_METHODS_KEY, queryFn: listPayoutMethods });

  const addMutation = useMutation({
    mutationFn: addPayoutMethod,
    onSuccess: async (method, vars) => {
      if (vars?.makePrimary && method?.id) await setPrimaryPayoutMethod(method.id);
      invalidate();
      toast.success(`${method?.name ?? 'Payout method'} added.`);
    },
    onError: (err) => toast.error(err?.message || 'Could not add that payout method.'),
  });

  const primaryMutation = useMutation({
    mutationFn: setPrimaryPayoutMethod,
    onSuccess: () => { invalidate(); toast.success('Primary payout method updated.'); },
    onError: (err) => toast.error(err?.message || 'Could not update your primary method.'),
  });

  const removeMutation = useMutation({
    mutationFn: removePayoutMethod,
    onSuccess: () => { invalidate(); toast.success('Payout method removed.'); },
    onError: (err) => toast.error(err?.message || 'Could not remove that method.'),
  });

  const methods = query.data ?? [];
  return {
    methods,
    primaryMethod: methods.find((m) => m.primary) ?? methods[0] ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    addMethod: addMutation.mutate,
    isAdding: addMutation.isPending,
    setPrimary: primaryMutation.mutate,
    removeMethod: removeMutation.mutate,
  };
}
