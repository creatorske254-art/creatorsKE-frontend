import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { campaignService } from '../services/campaign.service';

const ENQUIRIES_KEY = ['enquiries'];

/**
 * The creator's side of a booked enquiry's campaign - read-only plus the one
 * action only the creator can take: marking it delivered. `id` is the
 * enquiry's own `campaignId` (set once the enquiry is accepted).
 */
export function useCreatorCampaign(id) {
  const queryClient = useQueryClient();
  const key = ['creator-campaign', id];

  const query = useQuery({
    queryKey: key,
    queryFn: () => campaignService.getCampaign(id),
    enabled: !!id,
  });

  const deliverMutation = useMutation({
    mutationFn: (payload) => campaignService.deliverCampaign(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(key, updated);
      queryClient.invalidateQueries({ queryKey: ENQUIRIES_KEY });
      toast.success('Marked as delivered. The brand has been notified.');
    },
    onError: (err) => toast.error(err?.message || 'Could not mark this campaign as delivered.'),
  });

  return {
    campaign: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    deliver: deliverMutation.mutate,
    isDelivering: deliverMutation.isPending,
  };
}
