import { io, Socket } from 'socket.io-client';

const HOST = process.env.SOCKET_HOST || '[::1]';
const PORT = process.env.SOCKET_PORT || 5500;

const HEADER_HOST = process.env.SOCKET_HOST || 'wsapi.agent.barterdev.perseida.dev';

// Konfiguracja połączenia
const socket: Socket = io('ws://[::1]:5500', {
    // Opcje połączenia
    transports: ['websocket'], // Wymuś WebSocket
    forceNew: true, // Wymuś nowe połączenie
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 1000,
    extraHeaders: {
        'Host': `${HEADER_HOST}`
    }
});

// Obsługa zdarzeń połączenia
socket.on('connect', () => {
    console.log('🔥 Połączono z serwerem Socket.IO');
    console.log(`Socket ID: ${socket.id}`);
    
    // Przykładowe wysłanie eventu
    socket.emit('custom_event', { 
        message: 'Siema kurwa, jestem online!',
        timestamp: new Date().toISOString()
    });
});

// Obsługa błędów połączenia
socket.on('connect_error', (error: Error) => {
    console.error('❌ Błąd połączenia:', error);
});

// Obsługa rozłączenia
socket.on('disconnect', (reason: string) => {
    console.log('❌ Rozłączono:', reason);
});

// Nasłuchiwanie własnych eventów
socket.on('server_response', (data: any) => {
    console.log('📨 Odpowiedź serwera:', data);
});

// Dodatkowe eventy debugowe
socket.on('reconnect', (attemptNumber: number) => {
    console.log(`🔄 Ponowne połączenie, próba: ${attemptNumber}`);
});

// Obsługa zamknięcia aplikacji
process.on('SIGINT', () => {
    console.log('🛑 Zamykanie połączenia...');
    socket.disconnect();
    process.exit();
});
