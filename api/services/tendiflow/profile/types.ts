import { MembershipPermission } from "../memberships/types";
import { ErrorApiResponse, Language } from "../types/general";
import { User } from "../users/types";

export enum ApiActionProfile {
  // Profile operations
  GET_PROFILE = "GET_PROFILE",
  UPDATE_PROFILE = "UPDATE_PROFILE",

  // Password operations
  CHANGE_PASSWORD = "CHANGE_PASSWORD",
  REQUEST_PASSWORD_RESET = "REQUEST_PASSWORD_RESET",
  CONFIRM_PASSWORD_RESET = "CONFIRM_PASSWORD_RESET",

  // Email verification operations
  REQUEST_EMAIL_VERIFICATION = "REQUEST_EMAIL_VERIFICATION",
  CONFIRM_EMAIL_VERIFICATION = "CONFIRM_EMAIL_VERIFICATION",

  // Attendance operations
  MY_ATTENDANCES = "MY_ATTENDANCES",
  MY_ATTENDANCE = "MY_ATTENDANCE",
  MY_ATTENDANCE_STATISTICS = "MY_ATTENDANCE_STATISTICS",
}

// Request interfaces
export interface ProfileUpdate {
  first_name: string;
  last_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  organisation_name: string | null;
  division: string | null;
  occupation: string | null;
  language: Language | null;
}

export interface PasswordChangeUpdate {
  current_password: string;
  new_password: string;
}

export interface PasswordResetRequestClient {
  email: string;
}
export type PasswordResetRequest = PasswordResetRequestClient;

export interface PasswordResetConfirmClient {
  email: string;
  code: string;
  new_password: string;
}
export type PasswordResetConfirm = PasswordResetConfirmClient;

export interface EmailVerificationRequestClient {
  email: string;
}
export type EmailVerificationRequest = EmailVerificationRequestClient;

export interface EmailVerificationConfirm {
  code: string;
  email: string;
}

// Response interfaces
export interface SuccessResponse {
  success: boolean;
  message: string;
}

// API Response types
export type GetProfileResponseApi = User | ErrorApiResponse;
export type UpdateProfileResponseApi = User | ErrorApiResponse;
export type ChangePasswordResponseApi = SuccessResponse | ErrorApiResponse;
export type PasswordResetRequestResponseApi =
  | SuccessResponse
  | ErrorApiResponse;
export type PasswordResetConfirmResponseApi =
  | SuccessResponse
  | ErrorApiResponse;
export type EmailVerificationRequestResponseApi =
  | SuccessResponse
  | ErrorApiResponse;
export type EmailVerificationConfirmResponseApi =
  | SuccessResponse
  | ErrorApiResponse;

// Service props

export interface UpdateProfileProps {
  user_id: string;
  data: ProfileUpdate;
}

export interface ChangePasswordProps {
  user_id: string;
  data: PasswordChangeUpdate;
}

export interface PasswordResetRequestProps {
  data: PasswordResetRequest;
}

export interface PasswordResetConfirmProps {
  data: PasswordResetConfirm;
}

export interface EmailVerificationRequestProps {
  data: EmailVerificationRequest;
}

export interface EmailVerificationConfirmProps {
  data: EmailVerificationConfirm;
}

// Hook interfaces
export interface UseCurrentUser {
  currentUser: User | null;
  organisationIds: string[] | null;
  currentOrganisationId: string | null;
  currentOrganisationPermission: MembershipPermission | null;
  isLoading: boolean;
  error: string;
  mutateCurrentUser: () => void;
}

export interface CurrentUserContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  mutateCurrentUser: () => void;
  organisationIds: string[] | null;
  currentOrganisationId: string | null;
  currentOrganisationPermission: MembershipPermission | null;
}
