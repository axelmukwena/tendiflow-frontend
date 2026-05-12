import {
  Building,
  Coffee,
  Group,
  LogOut,
  Settings,
  Shield,
  User,
  UserCheck,
} from "lucide-react";

import { TendiflowMimeType } from "@/api/services/tendiflow/types/file";
import { MenuItem, SelectOptionType } from "@/types/general";
import { ClientPathname } from "@/types/paths";

import { StorageHeader } from "../helpers/enums";
import { ACCEPT_IMAGE_FILE_OPTIONS } from "./options";

export const OVERVIEW_SIDEBAR_MENU_ITEMS: MenuItem[] = [
  {
    title: "Home",
    pathname: ClientPathname.HOME,
    icon: Coffee,
  },
  {
    title: "My Attendance",
    pathname: ClientPathname.ATTENDANCES,
    icon: UserCheck,
  },
  {
    title: "Meetings",
    pathname: ClientPathname.MEETINGS,
    icon: Group,
    requireOrganisation: true,
  },
] satisfies MenuItem[];

export const SETTINGS_SIDEBAR_MENU_ITEMS: MenuItem[] = [
  {
    title: "Organisation",
    pathname: ClientPathname.ORGANISATION_SETTINGS,
    icon: Building,
    requireOrganisation: true,
    items: [
      {
        title: "Overview",
        icon: Settings,
        pathname: ClientPathname.ORGANISATION_SETTINGS,
      },
    ],
  },

  // Personal Settings
  {
    title: "Account",
    pathname: ClientPathname.ACCOUNT_SETTINGS,
    icon: User,
  },
] satisfies MenuItem[];

// Profile dropdown items with Lucide icons
export const PROFILE_DROPDOWN_MENU_ITEMS: MenuItem[] = [
  {
    title: "Account Settings",
    icon: User,
    pathname: ClientPathname.ACCOUNT_SETTINGS,
  },
  {
    title: "Reset Password",
    icon: Shield,
    pathname: ClientPathname.ACCOUNT_SETTINGS_RESET_PASSWORD,
  },
  {
    title: "Log out",
    icon: LogOut,
    pathname: ClientPathname.LOGOUT,
  },
];

export const ACCEPT_IMAGE_FILE_TYPES = ACCEPT_IMAGE_FILE_OPTIONS.map(
  (type) => type.value,
).join(",");

export const ACCEPT_IMAGE_FILE_EXTENSIONS = ACCEPT_IMAGE_FILE_OPTIONS.map(
  (type) => type.name.toUpperCase(),
).join(", ");

export const ACCEPT_DOCUMENT_FILE_OPTIONS: SelectOptionType[] = [
  { name: "pdf", value: TendiflowMimeType.PDF, color: "red" },
  { name: "doc", value: TendiflowMimeType.DOC, color: "blue" },
  { name: "docx", value: TendiflowMimeType.DOCX, color: "green" },
  { name: "xls", value: TendiflowMimeType.XLS, color: "orange" },
  { name: "xlsx", value: TendiflowMimeType.XLSX, color: "purple" },
  { name: "csv", value: TendiflowMimeType.CSV, color: "gray" },
];

export const ACCEPT_DOCUMENT_FILE_TYPES = ACCEPT_DOCUMENT_FILE_OPTIONS.map(
  (type) => type.value,
).join(",");

export const ACCEPT_DOCUMENT_FILE_EXTENSIONS = ACCEPT_DOCUMENT_FILE_OPTIONS.map(
  (type) => type.name.toUpperCase(),
).join(", ");

export const ACCEPT_SPREADSHEET_IMPORT_FILE_OPTIONS: SelectOptionType[] = [
  {
    name: "csv",
    value: TendiflowMimeType.CSV,
    color: "orange",
  },
  {
    name: "xlsx",
    value: TendiflowMimeType.XLSX,
    color: "blue",
  },
  {
    name: "xls",
    value: TendiflowMimeType.XLS,
    color: "green",
  },
];

export const ACCEPT_SPREADSHEET_IMPORT_FILE_TYPES =
  ACCEPT_SPREADSHEET_IMPORT_FILE_OPTIONS.map((type) => type.value).join(",");

export const ACCEPT_SPREADSHEET_IMPORT_FILE_EXTENSIONS =
  ACCEPT_SPREADSHEET_IMPORT_FILE_OPTIONS.map((type) =>
    type.name.toUpperCase(),
  ).join(", ");

export const STORAGE_HEADERS: Record<StorageHeader, string> = {
  [StorageHeader.CONTENT_LENGTH_RANGE]: "0,104857600", // Limit upload to 100MB
};
