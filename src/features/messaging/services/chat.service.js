import api from '@/lib/api';

/**
 * Chats started from a published rate card.
 *
 * POST /chats/from-ratecard { creatorId }   brand only, idempotent
 *   -> { chatId, rateCardId }
 */
export const chatService = {
  createFromRateCard: (creatorId) =>
    api.post('/chats/from-ratecard', { creatorId }).then((response) => response.data),
};
