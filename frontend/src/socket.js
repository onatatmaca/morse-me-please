// src/socket.js
import { io } from 'socket.io-client';

// Use localhost in development, current origin in production
const isDev = import.meta.env.DEV;
const socketUrl = isDev ? 'http://localhost:3000' : window.location.origin;

const socket = io(socketUrl, {
  autoConnect: false, // We'll connect manually after username is set
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

export default socket;