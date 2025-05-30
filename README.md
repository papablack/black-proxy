# Black Proxy

A TypeScript-based HTTP/WebSocket proxy server with routing table configuration.

## Features

- HTTP and WebSocket proxying
- Domain-based routing configuration
- PM2 process management
- Comprehensive logging
- TypeScript support with strict type checking

## Project Structure

```
black-proxy/
├── src/                    # TypeScript source files
│   ├── types.ts           # Type definitions
│   ├── _routingTable.ts   # Routing configuration
│   ├── proxy.ts           # Main proxy server
│   ├── run.ts             # Server startup script
│   ├── stop.ts            # Server shutdown script
│   └── test.ts            # WebSocket test client
├── dist/                  # Compiled JavaScript files
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript project:
```bash
npm run build
```

## Configuration

Edit `src/_routingTable.ts` to configure your routing table:

```typescript
import { RoutingTable } from './types';

const routingTable: RoutingTable = {
    'your-domain.com': {
        port: 3000,
        host: '[::1]'
    },
    'ws-domain.com': {
        host: '[::1]',
        port: 3001,
        ws: true  // Enable WebSocket support
    }
};

export default routingTable;
```

## Usage

### Development

Run in development mode with TypeScript compilation:
```bash
npm run dev
```

### Production

Build and start the proxy server:
```bash
npm start
```

Stop the proxy server:
```bash
npm stop
```

### Testing

Test WebSocket connections:
```bash
npm test
```

### Manual Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Build and start the proxy server with PM2
- `npm stop` - Build and stop the proxy server
- `npm run dev` - Run in development mode with ts-node
- `npm test` - Build and run WebSocket test client

## Type Definitions

The project includes comprehensive TypeScript types:

### RouteConfig
```typescript
interface RouteConfig {
  port: number;
  host?: string;
  ws?: boolean;
}
```

### RoutingTable
```typescript
interface RoutingTable {
  [domain: string]: RouteConfig;
}
```

## Migration from JavaScript

This project has been migrated from JavaScript to TypeScript. The original JavaScript files are preserved for reference:

- `proxy.js` → `src/proxy.ts`
- `run.js` → `src/run.ts`
- `stop.js` → `src/stop.ts`
- `test.js` → `src/test.ts`
- `_routingTable.js` → `src/_routingTable.ts`

## Features

### HTTP Proxying
- Automatic domain-based routing
- Support for custom headers
- Client IP logging
- Error handling and logging

### WebSocket Support
- WebSocket upgrade handling
- Socket.IO compatibility
- Protocol detection (ws/wss)
- Connection logging

### Process Management
- PM2 integration for process management
- Automatic restart on failure
- Log streaming
- Graceful shutdown

### Logging
- Comprehensive request/response logging
- Error tracking
- Client IP tracking
- Timestamp logging

## Requirements

- Node.js 16+
- npm or yarn
- PM2 (installed as dependency)

## License

ISC
