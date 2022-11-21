export interface LDAPConfig {
  server: string;
  requiresAuthentication: boolean;
  syncUserName: string;
  syncPassword: string;
  tls?: boolean;
  startTls?: boolean;
  port: string;
}

export interface LDAPConfigForm {
  server: string;
  port: string;
  tls: string;
  uid: string;
  urdns: string;
  user?: string;
  pwd?: string;
}


export interface LDAPFilter {
  operator: number;
  filters: FilterExpression[];
  filterGroups: LDAPFilter[];
}


export interface FilterExpression {
  name: string;
  value: string;
}
