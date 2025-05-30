export interface RouteConfig {
  port: number;
  host?: string;
  ws?: boolean;
}

export interface RoutingTable {
  [domain: string]: RouteConfig;
}
