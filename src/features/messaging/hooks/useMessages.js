import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/message.service';
import { toast } from 'sonner';

// threadId is assumed to be the enquiry/campaign id it belongs to - the API
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

  // POST /messages { threadId, text, attachmentUrl? }
  const sendMutation = useMutation({
    mutationFn: (payload) => messageService.sendMessage({ threadId, ...payload }),
    // A creator's first reply moves the enquiry from New to In review, so the list refreshes too.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
    },
    onError: (err) => toast.error(err?.message || 'Your message was not sent. Try again.'),
  });

  // POST /uploads/upload; the returned public url is sent as the message's attachmentUrl.
  const attachMutation = useMutation({
    mutationFn: (file) => messageService.uploadAttachment(file),
    onError: (err) => toast.error(err?.message || 'Could not upload that file.'),
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
