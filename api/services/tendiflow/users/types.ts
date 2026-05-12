import { Membership } from "../memberships/types";
import { TendiflowFile } from "../types/file";
import {
  BasicApiResponse,
  ErrorApiResponse,
  Language,
  OrderBy,
} from "../types/general";

// Enums
export enum UserStatus {
  ACTIVE = "active",
  DEACTIVATED = "deactivated",
  PENDING = "pending",
}

export enum UserKind {
  INTERNAL = "internal",
  EXTERNAL = "external",
  SYSTEM = "system",
}

export enum UserSortBy {
  CREATED_AT = "created_at",
  LAST_LOGGED_IN_AT = "last_logged_in_at",
  LAST_ACTIVE_AT = "last_active_at",
  EMAIL = "email",
  FIRST_NAME = "first_name",
  LAST_NAME = "last_name",
}

export enum ApiActionUser {
  // Collection operations
  GET_FILTERED = "GET_FILTERED",
  CREATE = "CREATE",

  // Individual user operations
  GET_BY_ID = "GET_BY_ID",
  UPDATE = "UPDATE",
  DELETE = "DELETE",

  // User-specific operations
  UPDATE_STATUS = "UPDATE_STATUS",
}

// User interfaces
export interface UserBase {
  status: UserStatus;
  kind: UserKind;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  organisation_name: string | null;
  division: string | null;
  occupation: string | null;
  language: Language;
}

export interface UserSystem {
  email_verified_datetime: string | null;
  phone_number_verified_datetime: string | null;
}

export interface UserAdmin {
  is_admin: boolean;
  is_superuser: boolean;
}

export interface UserActivity {
  last_logged_in_at: string | null;
  last_active_at: string | null;
}

export interface UserAvatar {
  avatar: TendiflowFile | null;
}

export interface UserRelatives {
  memberships: Membership[] | null;
}

export interface User
  extends UserBase,
    UserSystem,
    UserAdmin,
    UserActivity,
    UserAvatar,
    UserRelatives {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
}

// Request interfaces
export interface UserCreate extends UserBase {
  password: string;
}

export interface UserUpdate {
  first_name: string;
  last_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  organisation_name: string | null;
  division: string | null;
  occupation: string | null;
  language: Language | null;
}

export interface UserStatusUpdate {
  status: UserStatus;
}

export interface UserPasswordUpdate {
  current_password: string;
  new_password: string;
}

// Query interfaces
export interface UserQuery {
  statuses?: UserStatus[] | null;
  kinds?: UserKind[] | null;
  languages?: Language[] | null;
  is_admin?: boolean | null;
  is_superuser?: boolean | null;
  email_verified?: boolean | null;
  search?: string | null;
  sort_by?: UserSortBy;
  order_by?: OrderBy;
}

export interface UserParams {
  skip?: number;
  limit?: number;
}

// API Response types
export type GetUsersResponseApi = User[] | ErrorApiResponse;
export type GetUserResponseApi = User | ErrorApiResponse;
export type CreateUserResponseApi = User | ErrorApiResponse;
export type UpdateUserResponseApi = User | ErrorApiResponse;
export type UpdateUserStatusResponseApi = User | ErrorApiResponse;
export type DeleteUserResponseApi = BasicApiResponse | ErrorApiResponse;

// Service props
export interface GetManyFilteredUsersProps {
  query: UserQuery;
  params: UserParams;
}

export interface GetByIdUserProps {
  id: string;
}

export interface CreateUserProps {
  data: UserCreate;
}

export interface UpdateUserProps {
  id: string;
  data: UserUpdate;
}

export interface UpdateUserStatusProps {
  id: string;
  data: UserStatusUpdate;
}

export interface UpdateUserPasswordProps {
  id: string;
  data: UserPasswordUpdate;
}

export interface DeleteUserProps {
  id: string;
}
