/* eslint-disable @typescript-eslint/naming-convention */
export interface GitService {
  InstanceURL: string;
  GraphQLEndPoint?: string;
  APIEndPoint?: string;
  API_Key?: string;
  Name?: string;
  ID?: string; //some unique ID for this service instance, will be set from the backend
  AccountName?: string; //used to track Github user/org name
  AccountType?: string; //(GitHub) User or Organization
}
