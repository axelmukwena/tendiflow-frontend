import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

import { AttendanceStatus } from "@/api/services/tendiflow/attendees/types";
import { CustomFieldType } from "@/api/services/tendiflow/meetings/types";

import { PHONE_NUMBER_OPTIONAL_SCHEMA } from "../phonenumber";

export const PHONE_NUMBER_E164_REQUIRED = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (value) => isValidPhoneNumber(value),
    "Enter a valid phone number with country code",
  );

export const OTP_CHANNEL = z.enum(["email", "sms"]).optional();

// Attendee Checkin Location Schema
const ATTENDEE_CHECKIN_LOCATION_SCHEMA = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  address: z.string().max(500, "Address is too long"),
  ip_address: z.string().min(1, "IP address is required"),
  accuracy: z.number().min(0, "Accuracy must be non-negative"),
  timestamp: z.string().min(1, "Timestamp is required"),
});

// Attendee Checkin Device Schema
const ATTENDEE_CHECKIN_DEVICE_SCHEMA = z
  .object({
    browser: z.string().nullable(),
    os: z.string().nullable(),
    device: z.string().nullable(),
    user_agent: z.string().min(1, "User agent is required"),
    screen_resolution: z.string().nullable(),
    timezone: z.string().nullable(),
  })
  .nullable();

// Attendee Checkin Info Schema
const ATTENDEE_CHECKIN_INFO_SCHEMA = z
  .object({
    session_id: z.string().min(1, "Session ID is required"),
    checkin_datetime: z.string().min(1, "Check-in datetime is required"),
    checkin_location: ATTENDEE_CHECKIN_LOCATION_SCHEMA,
    checkin_device: ATTENDEE_CHECKIN_DEVICE_SCHEMA,
  })
  .nullable();

// Attendee Feedback Info Schema
const ATTENDEE_FEEDBACK_INFO_SCHEMA = z
  .object({
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5")
      .nullable(),
    comment: z.string().max(1000, "Comment is too long").nullable(),
    feedback_datetime: z.string().nullable(),
  })
  .nullable();

// Custom Field Response Schema
const ATTENDEE_CUSTOM_FIELD_RESPONSE_SCHEMA = z.object({
  customfield_id: z.string().min(1, "Custom field ID is required"),
  field_name: z
    .string()
    .min(1, "Field name is required")
    .max(100, "Field name is too long"),
  field_type: z.enum(CustomFieldType),
  value: z.any(),
});

// Base Attendee Schema
const ATTENDEE_BASE_SCHEMA = z.object({
  email: z
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(255, "Email is too long"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  phone_number: PHONE_NUMBER_OPTIONAL_SCHEMA,
  organisation_name: z
    .string()
    .max(255, "Organisation name is too long")
    .nullable(),
  division: z.string().max(100, "Division is too long").nullable(),
  occupation: z.string().max(100, "Occupation is too long").nullable(),
  custom_field_responses: z
    .array(ATTENDEE_CUSTOM_FIELD_RESPONSE_SCHEMA)
    .nullable(),
});

// Unified Attendee Form Schema - handles both create and update
export const ATTENDEE_FORM_SCHEMA = ATTENDEE_BASE_SCHEMA.extend({
  meeting_id: z.string().min(1, "Meeting ID is required"),
  user_id: z.string().nullable().optional(),
  attendance_status: z.enum(AttendanceStatus).optional(),
  checkin: ATTENDEE_CHECKIN_INFO_SCHEMA.optional(),
  feedback: ATTENDEE_FEEDBACK_INFO_SCHEMA.optional(),
}).refine(
  (data) => {
    // If this is for registration/creation, meeting_id should be provided
    if (!data.user_id && !data.meeting_id) {
      return false;
    }
    return true;
  },
  {
    message: "Either user ID or meeting ID must be provided",
    path: ["meeting_id"],
  },
);

export type AttendeeFormSchema = z.infer<typeof ATTENDEE_FORM_SCHEMA>;

// Guest check-in form schema — extends the admin schema with required phone
// and an OTP channel selector. Only used by the public check-in flow.
export const GUEST_CHECKIN_FORM_SCHEMA = ATTENDEE_FORM_SCHEMA.extend({
  phone_number: PHONE_NUMBER_E164_REQUIRED,
  channel: OTP_CHANNEL,
});

export type GuestCheckinFormSchema = z.infer<typeof GUEST_CHECKIN_FORM_SCHEMA>;
