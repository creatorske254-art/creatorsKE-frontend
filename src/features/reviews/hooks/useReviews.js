import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewService } from '../services/review.service';

export function useReviews(creatorId) {
  const queryClient = useQueryClient();
  const key = ['reviews', creatorId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => reviewService.listReviews({ creatorId }),
    enabled: !!creatorId,
  });

  const submitMutation = useMutation({
    mutationFn: ({ rating, comment }) => reviewService.submitReview({ creatorId, rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success('Review submitted.');
    },
    onError: () => toast.error('Could not submit review.'),
  });

  // No backend endpoint exists yet (see backend spec) - retry:false avoids
  // hammering a 404, and the seam is ready to work once it's built.
  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }) => reviewService.replyToReview(reviewId, reply),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success('Reply posted.');
    },
    onError: () => toast.error("Replying isn't available yet. It needs backend support."),
  });

  return {
    reviews: query.data?.reviews ?? query.data ?? [],
    isLoading: query.isLoading,
    submit: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    reply: replyMutation.mutate,
    isReplying: replyMutation.isPending,
  };
}
