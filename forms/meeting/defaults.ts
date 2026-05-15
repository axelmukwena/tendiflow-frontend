import { DateTime } from "luxon";
import { DefaultValues } from "react-hook-form";

import {
  Meeting,
  RecurringUpdateType,
} from "@/api/services/tendiflow/meetings/types";

import { MeetingFormSchema } from "./schema";

export interface MeetingFormDefaultValuesProps {
  meeting?: Meeting | null;
}

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";

// `<input type="datetime-local">` wants wall-clock components — no zone
// suffix. Two cases:
//   - New meeting: format `now` in the browser's local zone so the user
//     sees their current wall-clock time as the suggested default.
//   - Existing meeting: backend stores `start_datetime` as a UTC instant,
//     so format that instant *in the meeting's timezone* — otherwise an
//     08:00 Windhoek meeting would show as 06:00 in the input.
const formatDateTimeLocalNow = (date: Date): string => {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatStoredUtcInZone = (utcIso: string, zone: string): string => {
  const dt = DateTime.fromISO(utcIso, { zone: "utc" }).setZone(zone);
  return dt.isValid ? dt.toFormat(DATETIME_LOCAL_FORMAT) : utcIso;
};

/**
 * Get default values for meeting form
 * @returns {DefaultValues<MeetingFormSchema>} - default values for meeting form
 */
export const meetingFormDefaultValues = ({
  meeting,
}: MeetingFormDefaultValuesProps): DefaultValues<MeetingFormSchema> => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zone = meeting?.timezone || browserZone;

  return {
    title: meeting?.title || "",
    description: meeting?.description || "",
    start_datetime: meeting?.start_datetime
      ? formatStoredUtcInZone(meeting.start_datetime, zone)
      : formatDateTimeLocalNow(now),
    end_datetime: meeting?.end_datetime
      ? formatStoredUtcInZone(meeting.end_datetime, zone)
      : formatDateTimeLocalNow(oneHourLater),
    timezone: zone,
    address: meeting?.address || "",
    coordinates: meeting?.coordinates || null,
    expected_attendees: meeting?.expected_attendees || null,
    tags: meeting?.tags || [],
    notes: meeting?.notes || "",
    settings: meeting?.settings || {
      require_location_verification: true,
      checkin_radius_meters: 100,
      checkin_window_seconds: 1800, // 30 minutes
      late_checkin_seconds: 900, // 15 minutes
      feedback_window_seconds: 3600, // 1 hour
      send_reminders: true,
      reminder_intervals: [3600, 1800], // 1 hour and 30 minutes before
    },
    custom_fields: meeting?.custom_fields || [],
    recurring_pattern: meeting?.recurring_pattern || null,
    qrcode_options: {
      dark_color: "#000000",
      light_color: "#FFFFFF",
    },
    update_effect: meeting
      ? {
          update_type: RecurringUpdateType.THIS_ONLY as const,
          update_message: "",
          notify_attendees: false,
        }
      : undefined,
  };
};
