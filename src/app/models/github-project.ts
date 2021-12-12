/* eslint-disable @typescript-eslint/naming-convention */
export interface GitHubProject {
  InstanceID: string; //GitHub instance ID
  Name: string;
  ID: string;
  IsArchived: boolean;
  IsDisabled: boolean;
  Url: string;
}


export interface GitHubGroup {
  ID: string | null;
  Name: string;
  EmailDisabled: boolean;
  Description: string;
  FullName: string;
  Contacts: Contacts;
  GroupMembers: GitHubGroupMembers;
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


export interface GitHubGroupMembers {
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

export interface GitHubGroupedProjects {
  ID: string;
  Name: string;
  Projects: GitHubProject[];
}


export interface GitHubProjectSearchResult {
  InstanceID: string;
  Projects: GitHubProject[];
  EndCursor: string;
  HasNextPage: boolean;
  RemainingProjectsCount: number;
}


export interface GitHubPagedSearch {
  ServiceID: string;
  PageSize: number;
  First: number;
  NextCursor: string;
}
