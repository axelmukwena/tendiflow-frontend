import { AttendanceStatus } from "@/api/services/tendiflow/attendees/types";
import {
  MembershipAdminStatus,
  MembershipInviteeStatus,
  MembershipStatus,
} from "@/api/services/tendiflow/memberships/types";
import {
  OrganisationSettingsDateFormat,
  OrganisationSettingsTimeFormat,
} from "@/api/services/tendiflow/organisations/types";
import { TendiflowMimeType } from "@/api/services/tendiflow/types/file";
import { DatabaseStatus, Language } from "@/api/services/tendiflow/types/general";
import { UserStatus } from "@/api/services/tendiflow/users/types";
import { BoolString, SelectOptionType } from "@/types/general";

export const PAGE_LIMIT_OPTIONS: SelectOptionType[] = [
  { name: "10", value: "10" },
  { name: "25", value: "25" },
  { name: "50", value: "50" },
  { name: "75", value: "75" },
  { name: "100", value: "100" },
];

export const BOOLEAN_OPTIONS: SelectOptionType[] = [
  {
    name: "Yes",
    value: BoolString.TRUE,
    color: "green",
    badgeVariant: "default",
  },
  {
    name: "No",
    value: BoolString.FALSE,
    color: "red",
    badgeVariant: "secondary",
  },
];

export const LANGUAGE_OPTIONS: SelectOptionType[] = [
  { name: "English", value: Language.ENGLISH },
];

export const MEMBERSHIP_STATUS_OPTIONS: SelectOptionType[] = [
  { name: "Active", value: MembershipStatus.ACTIVE, color: "green" },
  { name: "Deactivated", value: MembershipStatus.DEACTIVATED, color: "red" },
  { name: "Pending", value: MembershipStatus.PENDING, color: "orange" },
  { name: "Declined", value: MembershipStatus.DECLINED, color: "gray" },
];

export const MEMBERSHIP_UPDATE_STATUS_OPTIONS: SelectOptionType[] = [
  { name: "Active", value: MembershipAdminStatus.ACTIVE, color: "green" },
  {
    name: "Deactivated",
    value: MembershipAdminStatus.DEACTIVATED,
    color: "red",
  },
];

export const MEMBERSHIP_INVITEE_STATUS_OPTIONS: SelectOptionType[] = [
  { name: "Accept", value: MembershipInviteeStatus.ACCEPTED, color: "green" },
  {
    name: "Decline",
    value: MembershipInviteeStatus.DECLINED,
    color: "red",
  },
];

export const USER_STATUS_OPTIONS: SelectOptionType[] = [
  { name: "Active", value: UserStatus.ACTIVE, color: "green" },
  { name: "Pending", value: UserStatus.PENDING, color: "gray" },
  { name: "Deactivated", value: UserStatus.DEACTIVATED, color: "red" },
];

export const DATABASE_STATUS_OPTIONS: SelectOptionType[] = [
  {
    name: "Active",
    value: DatabaseStatus.ACTIVE,
    color: "green",
    badgeVariant: "default",
  },
  {
    name: "Archived",
    value: DatabaseStatus.ARCHIVED,
    color: "red",
    badgeVariant: "secondary",
  },
];

export const ACCEPT_IMAGE_FILE_OPTIONS: SelectOptionType[] = [
  { name: "jpg", value: TendiflowMimeType.JPG, color: "green" },
  { name: "jpeg", value: TendiflowMimeType.JPG, color: "blue" },
  { name: "png", value: TendiflowMimeType.PNG, color: "orange" },
  { name: "gif", value: TendiflowMimeType.GIF, color: "red" },
  { name: "svg", value: TendiflowMimeType.SVG, color: "purple" },
];

export const ORGANISATION_DATE_FORMAT_OPTIONS: SelectOptionType[] = [
  {
    name: "DD-MM-YYYY",
    value: OrganisationSettingsDateFormat.DD_MM_YYYY,
    caption: "31-12-2024",
    description: "Day-Month-Year format (European style)",
  },
  {
    name: "MM-DD-YYYY",
    value: OrganisationSettingsDateFormat.MM_DD_YYYY,
    caption: "12-31-2024",
    description: "Month-Day-Year format (American style)",
  },
  {
    name: "YYYY-MM-DD",
    value: OrganisationSettingsDateFormat.YYYY_MM_DD,
    caption: "2024-12-31",
    description: "Year-Month-Day format (ISO 8601)",
  },
];

export const ORGANISATION_TIME_FORMAT_OPTIONS: SelectOptionType[] = [
  {
    name: "12 Hour",
    value: OrganisationSettingsTimeFormat.TWELVE_HOUR,
    caption: "2:30 PM",
    description: "12-hour format with AM/PM",
  },
  {
    name: "24 Hour",
    value: OrganisationSettingsTimeFormat.TWENTY_FOUR_HOUR,
    caption: "14:30",
    description: "24-hour format (military time)",
  },
];

export const ATTENDANCE_STATUS_OPTIONS: SelectOptionType[] = [
  {
    name: "Registered",
    value: AttendanceStatus.REGISTERED,
    color: "blue",
    badgeVariant: "default",
  },
  {
    name: "Checked In",
    value: AttendanceStatus.CHECKED_IN,
    color: "green",
    badgeVariant: "default",
  },
  {
    name: "Checked In Late",
    value: AttendanceStatus.CHECKED_IN_LATE,
    color: "yellow",
    badgeVariant: "default",
  },
  {
    name: "Cancelled",
    value: AttendanceStatus.CANCELLED,
    color: "red",
    badgeVariant: "secondary",
  },
];

export const ATTENDEE_FEEDBACK_RATING_OPTIONS: SelectOptionType[] = [
  { name: "1 Star", value: "1", color: "red" },
  { name: "2 Stars", value: "2", color: "orange" },
  { name: "3 Stars", value: "3", color: "yellow" },
  { name: "4 Stars", value: "4", color: "green" },
  { name: "5 Stars", value: "5", color: "blue" },
];
