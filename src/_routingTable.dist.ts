import { RoutingTable } from './types';

const routingTable: RoutingTable = {
    proxyPort: 5500,
    routes: {
        'api.localhost': {
            port: 3005,
            host: '[::1]'
        },
        'ws.localhost': {
            host: '[::1]',
            port: 3006,
            ws: true
        }
    }    
};

export default routingTable;
