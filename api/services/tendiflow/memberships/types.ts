import { BasicApiResponse, ErrorApiResponse, OrderBy } from "../types/general";

// Enums
export enum MembershipStatus {
  PENDING = "pending",
  DECLINED = "declined",
  ACTIVE = "active",
  DEACTIVATED = "deactivated",
}

export enum MembershipAdminStatus {
  ACTIVE = "active",
  DEACTIVATED = "deactivated",
}

export enum MembershipInviteeStatus {
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export enum MembershipPermission {
  OWNER = "owner",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export const PERMISSION_WEIGHTS: Record<MembershipPermission, number> = {
  [MembershipPermission.OWNER]: 100,
  [MembershipPermission.EDITOR]: 50,
  [MembershipPermission.VIEWER]: 1,
};

export enum MembershipSortBy {
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  ROLE = "role",
  STATUS = "status",
}

export enum ApiActionMembership {
  // Collection operations
  GET_FILTERED = "GET_FILTERED",
  INVITE_USER = "INVITE_USER",

  // Invitation operations
  RESPOND_TO_INVITATION = "RESPOND_TO_INVITATION",

  // Individual membership operations
  GET_BY_ID = "GET_BY_ID",
  UPDATE_PERMISSION = "UPDATE_PERMISSION",
  UPDATE_STATUS = "UPDATE_STATUS",
  DELETE = "DELETE",
}

// Base interfaces
export interface MembershipForeignKeys {
  user_id: string;
  organisation_id: string;
}

export interface MembershipBase {
  status: MembershipStatus;
  permission: MembershipPermission;
}

export interface Membership extends MembershipForeignKeys, MembershipBase {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
}

// Request interfaces
export interface MembershipInviteCreate {
  first_name: string | null;
  last_name: string | null;
  user_email: string;
  permission: MembershipPermission;
}

export interface MembershipPermissionUpdate {
  permission: MembershipPermission;
}

export interface MembershipAdminStatusUpdate {
  status: MembershipAdminStatus;
}

export interface MembershipInviteeStatusUpdate {
  status: MembershipInviteeStatus;
}

// Query interfaces
export interface MembershipQuery {
  user_ids?: string[] | null;
  statuses?: MembershipStatus[] | null;
  permissions?: MembershipPermission[] | null;
  search?: string | null;
  sort_by?: MembershipSortBy;
  order_by?: OrderBy;
}

export interface MembershipParams {
  skip?: number;
  limit?: number;
}

// API Response types
export type GetMembershipsResponseApi = Membership[] | ErrorApiResponse;
export type GetMembershipResponseApi = Membership | ErrorApiResponse;
export type InviteUserResponseApi = Membership | ErrorApiResponse;
export type RespondToInvitationResponseApi = Membership | ErrorApiResponse;
export type UpdateMembershipPermissionResponseApi =
  | Membership
  | ErrorApiResponse;
export type UpdateMembershipStatusResponseApi = Membership | ErrorApiResponse;
export type DeleteMembershipResponseApi = BasicApiResponse | ErrorApiResponse;

// Service props
export interface GetManyFilteredMembershipsProps {
  organisation_id: string;
  query: MembershipQuery;
  params: MembershipParams;
}

export interface InviteUserProps {
  organisation_id: string;
  data: MembershipInviteCreate;
}

export interface RespondToInvitationProps {
  organisation_id: string;
  data: MembershipInviteeStatusUpdate;
}

export interface GetByIdMembershipProps {
  organisation_id: string;
  id: string;
}

export interface UpdateMembershipPermissionProps {
  organisation_id: string;
  id: string;
  data: MembershipPermissionUpdate;
}

export interface UpdateMembershipStatusProps {
  organisation_id: string;
  id: string;
  data: MembershipAdminStatusUpdate;
}

export interface DeleteMembershipProps {
  organisation_id: string;
  id: string;
}
