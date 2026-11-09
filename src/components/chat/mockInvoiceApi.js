const STORAGE_PREFIX = 'creatorske_chat_invoice:';

const readInvoice = (chatId) => {
  const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${chatId}`);
  return stored ? JSON.parse(stored) : null;
};

const saveInvoice = (chatId, invoice) => {
  sessionStorage.setItem(`${STORAGE_PREFIX}${chatId}`, JSON.stringify(invoice));
  return invoice;
};

async function mockRequest(endpoint, action) {
  // TODO: Replace this in-memory mock with fetch(endpoint, { method, body }) when the API is ready.
  await new Promise((resolve) => window.setTimeout(resolve, 120));
  return action();
}

function requireInvoice(chatId) {
  const invoice = readInvoice(chatId);
  if (!invoice) throw new Error('This chat invoice could not be found.');
  return invoice;
}

function ensurePending(invoice) {
  if (invoice.status !== 'PENDING') {
    throw new Error('This invoice can no longer be changed.');
  }
}

export const mockInvoiceApi = {
  getOrCreate: (chatId, payload) => mockRequest('/api/invoices', () => {
    const existing = readInvoice(chatId);
    if (existing) return existing;
    return saveInvoice(chatId, {
      id: `INV-${Date.now()}`,
      chatId,
      service: payload.service,
      price: payload.price,
      status: 'PENDING',
      deliveredLink: '',
      createdAt: Date.now(),
      deliveredAt: null,
    });
  }),

  updatePrice: (chatId, price) => mockRequest(`/api/invoices/${chatId}`, () => {
    const invoice = requireInvoice(chatId);
    ensurePending(invoice);
    if (!Number.isInteger(price) || price < 1) throw new Error('Enter a valid price in KSh.');
    return saveInvoice(chatId, { ...invoice, price });
  }),

  pay: (chatId) => mockRequest(`/api/invoices/${chatId}/pay`, () => {
    const invoice = requireInvoice(chatId);
    ensurePending(invoice);
    return saveInvoice(chatId, { ...invoice, status: 'HELD', paidAt: Date.now() });
  }),

  deliver: (chatId, deliveredLink) => mockRequest(`/api/invoices/${chatId}/deliver`, () => {
    const invoice = requireInvoice(chatId);
    if (invoice.status !== 'HELD') throw new Error('Payment must be held before delivery.');
    if (!deliveredLink.trim()) throw new Error('Add a link to the delivered content.');
    return saveInvoice(chatId, {
      ...invoice,
      status: 'DELIVERED',
      deliveredLink: deliveredLink.trim(),
      deliveredAt: Date.now(),
    });
  }),

  approve: (chatId) => mockRequest(`/api/invoices/${chatId}/approve`, () => {
    const invoice = requireInvoice(chatId);
    if (invoice.status !== 'DELIVERED') throw new Error('This delivery is not awaiting approval.');
    return saveInvoice(chatId, { ...invoice, status: 'COMPLETED' });
  }),

  dispute: (chatId, payload) => mockRequest(`/api/invoices/${chatId}/dispute`, () => {
    const invoice = requireInvoice(chatId);
    if (invoice.status !== 'DELIVERED') throw new Error('Only a delivered invoice can be disputed.');
    return saveInvoice(chatId, { ...invoice, ...payload, status: 'DISPUTED' });
  }),
};
