import { afterEach, describe, expect, it } from 'vitest';
import api from './api';

// Each request gets a stub adapter, so these exercise the real interceptors without a network.
const respond = (status, data) => async (config) => {
  const response = { data, status, statusText: String(status), headers: {}, config };
  if (status >= 400) {
    const error = new Error(`Request failed with status code ${status}`);
    error.response = response;
    error.config = config;
    throw error;
  }
  return response;
};

afterEach(() => localStorage.clear());

describe('api client', () => {
  it('sends the stored token as a bearer header', async () => {
    localStorage.setItem('creatorske_token', 'abc123');
    let sent;
    await api.get('/x', { adapter: async (config) => { sent = config.headers.Authorization; return respond(200, {})(config); } });
    expect(sent).toBe('Bearer abc123');
  });

  it('unwraps the { success, data } envelope', async () => {
    const res = await api.get('/plans', { adapter: respond(200, { success: true, message: 'ok', data: [{ id: 'starter' }] }) });
    expect(res.data).toEqual([{ id: 'starter' }]);
  });

  it('keeps pagination next to an unwrapped list', async () => {
    const res = await api.get('/directory', { adapter: respond(200, { success: true, data: [1, 2], pagination: { page: 2 } }) });
    expect([...res.data]).toEqual([1, 2]);
    expect(res.data.pagination).toEqual({ page: 2 });
  });

  it('passes bodies without an envelope through unchanged', async () => {
    const res = await api.get('/health', { adapter: respond(200, { status: 'ok' }) });
    expect(res.data).toEqual({ status: 'ok' });
  });

  it('turns validation errors into one readable message', async () => {
    const body = { success: false, message: 'Validation failed', error: { errors: [{ field: 'email', message: 'Enter a valid email.' }, { field: 'password', message: 'Too short.' }] } };
    await expect(api.post('/auth/signup', {}, { adapter: respond(422, body) })).rejects.toMatchObject({ status: 422, message: 'Enter a valid email. Too short.' });
  });

  it("uses the server's message for other errors", async () => {
    await expect(api.get('/x', { adapter: respond(409, { success: false, message: 'Only a delivered campaign can be approved' }) }))
      .rejects.toMatchObject({ status: 409, message: 'Only a delivered campaign can be approved' });
  });
});
