import { DefaultValues } from "react-hook-form";

import {
  Meeting,
  RecurringUpdateType,
} from "@/api/services/tendiflow/meetings/types";

import { MeetingFormSchema } from "./schema";

export interface MeetingFormDefaultValuesProps {
  meeting?: Meeting | null;
}

/**
 * Get default values for meeting form
 * @returns {DefaultValues<MeetingFormSchema>} - default values for meeting form
 */
export const meetingFormDefaultValues = ({
  meeting,
}: MeetingFormDefaultValuesProps): DefaultValues<MeetingFormSchema> => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const formatDateTimeLocal = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  return {
    title: meeting?.title || "",
    description: meeting?.description || "",
    start_datetime: meeting?.start_datetime || formatDateTimeLocal(now),
    end_datetime: meeting?.end_datetime || formatDateTimeLocal(oneHourLater),
    timezone:
      meeting?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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
