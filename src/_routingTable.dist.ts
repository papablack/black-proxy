import { RoutingTable } from './types';

const routingTable: RoutingTable = {
    'api.localhost': {
        port: 3005,
        host: 'localhost'
    },
    'ws.localhost': {
        host: 'localhost',
        port: 3006,
        ws: true
    }
};

export default routingTable;
