// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  autoConnect: false // We'll connect manually after username is set
});

export default socket;