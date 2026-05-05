export interface RouteConfig {
  port: number;
  host?: string;
  ws?: boolean;
}

export interface RoutingTable {
  proxyPort: number,
  routes: {
    [domain: string]: RouteConfig;
  },
  dbUrl?: string;
}

export interface IProxyUser {
  pubKey: string
}