import * as http from 'http';
const httpProxy = require('http-proxy');
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import routingTable from './_routingTable';
import { IProxyUser, RouteConfig, RoutingTable } from './types';
import { MySQLDriver } from './dbAuth';

const connectedUsers: Map<string, IProxyUser> = new Map();

const routingTableData: RoutingTable = routingTable; // Import routingTable as a typed variable
// Define log file patho
const logFile = path.join(__dirname, '../logs/proxy.log');

if(!routingTable.dbUrl){
    throw new Error('No db URL set.');
}

const DB = new MySQLDriver(routingTable.dbUrl);

// Ensure log file exists or create it
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '', { flag: 'w' });
}

const logEntry = (msg: string, clientIp: string | null = null, isError: boolean = false): void => {    
    const timestamp = new Date().toISOString();
    const logged = `${timestamp} |${clientIp ? ` Client IP: ${clientIp} |` : ''} ${msg}`;
    if (isError) {
        console.error(logged);
    } else {
        console.log(logged);
    }    
    fs.appendFileSync(logFile, logged + '\n');
};

function clearWWW(url: string): string {
    return url.replace('www.', '');
}

// Function to log request details
const logRequest = (clientIp: string, hostname: string, targetPort: number, addition: string | null = null): void => {    
    logEntry(`proxied ${hostname} to ${targetPort}${addition ? ` ${addition}` : ''}`, clientIp);
};

const proxy = httpProxy.createProxyServer({
    changeOrigin: true,
    ws: true,
    secure: false
});

const determineProtocolFromOrigin = (origin: string, req: http.IncomingMessage): string => {
    const forwardedProto = req.headers['x-forwarded-proto'] as string;
    if (forwardedProto) {
        console.log(`DEBUG: X-Forwarded-Proto: ${forwardedProto}`);
        return forwardedProto;
    }

    // Jeśli origin jest wss, zwróć wss
    if (origin.startsWith('wss://')) return 'wss';
    
    // Sprawdź nagłówki i socket
    const protocols = [
        req.headers['x-forwarded-proto'] as string,
        req.headers['x-forwarded-protocol'] as string,
        req.headers['x-proto'] as string,
        (req.socket as any).encrypted ? 'https' : 'http'
    ];

    // Znajdź pierwszy niepusty protokół
    const detectedProtocol = protocols.find(p => p);

    // Specjalny case dla WebSocket
    const isWebSocketRequest = req.url?.includes('socket.io') || 
                                (req.headers['upgrade'] && req.headers['upgrade'].toLowerCase() === 'websocket');
    
    if (isWebSocketRequest) {
        return detectedProtocol === 'http' ? 'ws' : 'wss';
    }

    return detectedProtocol || 'https';
};



proxy.on('error', (error: Error & { code?: string }, req: http.IncomingMessage, res: http.ServerResponse) => {
    const hostname = clearWWW((req.headers.host as string).split(':')[0]); // Extract domain name

    logEntry(`Proxy encountered an error`, req.socket ? req.socket.remoteAddress : null, true);    

    switch (error.code) {
        case 'ECONNRESET': 
            logEntry(`Proxy target is not online: ${hostname}`, req.socket ? req.socket.remoteAddress : null, true); 
            break;
        default: 
            logEntry(`Proxy error caught: ${error.message}`, req.socket ? req.socket.remoteAddress : null, true);    
    }  
  
    res.end('Proxy encountered an error.');
});

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const hostname = clearWWW((req.headers.host as string).split(':')[0]); // Extract domain name
    const clientIP = req.socket.remoteAddress; // Get client IP    

    const targetRoute = findTargetRoute(hostname);

    let addition = '';

    if (req.headers['x-proxied-with-vhost']) {
        addition = `[BY: ${req.headers['x-proxied-with-vhost']}]`;
    }

    if (targetRoute) {
        // Zachowaj oryginalne parametry GET dla Socket.IO
        const targetUrl = new URL(`${targetRoute.ws ? 'ws' : 'http'}://[::1]:${targetRoute.port}${req.url}`);

        const proxyOptions = { 
            target: targetUrl.origin,
            changeOrigin: true,
            ws: targetRoute.ws || req.url?.includes('socket.io'),
            toProxy: true,
            // Zachowaj pełną ścieżkę z parametrami
            path: targetUrl.pathname + targetUrl.search
        };            

        logRequest(clientIP || '', hostname, targetRoute.port, addition);
        
        proxy.web(req, res, proxyOptions);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Domain not found in proxy configuration.');
        logEntry(`ERROR: HTTP Domain not found in proxy configuration: ${hostname}${addition ? ` ${addition}` : ''}`, clientIP || null, true);
    }
});

server.on('upgrade', async (req: http.IncomingMessage, socket: any, head: Buffer) => {
    const hostname = clearWWW((req.headers.host as string).split(':')[0]);
    const clientIP = req.socket ? req.socket.remoteAddress : socket.remoteAddress;    
    
    const reqUrl: string = req.url as string;

    const token = (reqUrl.substring(reqUrl.indexOf('?') + 1).split('&')[0]).split('=')[1];

    if(!token){
        logEntry('No token', clientIP, true);
        return;
    }    

    const wsKey = req.headers['sec-websocket-key'];

    if(!wsKey){
        logEntry('No ws key', clientIP, true);
        return;
    }
    
    if(!connectedUsers.has(wsKey)){
        logEntry('Authenticating: ' + wsKey);

        if(await DB.auth(token)){
            connectedUsers.set(wsKey, {
                pubKey: token
            });
        }else{
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.destroy();
            return;
        }     
    }

    const targetRoute = findTargetRoute(hostname);
   

    let addition = '';
    if (req.headers['x-proxied-with-vhost']) {
        addition = `[BY: ${req.headers['x-proxied-with-vhost']}]`;
    }

    if (targetRoute) {     
        logEntry(`WebSocket upgrade request for ${hostname} proxied to ${targetRoute.port}${addition ? ` ${addition}` : ''}`, clientIP);
   

        // if(req.headers['authorization']){

        // }

        // Proxy WebSocket z dodatkowymi opcjami
        proxy.ws(req, socket, head, { 
            target: `http://${targetRoute.host}:${targetRoute.port}`,
            changeOrigin: true,
            ws: true,
            secure: false,
            xfwd: true,  // Dodaj nagłówki X-Forwarded
            followRedirects: true,
            // Specyficzne opcje dla Socket.IO
            headers: {
                'Upgrade': 'websocket',
                'Connection': 'Upgrade',
                'X-Forwarded-For': clientIP,
                'X-Real-IP': clientIP
            }
        });
    } else {
        // Jeśli domena nie jest obsługiwana, zamknij socket
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        logEntry(`ERROR: WebSocket domain not found in proxy configuration: ${hostname}${addition ? ` ${addition}` : ''}`, clientIP || null, true);
    }

    socket.on('close', () => {
        if(connectedUsers.has(wsKey)){
            connectedUsers.delete(wsKey);
        }
    });

    socket.on('end', () => {
        if(connectedUsers.has(wsKey)){
            connectedUsers.delete(wsKey);
        }
    });
});

proxy.on('proxyRes', (proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) => {    
    logEntry(`Proxy response status: ${res.statusCode}`);
});

server.on('error', (err: Error) => {    
    logEntry(`ERROR: ${err.message}`, null, true);
});

const port = routingTableData.proxyPort;

function findTargetRoute(hostname: string): RouteConfig | null
{
    let targetRoute: RouteConfig | null = null;
    for (const routeEntry of Object.entries(routingTableData.routes)) {        
        const routeEntryKey = routeEntry[0];
        const config = routeEntry[1];
        const domain = config.host; // Użyj host z configu lub klucza jako domeny

        if (domain === hostname && config.ws) {
            targetRoute = config;
            break;
        }
    }

    return targetRoute;
}

server.listen(port, () => {
    logEntry(`Proxy server running on port ${port}`);
    logEntry(`Proxy routingTable: ${JSON.stringify(routingTableData, null, 2)}`);
});
