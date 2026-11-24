import api from '@/lib/api';

/**
 * In-chat invoice escrow. There is no standalone invoice route: an invoice is a chat
 * message and every state change is broadcast on the `invoiceUpdated` socket event.
 *
 * GET    /invoices/:id              the full invoice (the thread may only carry id + status)
 * POST   /invoices/create           { chatId, brandId, serviceTitle, price, serviceDescription }
 *                                   creator only; the backend also posts an invoice message
 * PATCH  /invoices/:id              { price?, serviceDescription? }   creator only, PENDING only
 *                                   returns the updated invoice and posts "Invoice updated: ..."
 * POST   /invoices/:id/accept-pay   brand only; returns { invoice, checkoutRequestId }
 *                                   M-Pesa result arrives out of band via the server callback
 * POST   /invoices/:id/deliver      { contentLink }   creator only, HELD only
 * POST   /invoices/:id/approve      brand only, DELIVERED only
 * POST   /invoices/:id/dispute      { reason, details }
 */
export const chatInvoiceService = {
  getById: (invoiceId) => api.get(`/invoices/${invoiceId}`).then((response) => response.data),

  create: (data) => api.post('/invoices/create', data).then((response) => response.data),

  update: (invoiceId, data) =>
    api.patch(`/invoices/${invoiceId}`, data).then((response) => response.data),

  acceptPay: (invoiceId) =>
    api.post(`/invoices/${invoiceId}/accept-pay`).then((response) => response.data),

  deliver: (invoiceId, contentLink) =>
    api.post(`/invoices/${invoiceId}/deliver`, { contentLink }).then((response) => response.data),

  approve: (invoiceId) =>
    api.post(`/invoices/${invoiceId}/approve`).then((response) => response.data),

  dispute: (invoiceId, data) =>
    api.post(`/invoices/${invoiceId}/dispute`, data).then((response) => response.data),
};
