import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { portfolioService } from '../services/portfolio.service';

/**
 * The creator's portfolio in the builder: load (creating it on first visit), autosave, save,
 * publish and analytics.
 */
const PORTFOLIO_KEY = (id) => ['portfolio', id];

export function usePortfolio(creatorId) {
  const queryClient = useQueryClient();
  const autoSaveTimer = useRef(null);

  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: PORTFOLIO_KEY(creatorId),
    queryFn: () => portfolioService.getPortfolio(creatorId),
    enabled: !!creatorId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => portfolioService.updatePortfolio(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEY(creatorId) });
      toast.success('Portfolio saved');
    },
    onError: (err) => toast.error(err?.message || 'Failed to save portfolio'),
  });

  const draftMutation = useMutation({
    mutationFn: ({ id, data }) => portfolioService.saveDraft(id, data),
    // Silent - auto-save shouldn't toast on every keystroke
  });

  const publishMutation = useMutation({
    mutationFn: (id) => portfolioService.publishPortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEY(creatorId) });
      toast.success('Portfolio published');
    },
    onError: (err) => toast.error(err?.message || 'Failed to publish portfolio'),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id) => portfolioService.unpublishPortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_KEY(creatorId) });
      toast.success('Portfolio unpublished');
    },
    onError: (err) => toast.error(err?.message || 'Failed to unpublish portfolio'),
  });

  // Debounced auto-save - fires 1.5s after the last change
  const autoSave = useCallback(
    (id, data) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        draftMutation.mutate({ id, data });
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Analytics belong to the portfolio record, not the creator.
  const { data: analytics } = useQuery({
    queryKey: [...PORTFOLIO_KEY(creatorId), 'analytics'],
    queryFn: () => portfolioService.getPortfolioAnalytics(portfolio.id),
    enabled: !!portfolio?.id,
  });

  return {
    portfolio,
    isLoading,
    error,
    analytics,
    autoSave,
    update: updateMutation.mutate,
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,
    isSaving: updateMutation.isPending,
    isDraftSaving: draftMutation.isPending,
  };
}