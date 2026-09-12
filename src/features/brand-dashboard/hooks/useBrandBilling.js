import { useQuery } from '@tanstack/react-query';
import { brandService } from '../services/brand.service';

/**
 * Billing & invoices + escrow transaction history for the signed-in brand.
 * Backed by GET /brands/billing, /brands/invoices and /brands/transactions -
 * specified in BACKEND_API_SPEC.md, not yet built, so `retry: false` and the
 * pages show a dev-only tagged sample when these error (useDemoFallback).
 */
export function useBrandBilling() {
  const billing = useQuery({ queryKey: ['brand-billing'], queryFn: () => brandService.getBilling(), retry: false });
  const invoices = useQuery({ queryKey: ['brand-invoices'], queryFn: () => brandService.listInvoices(), retry: false });
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
    retry: false,
  });
  return { query, rows: query.data?.transactions ?? query.data ?? [] };
}
