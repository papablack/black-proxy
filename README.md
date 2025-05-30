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
├── build/                  # Compiled JavaScript runfiles
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## Installation

Install dependencies:

```bash
npm install
```

## Configuration

Edit `src/_routingTable.ts` to configure your routing table:

```typescript
import { RoutingTable } from './types';

const routingTable: RoutingTable = {
    'your-domain.com': {
        port: 3000,
        host: '[::1]',
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

### Production

Build and start the proxy server:
```bash
npm start
```

Stop the proxy server:
```bash
npm stop
```

## Scripts

- `npm start` - Start the proxy server with PM2
- `npm stop` - Stop the proxy server
- `npm test` - Test ws server on the other side of proxy (port 3006)

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
- @rws-framework/tsc (transpiler, installed as dependency)

## License

ISC
