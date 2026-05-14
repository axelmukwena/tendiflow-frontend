import {
  AttendeeBaseCreate,
  AttendeeCheckinInfoCreate,
  AttendeeCreateGuestClient,
  AttendeeUpdate,
} from "@/api/services/tendiflow/attendees/types";

import { AttendeeFormSchema } from "./schema";

export interface LoadAttendeeFormData {
  values: AttendeeFormSchema;
}

/**
 * Get the data to create a guest attendee (full guest check-in).
 */
export const getGuestAttendeeCreateData = ({
  values,
}: LoadAttendeeFormData): AttendeeCreateGuestClient => {
  const data: AttendeeCreateGuestClient = {
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    phone_number: values.phone_number || null,
    organisation_name: values.organisation_name || null,
    division: values.division || null,
    occupation: values.occupation || null,
    custom_field_responses: values.custom_field_responses || null,
    meeting_id: values.meeting_id,
    user_id: values.user_id || null,
    checkin: values.checkin as AttendeeCheckinInfoCreate,
    feedback: values.feedback || null,
  };

  return data;
};

/**
 * Get the data to register an attendee from the organiser dashboard.
 */
export const getAttendeeCreateData = ({
  values,
}: LoadAttendeeFormData): AttendeeBaseCreate => {
  const data: AttendeeBaseCreate = {
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    phone_number: values.phone_number || null,
    organisation_name: values.organisation_name || null,
    division: values.division || null,
    occupation: values.occupation || null,
    custom_field_responses: values.custom_field_responses || null,
    meeting_id: values.meeting_id,
    user_id: values.user_id || null,
  };

  return data;
};

/**
 * Get the data to update an attendee from the organiser dashboard.
 */
export const getAttendeeUpdateData = ({
  values,
}: LoadAttendeeFormData): AttendeeUpdate => {
  const data: AttendeeUpdate = {
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    phone_number: values.phone_number || null,
    organisation_name: values.organisation_name || null,
    division: values.division || null,
    occupation: values.occupation || null,
    custom_field_responses: values.custom_field_responses || null,
  };

  return data;
};
