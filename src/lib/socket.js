import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : window.location.origin);
const SOCKET_URL = new URL(API_BASE_URL).origin;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

export function connectSocket(token) {
  if (!token) return false;

  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return true;
}
