import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://gigflow-backend-f7g7.onrender.com';

let socket: Socket | null = null;

export const socketService = {
  connect(userId: string): Socket {
    if (socket?.connected) {
      return socket;
    }

    socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket?.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  onHired(callback: (data: { gigTitle: string }) => void): void {
    socket?.on('hired', callback);
  },

  offHired(): void {
    socket?.off('hired');
  },

  getSocket(): Socket | null {
    return socket;
  },
};
