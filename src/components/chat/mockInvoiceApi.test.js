import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockInvoiceApi } from './mockInvoiceApi';

function createStorage() {
  const entries = new Map();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, String(value)),
  };
}

describe('mock invoice API', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', createStorage());
    vi.stubGlobal('window', { setTimeout });
  });

  it('creates a pending invoice from the selected rate-card package', async () => {
    const invoice = await mockInvoiceApi.getOrCreate('chat-1', {
      service: '1 TikTok Video',
      price: 5000,
    });

    expect(invoice).toMatchObject({
      chatId: 'chat-1',
      service: '1 TikTok Video',
      price: 5000,
      status: 'PENDING',
    });
  });

  it('updates price before payment and locks it once payment is held', async () => {
    await mockInvoiceApi.getOrCreate('chat-2', { service: '1 Reel', price: 8000 });
    const updated = await mockInvoiceApi.updatePrice('chat-2', 4500);
    expect(updated.price).toBe(4500);

    const held = await mockInvoiceApi.pay('chat-2');
    expect(held.status).toBe('HELD');
    await expect(mockInvoiceApi.updatePrice('chat-2', 4000))
      .rejects.toThrow('This invoice can no longer be changed.');
  });

  it('requires a delivered link and allows dispute after delivery', async () => {
    await mockInvoiceApi.getOrCreate('chat-3', { service: 'Event Appearance', price: 15000 });
    await mockInvoiceApi.pay('chat-3');

    await expect(mockInvoiceApi.deliver('chat-3', ''))
      .rejects.toThrow('Add a link to the delivered content.');

    const delivered = await mockInvoiceApi.deliver('chat-3', 'https://example.com/content');
    expect(delivered.status).toBe('DELIVERED');

    const disputed = await mockInvoiceApi.dispute('chat-3', {
      reason: 'Poor quality',
      details: 'The agreed content was not provided.',
    });
    expect(disputed).toMatchObject({ status: 'DISPUTED', reason: 'Poor quality' });
  });
});
