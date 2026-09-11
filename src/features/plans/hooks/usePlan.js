import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planService } from '../services/plan.service';

const PLAN_KEY = ['plan', 'current'];

export function usePlan() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PLAN_KEY,
    queryFn: () => planService.getCurrentPlan(),
  });

  const upgradeMutation = useMutation({
    mutationFn: ({ planId, paymentMethod }) => planService.upgradePlan(planId, paymentMethod),
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
