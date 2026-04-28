import { OrganisationRelationship } from "../organisations/types";
import { WeaverMimeType } from "../types/file";
import {
  BasicApiResponse,
  DatabaseStatus,
  DataServiceResponse,
  ErrorApiResponse,
  OrderBy,
} from "../types/general";

// Enums

export enum RecurringFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum RecurringUpdateType {
  THIS_ONLY = "this_only",
  THIS_AND_FUTURE = "this_and_future",
  ALL = "all",
}

export enum CustomFieldType {
  TEXT = "text",
  NUMBER = "number",
  EMAIL = "email",
  PHONE = "phone",
  SELECT_ONE = "select_one",
  SELECT_MULTIPLE = "select_multiple",
  CHECKBOX = "checkbox",
  TEXTAREA = "textarea",
  MONEY = "money",
  DATE = "date",
  URL = "url",
}

export enum MeetingSortBy {
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  START_DATETIME = "start_datetime",
  END_DATETIME = "end_datetime",
  TITLE = "title",
  EXPECTED_ATTENDEES = "expected_attendees",
}

export enum ApiActionMeeting {
  // Collection operations
  GET_FILTERED = "GET_FILTERED",

  // Individual meeting operations
  CREATE = "CREATE",
  GET_BY_ID = "GET_BY_ID",
  UPDATE = "UPDATE",
  DELETE = "DELETE",

  // Meeting-specific operations
  REGENERATE_QRCODE = "REGENERATE_QRCODE",
  UPDATE_DATABASE_STATUS = "UPDATE_DATABASE_STATUS",
  GET_RECURRING_SERIES = "GET_RECURRING_SERIES",
  CHECK_LOCATION = "CHECK_LOCATION",
  PUBLIC = "PUBLIC",
}

// Base interfaces
export interface WeaverFile {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
  blob_name: string;
  name: string;
  pathname: string;
  mime_type: WeaverMimeType;
  size_bytes: number;
  position: number;
  notes: string | null;
}

export interface MeetingForeignKeys {
  organisation_id: string;
  parent_meeting_id: string | null;
}

export interface MeetingLocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface MeetingSettings {
  require_location_verification: boolean;
  checkin_radius_meters: number | null;
  checkin_window_seconds: number | null;
  late_checkin_seconds: number | null;
  feedback_window_seconds: number | null;
  send_reminders: boolean | null;
  reminder_intervals: number[] | null;
}

export interface MeetingCustomFieldValidation {
  min_length: number | null;
  max_length: number | null;
  min_value: number | null;
  max_value: number | null;
  pattern: string | null;
}

export interface MeetingCustomField {
  id: string;
  field_name: string;
  field_type: CustomFieldType;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  options: string[] | null;
  validation: MeetingCustomFieldValidation | null;
  position: number;
}

export interface MeetingRecurringPattern {
  frequency: RecurringFrequency;
  interval: number;
  days_of_week: number[] | null;
  day_of_month: number | null;
  end_date: string | null;
  max_occurrences: number;
}

export interface MeetingBase {
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  address: string | null;
  coordinates: MeetingLocationCoordinates | null;
  settings: MeetingSettings;
  custom_fields: MeetingCustomField[] | null;
  recurring_pattern: MeetingRecurringPattern | null;
  expected_attendees: number | null;
  tags: string[] | null;
  notes: string | null;
}

export interface MeetingQrcode {
  qrcode: WeaverFile | null;
  check_in_url: string | null;
}

export interface MeetingImage {
  image: WeaverFile | null;
}

export interface MeetingAttachments {
  attachments: WeaverFile[] | null;
}

export interface MeetingRelatives {
  organisation: OrganisationRelationship | null;
}

export interface Meeting
  extends MeetingForeignKeys,
    MeetingBase,
    MeetingQrcode,
    MeetingImage,
    MeetingAttachments,
    MeetingRelatives {
  id: string;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  updator_id: string | null;
  database_status: DatabaseStatus;
}

export interface MeetingRelationship {
  id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  address: string | null;
  coordinates: MeetingLocationCoordinates | null;
}

// QR Code options
export interface QrcodeOptions {
  dark_color: string;
  light_color: string;
}

// Request interfaces
export interface MeetingCustomFieldCreate extends MeetingCustomField {}

export interface MeetingRecurringPatternCreate
  extends MeetingRecurringPattern {}

export interface MeetingCreate extends MeetingBase {
  custom_fields: MeetingCustomFieldCreate[] | null;
  recurring_pattern: MeetingRecurringPatternCreate | null;
  qrcode_options: QrcodeOptions;
}

export interface MeetingUpdateEffect {
  update_type: RecurringUpdateType;
  update_message: string | null;
  notify_attendees: boolean;
}

export interface MeetingUpdate extends MeetingCreate {
  update_effect: MeetingUpdateEffect | null;
}

export interface MeetingDatabaseStatusUpdate {
  database_status: DatabaseStatus;
}

export interface CheckMeetingLocation {
  within_radius: boolean;
  required_radius_meters: number | null;
  meeting_has_location: boolean;
  distance_meters: number | null;
  meeting_coordinates: MeetingLocationCoordinates | null;
}

// Query interfaces
export interface MeetingRadiusSearch {
  latitude: number;
  longitude: number;
  radius_km: number;
}

export interface MeetingQuery {
  ids?: string[] | null;
  database_statuses?: DatabaseStatus[] | null;
  start_date_from?: string | null;
  start_date_to?: string | null;
  is_recurring?: boolean | null;
  has_coordinates?: boolean | null;
  tags?: string[] | null;
  within_radius?: MeetingRadiusSearch | null;
  search?: string | null;
  sort_by?: MeetingSortBy;
  order_by?: OrderBy;
}

export interface MeetingParams {
  skip?: number;
  limit?: number;
}

// API Response types
export type GetMeetingsResponseApi = Meeting[] | ErrorApiResponse;
export type GetMeetingResponseApi = Meeting | ErrorApiResponse;
export type CreateMeetingResponseApi = Meeting | ErrorApiResponse;
export type RegenerateMeetingQrcodeResponseApi = Meeting | ErrorApiResponse;
export type UpdateMeetingResponseApi = Meeting | ErrorApiResponse;
export type UpdateMeetingDatabaseStatusResponseApi = Meeting | ErrorApiResponse;
export type DeleteMeetingResponseApi = BasicApiResponse | ErrorApiResponse;
export type GetRecurringSeriesResponseApi = Meeting[] | ErrorApiResponse;
export type CheckMeetingLocationResponseApi =
  | CheckMeetingLocation
  | ErrorApiResponse;
export type GetPublicMeetingResponseApi = Meeting | ErrorApiResponse;

// Service props
export interface GetManyFilteredMeetingsProps {
  organisation_id: string;
  query: MeetingQuery;
  params: MeetingParams;
}

export interface CreateMeetingProps {
  organisation_id: string;
  data: MeetingCreate;
}

export interface RegenerateMeetingQrcodeProps {
  organisation_id: string;
  meeting_id: string;
  options?: QrcodeOptions;
}

export interface GetByIdMeetingProps {
  organisation_id: string;
  id: string;
}

export interface UpdateMeetingProps {
  organisation_id: string;
  id: string;
  data: MeetingUpdate;
}

export interface UpdateMeetingDatabaseStatusProps {
  organisation_id: string;
  id: string;
  data: MeetingDatabaseStatusUpdate;
}

export interface DeleteMeetingProps {
  organisation_id: string;
  id: string;
  update_effect?: MeetingUpdateEffect | null;
}

export interface GetRecurringSeriesProps {
  organisation_id: string;
  meeting_id: string;
}

export interface CheckMeetingLocationProps {
  organisation_id: string;
  meeting_id: string;
  user_coordinates: MeetingLocationCoordinates;
}

export interface GetPublicMeetingProps {
  organisation_id: string;
  meeting_id: string;
}

// Hook interfaces

export interface UseMeeting {
  meeting?: Meeting | null;
  isLoading: boolean;
  error: string | null;
  mutateMeeting: () => void;
}

export interface UseMeetings {
  meetings: Meeting[];
  isLoading: boolean;
  error: string;
  mutateMeetings: () => void;
}

export type MeetingsManyResponse = DataServiceResponse<Meeting[] | null> | null;
