import { z } from "zod";

import {
  CustomFieldType,
  RecurringFrequency,
  RecurringUpdateType,
} from "@/api/services/tendiflow/meetings/types";

// Meeting Location Coordinates Schema
export const MEETING_COORDINATES_SCHEMA = z
  .object({
    latitude: z.preprocess(
      // Preprocess the value: if it's an empty string or null, treat it as undefined.
      (val) => (val === "" || val === null ? undefined : val),
      // Now, validate the preprocessed value.
      z.coerce // Coerce will attempt to convert the type (e.g., "55" to 55)
        .number({ error: "Latitude must be a number" })
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
    ),
    longitude: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.coerce
        .number({ error: "Longitude must be a number" })
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
    ),
  })
  // Refine the object: if one coordinate is provided, the other must be too.
  .refine(
    (data) => (data.latitude !== undefined) === (data.longitude !== undefined),
    {
      message: "Both latitude and longitude must be provided together",
      path: ["latitude"], // Show error on the latitude field
    },
  )
  .nullable();

// Meeting Settings Schema
export const MEETING_SETTINGS_SCHEMA = z.object({
  require_location_verification: z.boolean(),
  checkin_radius_meters: z
    .number()
    .min(1, "Check-in radius must be at least 1 meter")
    .max(10000, "Check-in radius cannot exceed 10km")
    .nullable(),
  checkin_window_seconds: z
    .number()
    .min(60, "Check-in window must be at least 1 minute")
    .max(86400, "Check-in window cannot exceed 24 hours")
    .nullable(),
  late_checkin_seconds: z
    .number()
    .min(60, "Late check-in window must be at least 1 minute")
    .max(86400, "Late check-in window cannot exceed 24 hours")
    .nullable(),
  feedback_window_seconds: z
    .number()
    .min(60, "Feedback window must be at least 1 minute")
    .max(604800, "Feedback window cannot exceed 7 days")
    .nullable(),
  send_reminders: z.boolean().nullable(),
  reminder_intervals: z
    .array(
      z
        .number()
        .min(60, "Reminder interval must be at least 1 minute")
        .max(604800, "Reminder interval cannot exceed 7 days"),
    )
    .nullable(),
});

// Custom Field Validation Schema
export const MEETING_CUSTOM_FIELD_VALIDATION_SCHEMA = z
  .object({
    min_length: z.number().min(0).nullable(),
    max_length: z.number().min(1).nullable(),
    min_value: z.number().nullable(),
    max_value: z.number().nullable(),
    pattern: z.string().nullable(),
  })
  .nullable();

// Custom Field Schema
export const MEETING_CUSTOM_FIELD_SCHEMA = z.object({
  id: z.string().min(1, "Custom field ID is required"),
  field_name: z
    .string()
    .min(1, "Field name is required")
    .max(100, "Field name is too long"),
  field_type: z.enum(CustomFieldType),
  label: z.string().min(1, "Label is required").max(200, "Label is too long"),
  placeholder: z.string().max(200, "Placeholder is too long").nullable(),
  is_required: z.boolean(),
  options: z.array(z.string()).nullable(),
  validation: MEETING_CUSTOM_FIELD_VALIDATION_SCHEMA,
  position: z.number().min(0, "Position must be non-negative"),
});

// Recurring Pattern Schema
export const MEETING_RECURRING_PATTERN_SCHEMA = z
  .object({
    frequency: z.enum(RecurringFrequency),
    interval: z
      .number()
      .min(1, "Interval must be at least 1")
      .max(365, "Interval cannot exceed 365"),
    days_of_week: z
      .array(
        z
          .number()
          .min(0, "Day of week must be between 0 and 6")
          .max(6, "Day of week must be between 0 and 6"),
      )
      .nullable(),
    day_of_month: z
      .number()
      .min(1, "Day of month must be between 1 and 31")
      .max(31, "Day of month must be between 1 and 31")
      .nullable(),
    end_date: z.string().nullable(),
    max_occurrences: z
      .number()
      .min(1, "Max occurrences must be at least 1")
      .max(999, "Max occurrences cannot exceed 999"),
  })
  .nullable();

// QR Code Options Schema
export const QRCODE_OPTIONS_SCHEMA = z.object({
  dark_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  light_color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
});

// Update Effect Schema
export const MEETING_UPDATE_EFFECT_SCHEMA = z
  .object({
    update_type: z.enum(RecurringUpdateType),
    update_message: z
      .string()
      .max(500, "Update message is too long")
      .nullable(),
    notify_attendees: z.boolean(),
  })
  .nullable();

// Unified Meeting Form Schema - handles both create and update
export const MEETING_FORM_SCHEMA = z
  .object({
    title: z
      .string()
      .min(1, "Meeting title is required")
      .max(200, "Title is too long"),
    description: z.string().max(1000, "Description is too long").nullable(),
    start_datetime: z.string().min(1, "Start date and time is required"),
    end_datetime: z.string().min(1, "End date and time is required"),
    timezone: z.string().min(1, "Timezone is required"),
    address: z.string().max(500, "Address is too long").nullable(),
    coordinates: MEETING_COORDINATES_SCHEMA,
    settings: MEETING_SETTINGS_SCHEMA,
    custom_fields: z.array(MEETING_CUSTOM_FIELD_SCHEMA).nullable(),
    recurring_pattern: MEETING_RECURRING_PATTERN_SCHEMA,
    expected_attendees: z
      .number()
      .min(1, "Expected attendees must be at least 1")
      .max(100000, "Expected attendees cannot exceed 100,000")
      .nullable(),
    tags: z
      .array(
        z.string().min(1, "Tag cannot be empty").max(50, "Tag is too long"),
      )
      .max(20, "Cannot have more than 20 tags")
      .nullable(),
    notes: z.string().max(2000, "Notes are too long").nullable(),
    // Optional fields for create/update differences
    qrcode_options: QRCODE_OPTIONS_SCHEMA.optional(),
    update_effect: MEETING_UPDATE_EFFECT_SCHEMA.optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_datetime);
      const end = new Date(data.end_datetime);
      return end > start;
    },
    {
      message: "End date and time must be after start date and time",
      path: ["end_datetime"],
    },
  );

export type MeetingFormSchema = z.infer<typeof MEETING_FORM_SCHEMA>;
