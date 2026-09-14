import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewService } from '../services/review.service';
import { adminService } from '@/features/admin/services/admin.service';

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

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }) => reviewService.replyToReview(reviewId, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success('Reply posted.');
    },
    onError: (err) => toast.error(err?.message || 'Could not post your reply.'),
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

/**
 * Cross-account review feed for admins (GET /reviews returns every review for
 * an admin token) plus the moderation actions (keep / remove).
 */
export function useReviewFeed(params = {}) {
  const queryClient = useQueryClient();
  const key = ['reviews', 'feed', params];
  const query = useQuery({ queryKey: key, queryFn: () => reviewService.listReviews(params) });
  const moderate = useMutation({
    mutationFn: ({ reviewId, action, reason }) => adminService.moderate(reviewId, action, reason),
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(v.action === 'remove' ? 'Review removed.' : 'Flag dismissed, review kept.');
    },
    onError: (err) => toast.error(err?.message || 'Could not update that review.'),
  });
  return { reviews: query.data?.reviews ?? query.data ?? [], isLoading: query.isLoading, isError: query.isError, refetch: query.refetch, moderate: moderate.mutate, isModerating: moderate.isPending };
}
