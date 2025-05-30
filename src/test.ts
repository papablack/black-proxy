import { io, Socket } from 'socket.io-client';

const HOST = process.env.SOCKET_HOST || '[::1]';
const PORT = process.env.SOCKET_PORT || 5500;

const HEADER_HOST = process.env.SOCKET_HOST || 'ws.localhost';


const socket: Socket = io('ws://[::1]:5500', {
    transports: ['websocket'],
    forceNew: true, 
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 1000,
    extraHeaders: {
        'Host': `${HEADER_HOST}`
    }
});

socket.on('connect', () => {
    console.log('🔥 Conneted to Socket.IO');
    console.log(`Socket ID: ${socket.id}`);
    

    socket.emit('custom_event', { 
        message: 'Yo, I\'m online!',
        timestamp: new Date().toISOString()
    });
});

socket.on('connect_error', (error: Error) => {
    console.error('❌ Connection error:', error);
});

socket.on('disconnect', (reason: string) => {
    console.log('❌ Disconnected:', reason);
});

socket.on('server_response', (data: any) => {
    console.log('📨 Server response:', data);
});

socket.on('reconnect', (attemptNumber: number) => {
    console.log(`🔄 Retrying, attempt: ${attemptNumber}`);
});

// Obsługa zamknięcia aplikacji
process.on('SIGINT', () => {
    console.log('🛑 Close connection...');
    socket.disconnect();
    process.exit();
});
