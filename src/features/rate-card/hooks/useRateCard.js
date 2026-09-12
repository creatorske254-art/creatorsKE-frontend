import { useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rateCardService } from '@/features/rate-card/services/rate-card.service';

const RATE_CARD_KEY = (id) => ['rate-card', id];
const RATE_CARDS_KEY = ['rate-cards'];

// ─── Main builder hook (single rate card) ───────────────────────────────────
export function useRateCard(id) {
  const queryClient = useQueryClient();
  const autoSaveTimer = useRef(null);

  // ── Query ──────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: RATE_CARD_KEY(id),
    queryFn: () => rateCardService.getRateCard(id),
    enabled: !!id,
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data) => rateCardService.updateRateCard(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(RATE_CARD_KEY(id), updated);
    },
    onError: () => toast.error('Failed to save changes.'),
  });

  // ── Draft auto-save (debounced 1.5 s) ─────────────────────────────────────
  const saveDraft = useCallback(
    (data) => {
      if (!id) return;
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        rateCardService.saveDraft(id, data).catch(() => {
          // silent - auto-save failures should not disrupt the creator
        });
      }, 1500);
    },
    [id]
  );

  // ── Publish ────────────────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: () => rateCardService.publishRateCard(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(RATE_CARD_KEY(id), updated);
      queryClient.invalidateQueries({ queryKey: RATE_CARDS_KEY });
      toast.success('Rate card published!');
    },
    onError: () => toast.error('Could not publish. Please try again.'),
  });

  // ── Unpublish ──────────────────────────────────────────────────────────────
  const unpublishMutation = useMutation({
    mutationFn: () => rateCardService.unpublishRateCard(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(RATE_CARD_KEY(id), updated);
      queryClient.invalidateQueries({ queryKey: RATE_CARDS_KEY });
      toast.success('Rate card unpublished.');
    },
    onError: () => toast.error('Could not unpublish. Please try again.'),
  });

  // ── Reorder (optimistic) ───────────────────────────────────────────────────
  const reorderMutation = useMutation({
    mutationFn: (order) => rateCardService.reorderPackages(id, order),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: RATE_CARD_KEY(id) });
      const previous = queryClient.getQueryData(RATE_CARD_KEY(id));

      queryClient.setQueryData(RATE_CARD_KEY(id), (old) => {
        if (!old) return old;
        const packageMap = Object.fromEntries(
          old.packages.map((p) => [p.id, p])
        );
        return {
          ...old,
          packages: newOrder.map((pid) => packageMap[pid]).filter(Boolean),
        };
      });

      return { previous };
    },
    onError: (_err, _order, ctx) => {
      queryClient.setQueryData(RATE_CARD_KEY(id), ctx.previous);
      toast.error('Reorder failed. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: RATE_CARD_KEY(id) });
    },
  });

  // ── Analytics ──────────────────────────────────────────────────────────────
  const analyticsQuery = useQuery({
    queryKey: [...RATE_CARD_KEY(id), 'analytics'],
    queryFn: () => rateCardService.getRateCardAnalytics(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    rateCard: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    analytics: analyticsQuery.data,
    saveDraft,
    update: updateMutation.mutate,
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
    reorder: reorderMutation.mutate,
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}

// ─── List hook (dashboard tile use) ─────────────────────────────────────────
export function useRateCards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: RATE_CARDS_KEY,
    queryFn: rateCardService.listRateCards,
  });

  const createMutation = useMutation({
    mutationFn: rateCardService.createRateCard,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: RATE_CARDS_KEY });
      toast.success('Rate card created.');
      return created;
    },
    onError: () => toast.error('Could not create rate card.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rateCardService.deleteRateCard(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(RATE_CARDS_KEY, (old) =>
        old ? old.filter((rc) => rc.id !== id) : old
      );
      toast.success('Rate card deleted.');
    },
    onError: () => toast.error('Could not delete rate card.'),
  });

  return {
    rateCards: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

// ─── Bulk unpublish (settings "Unpublish all cards") ────────────────────────
// There's no bulk endpoint, so this fans out over the creator's own cards and
// unpublishes each published one, returning how many were actually affected.
export function useUnpublishAllRateCards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: RATE_CARDS_KEY,
    queryFn: rateCardService.listRateCards,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const cards = query.data ?? [];
      const published = cards.filter((c) => c.published ?? c.status === 'published');
      await Promise.all(published.map((c) => rateCardService.unpublishRateCard(c.id)));
      return published.length;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RATE_CARDS_KEY }),
  });

  return {
    rateCards: query.data ?? [],
    unpublishAll: mutation.mutateAsync,
    isUnpublishingAll: mutation.isPending,
  };
}
