import { useQuery } from '@tanstack/react-query';
import { chatInvoiceService } from '../services/chat-invoice.service';

/**
 * Fetches one invoice in full. The thread sometimes only carries { id, status } on a message
 * (older rows, or a socket-pushed invoice update), so the card uses this to recover the
 * amount, title and description instead of rendering KES 0.
 */
export function useInvoiceById(invoiceId) {
  const enabled = invoiceId != null && invoiceId !== '';

  const query = useQuery({
    queryKey: ['chat-invoice', String(invoiceId ?? '')],
    queryFn: () => chatInvoiceService.getById(invoiceId),
    enabled,
    retry: false,
    staleTime: 60_000,
  });

  return {
    invoice: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export default useInvoiceById;
