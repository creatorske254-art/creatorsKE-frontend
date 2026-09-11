import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/message.service';

// threadId is assumed to be the enquiry/campaign id it belongs to — the API
// doc doesn't document a separate "create thread" endpoint.
export function useMessages(threadId) {
  const queryClient = useQueryClient();
  const key = ['messages', threadId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => messageService.getThreadMessages(threadId),
    enabled: !!threadId,
    refetchInterval: 15_000, // light polling for new messages
  });

  // payload: { text, attachmentUrl? } — ASSUMPTION: POST /messages accepting
  // an attachmentUrl alongside text isn't documented in the API reference.
  const sendMutation = useMutation({
    mutationFn: (payload) => messageService.sendMessage({ threadId, ...payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const attachMutation = useMutation({
    mutationFn: (file) => messageService.uploadAttachment(file),
  });

  return {
    messages: query.data?.messages ?? query.data ?? [],
    isLoading: query.isLoading,
    send: sendMutation.mutate,
    isSending: sendMutation.isPending,
    uploadAttachment: attachMutation.mutateAsync,
    isUploading: attachMutation.isPending,
  };
}
