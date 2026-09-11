import api from '@/lib/api';

export const messageService = {
  sendMessage: (data) => api.post('/messages', data).then((r) => r.data),

  getThreadMessages: (threadId) =>
    api.get(`/messages/threads/${threadId}`).then((r) => r.data),

  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/messages/attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
