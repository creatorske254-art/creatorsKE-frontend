import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planService } from '../services/plan.service';
import { useAuth } from '@/context/AuthContext';

/** The signed-in creator's plan and switching to another one. */
const PLAN_KEY = ['plan', 'current'];

export function usePlan() {
  const queryClient = useQueryClient();
  const { isAuthenticated, updateUser } = useAuth();

  const query = useQuery({
    queryKey: PLAN_KEY,
    queryFn: () => planService.getCurrentPlan(),
    // Never fetch the current plan for a logged-out visitor: /plans/current is
    // authed, and a 401 would bounce them to /login from a public page.
    enabled: isAuthenticated,
  });

  const upgradeMutation = useMutation({
    mutationFn: (payload) => planService.upgradePlan(payload),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: PLAN_KEY });
      // Login sends a creator with no plan to the plan picker, so the session needs the new plan too.
      if (plan?.id) updateUser?.({ plan });
      toast.success(plan?.price ? `You're on ${plan.name}.` : `You're on the free ${plan?.name ?? 'Starter'} plan.`);
    },
    onError: (err) => toast.error(err?.message || 'Could not change your plan.'),
  });

  const hasFeature = (feature) => !!query.data?.features?.includes(feature);

  return {
    currentPlan: query.data,
    isLoading: query.isLoading,
    hasFeature,
    upgrade: upgradeMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
  };
}
