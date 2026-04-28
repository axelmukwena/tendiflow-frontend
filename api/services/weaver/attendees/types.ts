import { ReactNode } from "react";

import { CustomFieldType, MeetingRelationship } from "../meetings/types";
import { OrganisationRelationship } from "../organisations/types";
import {
  BasicApiResponse,
  DatabaseStatus,
  DataServiceResponse,
  ErrorApiResponse,
  OrderBy,
} from "../types/general";

// Enums
export enum AttendanceStatus {
  REGISTERED = "registered",
  CHECKED_IN = "checked_in",
  CHECKED_IN_LATE = "checked_in_late",
  CANCELLED = "cancelled",
}

export enum AttendeeSortBy {
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  EMAIL = "email",
  FIRST_NAME = "first_name",
  LAST_NAME = "last_name",
  ATTENDANCE_STATUS = "attendance_status",
  CHECKIN_DATETIME = "checkin.checkin_datetime",
}

export enum ApiActionAttendee {
  GET_FILTERED = "GET_FILTERED",
  GET_BY_ID = "GET_BY_ID",
  UPDATE = "UPDATE",
  UPDATE_DATABASE_STATUS = "UPDATE_DATABASE_STATUS",
  DELETE = "DELETE",
  CANCEL = "CANCEL",
  SUBMIT_FEEDBACK = "SUBMIT_FEEDBACK",
  REGISTER = "REGISTER",
  GUEST_CHECKIN = "GUEST_CHECKIN",
  GET_GUEST_BY_FINGERPRINT = "GET_GUEST_BY_FINGERPRINT",
  UPDATE_GUEST_BY_FINGERPRINT = "UPDATE_GUEST_BY_FINGERPRINT",
  CANCEL_GUEST_BY_FINGERPRINT = "CANCEL_GUEST_BY_FINGERPRINT",
  SUBMIT_GUEST_FEEDBACK = "SUBMIT_GUEST_FEEDBACK",
}

export interface AttendeeForeignKeys {
  organisation_id: string;
  meeting_id: string;
  user_id: string;
}

export interface AttendeeStatus {
  attendance_status: AttendanceStatus;
}

export interface AttendeeCheckinLocation {
  latitude: number;
  longitude: number;
  address: string;
  ip_address: string;
  accuracy: number;
  timestamp: string;
}

export interface AttendeeCheckinDevice {
  browser: string | null;
  os: string | null;
  device: string | null;
  user_agent: string;
  screen_resolution: string | null;
  timezone: string | null;
}

export interface AttendeeCheckinInfo {
  device_fingerprint: string;
  session_id: string;
  checkin_datetime: string;
  checkin_location: AttendeeCheckinLocation;
  checkin_device: AttendeeCheckinDevice | null;
}

export interface AttendeeFeedbackInfo {
  rating: number | null;
  comment: string | null;
  feedback_datetime: string | null;
}

export interface AttendeeCustomFieldResponse {
  customfield_id: string;
  field_name: string;
  field_type: CustomFieldType;
  value: ReactNode;
}

export interface AttendeeCheckin {
  checkin: AttendeeCheckinInfo | null;
}

export interface AttendeeFeedback {
  feedback: AttendeeFeedbackInfo | null;
}

export interface AttendeeBase {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  organisation_name: string | null;
  division: string | null;
  occupation: string | null;
  custom_field_responses: AttendeeCustomFieldResponse[] | null;
}

export interface AttendeeRelatives {
  organisation: OrganisationRelationship | null;
  meeting: MeetingRelationship | null;
}

export interface Attendee
  extends AttendeeForeignKeys,
    AttendeeBase,
    AttendeeStatus,
    AttendeeCheckin,
    AttendeeFeedback,
    AttendeeRelatives {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
  database_status: DatabaseStatus;
}

// Request interfaces
export interface AttendeeCheckinInfoCreate extends AttendeeCheckinInfo {}

export interface AttendeeCheckinCreate {
  checkin: AttendeeCheckinInfoCreate;
}

export interface AttendeeFeedbackInfoCreate extends AttendeeFeedbackInfo {}

export interface AttendeeFeedbackCreateInternal {
  feedback: AttendeeFeedbackInfoCreate | null;
}

export interface AttendeeBaseCreate extends AttendeeBase {
  meeting_id: string;
  user_id?: string | null;
}

export interface AttendeeCreateGuestClient
  extends AttendeeBaseCreate,
    AttendeeCheckinCreate,
    AttendeeFeedbackCreateInternal {}

export type AttendeeCreateGuest = AttendeeCreateGuestClient;

export interface AttendeeUpdate extends AttendeeBase {}

export interface AttendeeUpdateGuestClient extends AttendeeBase {}
export type AttendeeUpdateGuest = AttendeeUpdateGuestClient;

export interface AttendeeCancel {
  status: AttendanceStatus;
}

export interface AttendeeDatabaseStatusUpdate {
  database_status: DatabaseStatus;
}

export interface AttendeeFeedbackCreateClient
  extends AttendeeFeedbackCreateInternal {}

export type AttendeeFeedbackCreate = AttendeeFeedbackCreateClient;

// Query interfaces
export interface AttendeeQuery {
  ids?: string[] | null;
  meeting_ids?: string[] | null;
  user_ids?: string[] | null;
  attendance_statuses?: AttendanceStatus[] | null;
  database_statuses?: DatabaseStatus[] | null;
  has_checked_in?: boolean | null;
  has_feedback?: boolean | null;
  registered_from?: string | null;
  registered_to?: string | null;
  search?: string | null;
  sort_by?: AttendeeSortBy;
  order_by?: OrderBy;
}

export interface AttendeeParams {
  skip?: number;
  limit?: number;
}

export interface AttendeeUserStatisticsQuery {
  attendance_statuses?: AttendanceStatus[] | null;
  from_date?: string | null;
  to_date?: string | null;
}

export interface AttendeeUserStatistics {
  user_id: string;
  meetings_attended_count: number;
  unique_organisations_count: number;
  first_attendance_date: string | null;
  last_attendance_date: string | null;
}

// API Response types
export type GetAttendeesResponseApi = Attendee[] | ErrorApiResponse;
export type GetAttendeeResponseApi = Attendee | ErrorApiResponse;
export type RegisterAttendeeResponseApi = Attendee | ErrorApiResponse;
export type GuestCheckinResponseApi = Attendee | ErrorApiResponse;
export type GetGuestAttendeeResponseApi = Attendee | ErrorApiResponse;
export type UpdateGuestAttendeeResponseApi = Attendee | ErrorApiResponse;
export type CancelGuestAttendanceResponseApi = Attendee | ErrorApiResponse;
export type UpdateAttendeeResponseApi = Attendee | ErrorApiResponse;
export type UpdateAttendeeDatabaseStatusResponseApi =
  | Attendee
  | ErrorApiResponse;
export type DeleteAttendeeResponseApi = BasicApiResponse | ErrorApiResponse;
export type CancelAttendanceResponseApi = Attendee | ErrorApiResponse;
export type SubmitFeedbackResponseApi = Attendee | ErrorApiResponse;
export type SubmitGuestFeedbackResponseApi = Attendee | ErrorApiResponse;
export type GetAttendeeUserStatisticsResponseApi =
  | AttendeeUserStatistics
  | ErrorApiResponse;

// Service props
export interface GetManyFilteredAttendeesProps {
  organisation_id: string;
  query: AttendeeQuery;
  params: AttendeeParams;
}

export interface GetByIdAttendeeProps {
  organisation_id: string;
  id: string;
}

export interface RegisterAttendeeProps {
  organisation_id: string;
  data: AttendeeBaseCreate;
}

export interface GuestCheckinProps {
  organisation_id: string;
  data: AttendeeCreateGuest;
}

export interface GetGuestAttendeeClientProps {
  organisation_id: string;
  device_fingerprint: string;
}

export type GetGuestAttendeeProps = GetGuestAttendeeClientProps;

export interface UpdateGuestAttendeeClientProps {
  organisation_id: string;
  device_fingerprint: string;
  data: AttendeeUpdateGuestClient;
}
export type UpdateGuestAttendeeProps = UpdateGuestAttendeeClientProps;

export interface CancelGuestAttendanceClientProps {
  organisation_id: string;
  device_fingerprint: string;
}
export type CancelGuestAttendanceProps = CancelGuestAttendanceClientProps;

export interface UpdateAttendeeProps {
  organisation_id: string;
  id: string;
  data: AttendeeUpdate;
}

export interface UpdateAttendeeDatabaseStatusProps {
  organisation_id: string;
  id: string;
  data: AttendeeDatabaseStatusUpdate;
}

export interface DeleteAttendeeProps {
  organisation_id: string;
  id: string;
}

export interface CancelAttendanceProps {
  organisation_id: string;
  id: string;
}

export interface SubmitFeedbackProps {
  organisation_id: string;
  id: string;
  data: AttendeeFeedbackCreate;
}

export interface SubmitGuestFeedbackProps {
  organisation_id: string;
  device_fingerprint: string;
  data: AttendeeFeedbackCreate;
}

export interface GetAttendeeUsersProps {
  user_id: string;
  query: AttendeeQuery;
  params: AttendeeParams;
}

export interface GetAttendeeUserProps {
  user_id: string;
  attendance_id: string;
}

export interface GetAttendeeUserStatisticsProps {
  user_id: string;
  query: AttendeeUserStatisticsQuery;
}

// Hook interfaces

export interface UseAttendee {
  attendee?: Attendee | null;
  isLoading: boolean;
  error: string | null;
  mutateAttendee: () => void;
}

export interface UseAttendees {
  attendees: Attendee[];
  isLoading: boolean;
  error: string;
  mutateAttendees: () => void;
}

export type AttendeesManyResponse = DataServiceResponse<
  Attendee[] | null
> | null;
