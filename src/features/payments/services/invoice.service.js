import api from '@/lib/api';

/**
 * Invoices and their public M-Pesa checkout flow.
 *
 * POST /invoices { clientId, chatId, amount, title, description, dueDate? }
 * GET  /invoices/:invoiceId
 * POST /payments/mpesa/initiate { amount, phoneNumber, creatorId, invoiceId }
 * POST /payments/mpesa/verify-pin { paymentId }
 * GET  /payments/mpesa/:paymentId/status
 */
export const invoiceService = {
  create: (data) => api.post('/invoices', data).then((response) => response.data),
  get: (invoiceId) => api.get(`/invoices/${invoiceId}`).then((response) => response.data),
  initiatePayment: (data) => api.post('/payments/mpesa/initiate', data).then((response) => response.data),
  verifyPaymentPin: (paymentId) =>
    api.post('/payments/mpesa/verify-pin', { paymentId }).then((response) => response.data),
  getPaymentStatus: (paymentId) =>
    api.get(`/payments/mpesa/${paymentId}/status`).then((response) => response.data),
};
