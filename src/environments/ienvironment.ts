export interface Environment {
  production: boolean;
  apiPath: string;
  apiPort: number;
  apiHost: string;
  wsProtocol: string; //whether to use ws vs wss
}
