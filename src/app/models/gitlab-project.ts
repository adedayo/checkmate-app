/* eslint-disable @typescript-eslint/naming-convention */
export interface GitLabProject {
  Name: string;
  ID: string;
  NameWithNamespace: string;
  Description: string;
  HttpUrlToRepo: string;
  SshUrlToRepo: string;
  WebUrl: string;
  Archived: boolean;
  Group: GitLabGroup;
  Statistics: {
    RepositorySize: number;
    StorageSize: number;
  };
  Repository: {
    RootRef: string;
    Branches: string[];
  };
  ProjectMembers: {
    Nodes: {
      ID: string;
      User: {
        ID: string;
        Groups: {
          Nodes: any[];
        };
      };
    }[];
  };
}


export interface GitLabGroup {
  ID: string | null;
  Name: string;
  EmailDisabled: boolean;
  Description: string;
  FullName: string;
  Contacts: Contacts;
  GroupMembers: GitLabGroupMembers;
  Projects: {
    Nodes: {
      ID: string;
      Name: string;
      SshUrlToRepo: string;
    }[];
  };
}

export interface Contacts {
  Nodes: any[];
}


export interface GitLabGroupMembers {
  Nodes: {
    User: {
      ID: string;
      Username: string;
      GroupMemberships: {
        Nodes: {
          ID: string;
          Group: {
            ID: string;
            Name: string;
          };
        }[];
      };
    };
  }[];
}

export interface GitLabGroupedProjects {
  ID: string;
  Name: string;
  Projects: GitLabProject[];
}
