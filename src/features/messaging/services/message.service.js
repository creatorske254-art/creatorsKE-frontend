import api, { uploadFile } from '@/lib/api';

/**
 * Chat on an enquiry. A thread's id is always the enquiry's id (see CLAUDE.md, "Enquiry + chat flow").
 *
 * POST /messages                 { threadId, text, attachmentUrl? }
 * GET  /messages/threads/:id     -> { messages: [{ id, senderId, from, senderName, text, attachmentUrl, createdAt }] }
 */
export const messageService = {
  sendMessage: (data) => api.post('/messages', data).then((r) => r.data),

  getThreadMessages: (threadId) =>
    api.get(`/messages/threads/${threadId}`).then((r) => r.data),

  // Attachments go through the shared upload endpoint; its public url is then sent as attachmentUrl.
  uploadAttachment: (file) => uploadFile(file),
};
