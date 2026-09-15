import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planService } from '../services/plan.service';
import { useAuth } from '@/context/AuthContext';

const PLAN_KEY = ['plan', 'current'];

export function usePlan() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: PLAN_KEY,
    queryFn: () => planService.getCurrentPlan(),
    // Never fetch the current plan for a logged-out visitor: /plans/current is
    // authed, and a 401 would bounce them to /login from a public page.
    enabled: isAuthenticated,
  });

  const upgradeMutation = useMutation({
    mutationFn: (payload) => planService.upgradePlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAN_KEY });
      toast.success('Plan upgraded!');
    },
    onError: () => toast.error('Could not upgrade plan.'),
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
