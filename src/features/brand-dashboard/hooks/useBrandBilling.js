import { useQuery } from '@tanstack/react-query';
import { brandService } from '../services/brand.service';

/** Billing & invoices + escrow transaction history for the signed-in brand
 *  (GET /brands/billing, /brands/invoices, /brands/transactions). */
export function useBrandBilling() {
  const billing = useQuery({ queryKey: ['brand-billing'], queryFn: () => brandService.getBilling() });
  const invoices = useQuery({ queryKey: ['brand-invoices'], queryFn: () => brandService.listInvoices() });
  return {
    billing,
    invoices,
    invoiceRows: invoices.data?.invoices ?? invoices.data ?? [],
    invoicePdfUrl: brandService.getInvoicePdfUrl,
  };
}

export function useBrandTransactions(params) {
  const query = useQuery({
    queryKey: ['brand-transactions', params],
    queryFn: () => brandService.listTransactions(params),
  });
  return { query, rows: query.data?.transactions ?? query.data ?? [] };
}
