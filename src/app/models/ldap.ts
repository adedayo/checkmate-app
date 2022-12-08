export interface LDAPConfig {
  server: string;
  requiresAuthentication: boolean;
  syncUserName: string;
  syncPassword: string;
  tls?: boolean;
  startTls?: boolean;
  port: string;
}

export interface LDAPAuthData {
  server: string;
  port: string;
  tls: string;
  uid: string;
  urdns: string;
  user?: string;
  pwd?: string;
}

export interface AuthResult {
  success: boolean;
  errorMessage: string;
}

export interface LDAPFilter {
  operator: number;
  filters: FilterExpression[];
  filterGroups: LDAPFilter[];
}

export interface GroupMembershipAssociator {
  operator: number;
  constraints: Constraint[];
  additionalRules: GroupMembershipAssociator[];
}

export interface Constraint {
  userAttribute: string;
  groupAttribute: string;
}


export interface FilterExpression {
  name: string;
  value: string;
}

export interface BaseDN {
  baseDN: string;
}

export interface LDAPSyncConfig {
  server: string;
  port: string;
  urdns: string;
  uid: string;
  tls: string;
  baseDNs: string[];
  syncRequiresAuth: boolean;
  syncUserName: string;
  syncPassword: string;
  userFilter: LDAPFilter;
  groupFilter: LDAPFilter;
  groupMembership: GroupMembershipAssociator;
}


export interface LDAPRecords {
  entries: LDAPEntry[];
  usersAndGroups: UsersAndGroups;
}

export interface UsersAndGroups {
  users: User[];
  groups: Group[];
}

export interface User {
  id: string;
  dn: string;
}

export interface Group {
  id: string;
  dn: string;
  members: string[];
}

export interface LDAPEntry {
  dn: string;
  attributes: LDAPAttributes[];

}

export interface LDAPAttributes {
  name: string;
  values: string[];
}
