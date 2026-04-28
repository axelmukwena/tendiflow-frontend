import * as XLSX from "xlsx";

import {
  AttendanceStatus,
  Attendee,
} from "@/api/services/weaver/attendees/types";
import { Meeting } from "@/api/services/weaver/meetings/types";

import { getFormattedDateAndTime } from "./date";

export interface ExportMeetingData {
  meeting: Meeting;
  attendees: Attendee[];
}

interface MeetingInfoRow {
  Property: string;
  Value: string | number | null;
}

interface AttendeeRow {
  "First Name": string;
  "Last Name": string;
  Email: string;
  Phone: string | null;
  Organisation: string | null;
  Occupation: string | null;
  Status: AttendanceStatus;
  "Check-in Time": string | null;
  "Check-in Location": string | null;
  Device: string | null;
  "IP Address": string | null;
  "Feedback Rating": number | null;
  "Feedback Comment": string | null;
  "Registration Date": string;
}

interface SummaryRow {
  Metric: string;
  Count: number;
}

/**
 * Convert meeting data to Excel format
 */
function prepareMeetingInfoData(meeting: Meeting): MeetingInfoRow[] {
  return [
    { Property: "Meeting Title", Value: meeting.title },
    { Property: "Description", Value: meeting.description },
    {
      Property: "Start Date & Time",
      Value: getFormattedDateAndTime({ utc: meeting.start_datetime }),
    },
    {
      Property: "End Date & Time",
      Value: getFormattedDateAndTime({ utc: meeting.end_datetime }),
    },
    { Property: "Timezone", Value: meeting.timezone },
    { Property: "Address", Value: meeting.address },
    { Property: "Expected Attendees", Value: meeting.expected_attendees },
    {
      Property: "Location Verification Required",
      Value: meeting.settings.require_location_verification ? "Yes" : "No",
    },
    {
      Property: "Check-in Radius (meters)",
      Value: meeting.settings.checkin_radius_meters,
    },
    {
      Property: "Check-in Window (seconds)",
      Value: meeting.settings.checkin_window_seconds,
    },
    {
      Property: "Late Check-in Allowed (seconds)",
      Value: meeting.settings.late_checkin_seconds,
    },
    { Property: "Tags", Value: meeting.tags?.join(", ") || null },
    { Property: "Notes", Value: meeting.notes },
    {
      Property: "Created Date",
      Value: getFormattedDateAndTime({ utc: meeting.created_at }),
    },
    { Property: "Meeting ID", Value: meeting.id },
    { Property: "Organisation ID", Value: meeting.organisation_id },
  ];
}

/**
 * Convert attendees data to Excel format
 */
function prepareAttendeesData(attendees: Attendee[]): AttendeeRow[] {
  return attendees.map((attendee) => ({
    "First Name": attendee.first_name,
    "Last Name": attendee.last_name,
    Email: attendee.email,
    Phone: attendee.phone_number,
    Organisation: attendee.organisation_name,
    Division: attendee.division,
    Occupation: attendee.occupation,
    Status: attendee.attendance_status,
    "Check-in Time": attendee.checkin?.checkin_datetime
      ? getFormattedDateAndTime({ utc: attendee.checkin.checkin_datetime })
      : null,
    "Check-in Location": attendee.checkin?.checkin_location?.address || null,
    Device: attendee.checkin?.checkin_device
      ? `${attendee.checkin.checkin_device.browser || "Unknown"} on ${attendee.checkin.checkin_device.os || "Unknown"}`
      : null,
    "IP Address": attendee.checkin?.checkin_location?.ip_address || null,
    "Feedback Rating": attendee.feedback?.rating || null,
    "Feedback Comment": attendee.feedback?.comment || null,
    "Registration Date": getFormattedDateAndTime({ utc: attendee.created_at }),
  }));
}

/**
 * Generate summary statistics
 */
function prepareSummaryData(attendees: Attendee[]): SummaryRow[] {
  const statusCounts = attendees.reduce(
    (acc, attendee) => {
      acc[attendee.attendance_status] =
        (acc[attendee.attendance_status] || 0) + 1;
      return acc;
    },
    {} as Record<AttendanceStatus, number>,
  );

  const checkedInCount = attendees.filter(
    (a) =>
      a.attendance_status === AttendanceStatus.CHECKED_IN ||
      a.attendance_status === AttendanceStatus.CHECKED_IN_LATE,
  ).length;

  const withFeedbackCount = attendees.filter(
    (a) => a.feedback?.rating !== null,
  ).length;

  return [
    { Metric: "Total Registered", Count: attendees.length },
    { Metric: "Checked In", Count: checkedInCount },
    {
      Metric: "Registered Only",
      Count: statusCounts[AttendanceStatus.REGISTERED] || 0,
    },
    {
      Metric: "Checked In Late",
      Count: statusCounts[AttendanceStatus.CHECKED_IN_LATE] || 0,
    },
    {
      Metric: "Cancelled",
      Count: statusCounts[AttendanceStatus.CANCELLED] || 0,
    },
    { Metric: "With Feedback", Count: withFeedbackCount },
    {
      Metric: "Unique Organisations",
      Count: new Set(attendees.map((a) => a.organisation_name).filter(Boolean))
        .size,
    },
  ];
}

/**
 * Export meeting and attendees data to Excel file
 */
export async function exportMeetingToExcel(
  data: ExportMeetingData,
  filename: string,
): Promise<void> {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data for each sheet
    const meetingInfoData = prepareMeetingInfoData(data.meeting);
    const attendeesData = prepareAttendeesData(data.attendees);
    const summaryData = prepareSummaryData(data.attendees);

    // Create worksheets
    const meetingInfoSheet = XLSX.utils.json_to_sheet(meetingInfoData);
    const attendeesSheet = XLSX.utils.json_to_sheet(attendeesData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    // Set column widths for better readability
    meetingInfoSheet["!cols"] = [
      { wch: 25 }, // Property column
      { wch: 40 }, // Value column
    ];

    attendeesSheet["!cols"] = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Organisation
      { wch: 20 }, // Occupation
      { wch: 15 }, // Status
      { wch: 20 }, // Check-in Time
      { wch: 30 }, // Check-in Location
      { wch: 20 }, // Device
      { wch: 15 }, // IP Address
      { wch: 10 }, // Feedback Rating
      { wch: 30 }, // Feedback Comment
      { wch: 20 }, // Registration Date
    ];

    summarySheet["!cols"] = [
      { wch: 20 }, // Metric column
      { wch: 10 }, // Count column
    ];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, meetingInfoSheet, "Meeting Info");
    XLSX.utils.book_append_sheet(workbook, attendeesSheet, "Attendees");

    // Write and download the file
    XLSX.writeFile(workbook, filename);
  } catch {
    throw new Error(
      "Failed to export meeting data to Excel. Please try again.",
    );
  }
}

/**
 * Check if the browser supports file downloads
 */
export function isExportSupported(): boolean {
  try {
    return typeof window !== "undefined" && !!window.document;
  } catch {
    return false;
  }
}
