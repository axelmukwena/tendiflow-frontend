import { DateTime } from "luxon";

import {
  MeetingCreate,
  MeetingLocationCoordinates,
  MeetingUpdate,
  RecurringUpdateType,
} from "@/api/services/tendiflow/meetings/types";

import { MeetingFormSchema } from "./schema";

export interface LoadMeetingCreateData {
  values: MeetingFormSchema;
}

export interface LoadMeetingUpdateData {
  values: MeetingFormSchema;
}

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";

// `<input type="datetime-local">` produces a naive string ("2026-05-15T09:15")
// representing wall-clock time in the form's selected timezone. Send a real
// UTC ISO to the backend so storage and comparisons are unambiguous.
const toUtcIso = (localValue: string, zone: string): string => {
  const dt = DateTime.fromFormat(localValue, DATETIME_LOCAL_FORMAT, { zone });
  if (!dt.isValid) {
    throw new Error(
      `Invalid datetime: "${localValue}" in zone "${zone}" (${dt.invalidReason})`,
    );
  }
  return dt.toUTC().toISO() as string;
};

/**
 * Get the data to create a meeting
 * @param {LoadMeetingCreateData} data - The form data to create a meeting
 * @returns {MeetingCreate} - The data formatted for meeting creation API
 */
export const getMeetingCreateData = ({
  values,
}: LoadMeetingCreateData): MeetingCreate => {
  const coordinates: MeetingLocationCoordinates | null =
    values.coordinates &&
    values.coordinates.latitude &&
    values.coordinates.longitude
      ? {
          latitude: values.coordinates.latitude,
          longitude: values.coordinates.longitude,
        }
      : null;
  const data: MeetingCreate = {
    title: values.title,
    description: values.description,
    start_datetime: toUtcIso(values.start_datetime, values.timezone),
    end_datetime: toUtcIso(values.end_datetime, values.timezone),
    timezone: values.timezone,
    address: values.address,
    coordinates: coordinates,
    settings: {
      require_location_verification:
        values.settings.require_location_verification,
      checkin_radius_meters: values.settings.checkin_radius_meters,
      checkin_window_seconds: values.settings.checkin_window_seconds,
      late_checkin_seconds: values.settings.late_checkin_seconds,
      feedback_window_seconds: values.settings.feedback_window_seconds,
      send_reminders: values.settings.send_reminders,
      reminder_intervals: values.settings.reminder_intervals,
    },
    custom_fields: values.custom_fields?.length ? values.custom_fields : [],
    recurring_pattern: values.recurring_pattern,
    expected_attendees: values.expected_attendees,
    tags: values.tags,
    notes: values.notes,
    qrcode_options: values.qrcode_options || {
      dark_color: "#000000",
      light_color: "#FFFFFF",
    },
  };

  return data;
};

/**
 * Get the data to update a meeting
 * @param {LoadMeetingUpdateData} data - The form data to update a meeting
 * @returns {MeetingUpdate} - The data formatted for meeting update API
 */
export const getMeetingUpdateData = ({
  values,
}: LoadMeetingUpdateData): MeetingUpdate => {
  const coordinates: MeetingLocationCoordinates | null =
    values.coordinates &&
    values.coordinates.latitude &&
    values.coordinates.longitude
      ? {
          latitude: values.coordinates.latitude,
          longitude: values.coordinates.longitude,
        }
      : null;
  const data: MeetingUpdate = {
    title: values.title,
    description: values.description,
    start_datetime: toUtcIso(values.start_datetime, values.timezone),
    end_datetime: toUtcIso(values.end_datetime, values.timezone),
    timezone: values.timezone,
    address: values.address,
    coordinates: coordinates,
    settings: {
      require_location_verification:
        values.settings.require_location_verification,
      checkin_radius_meters: values.settings.checkin_radius_meters,
      checkin_window_seconds: values.settings.checkin_window_seconds,
      late_checkin_seconds: values.settings.late_checkin_seconds,
      feedback_window_seconds: values.settings.feedback_window_seconds,
      send_reminders: values.settings.send_reminders,
      reminder_intervals: values.settings.reminder_intervals,
    },
    custom_fields: values.custom_fields?.length ? values.custom_fields : [],
    recurring_pattern: values.recurring_pattern,
    expected_attendees: values.expected_attendees,
    tags: values.tags,
    notes: values.notes,
    qrcode_options: values.qrcode_options || {
      dark_color: "#000000",
      light_color: "#FFFFFF",
    },
    update_effect: values.update_effect || {
      update_type: RecurringUpdateType.THIS_ONLY,
      update_message: null,
      notify_attendees: false,
    },
  };

  return data;
};
