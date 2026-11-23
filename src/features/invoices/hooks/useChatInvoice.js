import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatInvoiceService } from '../services/chat-invoice.service';

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

/** Replaces the embedded invoice on whichever thread messages carry it. */
export function patchInvoiceInMessages(cache, invoice) {
  if (!invoice?.id) return cache;

  const patchList = (messages) =>
    messages.map((message) => {
      const messageInvoiceId = message?.invoiceId ?? message?.invoice?.id;
      if (!sameId(messageInvoiceId, invoice.id)) return message;
      return { ...message, invoice: { ...(message.invoice ?? {}), ...invoice } };
    });

  if (Array.isArray(cache)) return patchList(cache);
  if (Array.isArray(cache?.messages)) return { ...cache, messages: patchList(cache.messages) };
  return cache;
}

/** Appends a socket-pushed message unless that id is already in the cache. */
export function appendMessageToCache(cache, message) {
  if (!message?.id) return cache;

  const append = (messages) => {
    if (messages.some((existing) => sameId(existing?.id, message.id))) return messages;
    return [...messages, message];
  };

  if (Array.isArray(cache)) return append(cache);
  if (Array.isArray(cache?.messages)) return { ...cache, messages: append(cache.messages) };
  return cache;
}

/**
 * In-chat invoice actions. The card's status/amount always come from the thread cache,
 * which the `invoiceUpdated` socket event patches; mutations here never optimistically
 * flip a status, they only push the server's own response back into the cache.
 */
export function useChatInvoice(threadId) {
  const queryClient = useQueryClient();

  const patch = (invoice) => {
    if (!invoice?.id || !threadId) return;
    queryClient.setQueryData(['messages', threadId], (cache) => patchInvoiceInMessages(cache, invoice));
  };

  const onError = (fallback) => (err) => toast.error(err?.message || fallback);

  const createMutation = useMutation({
    mutationFn: chatInvoiceService.create,
    onSuccess: () => toast.success('Invoice sent to the chat.'),
    onError: onError('Could not create the invoice.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ invoiceId, ...changes }) => chatInvoiceService.update(invoiceId, changes),
    onSuccess: (invoice) => {
      patch(invoice);
      toast.success('Invoice updated.');
    },
    onError: onError('Could not update the invoice.'),
  });

  const acceptPayMutation = useMutation({
    mutationFn: (invoiceId) => chatInvoiceService.acceptPay(invoiceId),
    onSuccess: () => toast.success('M-Pesa prompt sent. Enter your PIN to pay.'),
    onError: onError('Could not start the M-Pesa payment.'),
  });

  const deliverMutation = useMutation({
    mutationFn: ({ invoiceId, contentLink }) => chatInvoiceService.deliver(invoiceId, contentLink),
    onSuccess: (invoice) => {
      patch(invoice);
      toast.success('Marked as delivered.');
    },
    onError: onError('Could not mark the work as delivered.'),
  });

  const approveMutation = useMutation({
    mutationFn: (invoiceId) => chatInvoiceService.approve(invoiceId),
    onSuccess: (invoice) => {
      patch(invoice);
      toast.success('Approved. The money is released to the creator.');
    },
    onError: onError('Could not approve the delivery.'),
  });

  const disputeMutation = useMutation({
    mutationFn: ({ invoiceId, reason, details }) =>
      chatInvoiceService.dispute(invoiceId, { reason, details }),
    onSuccess: (invoice) => {
      patch(invoice);
      toast.success('Dispute raised. Creatorske will review it.');
    },
    onError: onError('Could not raise the dispute.'),
  });

  return {
    createInvoice: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateInvoice: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    acceptPay: acceptPayMutation.mutateAsync,
    isPaying: acceptPayMutation.isPending,

    deliver: deliverMutation.mutateAsync,
    isDelivering: deliverMutation.isPending,

    approve: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,

    dispute: disputeMutation.mutateAsync,
    isDisputing: disputeMutation.isPending,
  };
}
