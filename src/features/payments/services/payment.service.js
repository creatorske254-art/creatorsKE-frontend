import api from '@/lib/api';

// STK push, poll, payout, transaction history

export const initiateSTKPush = (data) =>
  api.post('/payments/stk-push', data).then((r) => r.data);

export const verifyMpesaPin = (paymentId, pin) =>
  api.post('/payments/mpesa/verify-pin', { paymentId, pin }).then((r) => r.data);

export const pollPaymentStatus = (checkoutRequestId) =>
  api.get(`/payments/status/${checkoutRequestId}`).then((r) => r.data);

export const initiatePayout = (data) =>
  api.post('/payments/payout', data).then((r) => r.data);

export const getTransactionHistory = (params) =>
  api.get('/payments/transactions', { params }).then((r) => r.data);

export const getCreatorStats = (params) =>
  api.get('/payments/stats', { params }).then((r) => r.data);

export const getEarningsTimeline = (params) =>
  api.get('/payments/earnings/timeline', { params }).then((r) => r.data);

// Payout methods (M-Pesa / Airtel / bank) the creator withdraws to
export const listPayoutMethods = () =>
  api.get('/payments/methods').then((r) => r.data?.methods ?? r.data ?? []);

export const addPayoutMethod = (data) =>
  api.post('/payments/methods', data).then((r) => r.data);

export const setPrimaryPayoutMethod = (id) =>
  api.patch(`/payments/methods/${id}/primary`).then((r) => r.data);

export const removePayoutMethod = (id) =>
  api.delete(`/payments/methods/${id}`).then((r) => r.data);
