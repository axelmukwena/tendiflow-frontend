import { HeaderKey } from "@/utilities/helpers/enums";

// BASIC SERVICE RESPONSE
export interface BasicServiceResponse {
  success: boolean;
  message: string;
  statuscode?: number;
}

// BASIC API RESPONSE
export interface BasicApiResponse {
  title: string;
  message: string;
}

// DATA SERVICE RESPONSE
export interface DataServiceResponse<T> extends BasicServiceResponse {
  data?: T | null;
  total?: number | null;
}

// ERROR API RESPONSE
export interface ErrorApiResponse {
  title: string;
  description: string;
}

export type HeaderRequest = {
  [key in HeaderKey]?: string;
};

export enum DatabaseStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum Language {
  ENGLISH = "en",
}

export enum OrderBy {
  ASC = "asc",
  DESC = "desc",
}
