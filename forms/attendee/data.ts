import {
  AttendeeBaseCreate,
  AttendeeCheckinInfoCreate,
  AttendeeCreateGuestClient,
  AttendeeFeedbackCreateClient,
  AttendeeUpdateGuestClient,
} from "@/api/services/tendiflow/attendees/types";

import { AttendeeFormSchema } from "./schema";

export interface LoadAttendeeCreateData {
  values: AttendeeFormSchema;
}

export interface LoadAttendeeUpdateData {
  values: AttendeeFormSchema;
}

export interface LoadAttendeeRegisterData {
  values: AttendeeFormSchema;
}

/**
 * Get the data to create an attendee (full guest check-in)
 * @param {LoadAttendeeCreateData} data - The form data to create an attendee
 * @returns {AttendeeCreateGuestClient} - The data formatted for attendee creation API
 */
export const getAttendeeCreateData = ({
  values,
}: LoadAttendeeCreateData): AttendeeCreateGuestClient => {
  const data: AttendeeCreateGuestClient = {
    // Basic attendee information
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    phone_number: values.phone_number,
    organisation_name: values.organisation_name,
    division: values.division,
    occupation: values.occupation,
    custom_field_responses: values.custom_field_responses,
    meeting_id: values.meeting_id,
    user_id: values.user_id || null,
    checkin: values.checkin as AttendeeCheckinInfoCreate,
    feedback: values.feedback || null,
  };

  return data;
};

/**
 * Get the data to update an attendee
 * @param {LoadAttendeeUpdateData} data - The form data to update an attendee
 * @returns {AttendeeUpdateGuestClient} - The data formatted for attendee update API
 */
export const getAttendeeUpdateData = ({
  values,
}: LoadAttendeeUpdateData): AttendeeUpdateGuestClient => {
  const data: AttendeeUpdateGuestClient = {
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    phone_number: values.phone_number,
    organisation_name: values.organisation_name,
    division: values.division,
    occupation: values.occupation,
    custom_field_responses: values.custom_field_responses,
  };

  return data;
};

/**
 * Get the data to register an attendee (basic registration)
 * @param {LoadAttendeeRegisterData} data - The form data to register an attendee
 * @returns {AttendeeBaseCreate} - The data formatted for attendee registration API
 */
export const getAttendeeRegisterData = ({
  values,
}: LoadAttendeeRegisterData): AttendeeBaseCreate => {
  const data: AttendeeBaseCreate = {
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    phone_number: values.phone_number,
    organisation_name: values.organisation_name,
    division: values.division,
    occupation: values.occupation,
    custom_field_responses: values.custom_field_responses,
    meeting_id: values.meeting_id,
    user_id: values.user_id || null,
  };

  return data;
};

export interface LoadGuestAttendeeCreateData {
  values: AttendeeFormSchema;
}

export interface LoadGuestAttendeeUpdateData {
  values: AttendeeFormSchema;
}

export interface LoadGuestAttendeeFeedbackData {
  values: Pick<AttendeeFormSchema, "feedback">;
}

/**
 * Get the data to create a guest attendee (full guest check-in)
 * @param {LoadGuestAttendeeCreateData} data - The form data to create a guest attendee
 * @returns {AttendeeCreateGuestClient} - The data formatted for guest attendee creation API
 */
export const getGuestAttendeeCreateData = ({
  values,
}: LoadGuestAttendeeCreateData): AttendeeCreateGuestClient => {
  const data: AttendeeCreateGuestClient = {
    // Basic attendee information
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
 * Get the data to update a guest attendee
 * @param {LoadGuestAttendeeUpdateData} data - The form data to update a guest attendee
 * @returns {AttendeeUpdateGuestClient} - The data formatted for guest attendee update API
 */
export const getGuestAttendeeUpdateData = ({
  values,
}: LoadGuestAttendeeUpdateData): AttendeeUpdateGuestClient => {
  const data: AttendeeUpdateGuestClient = {
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

/**
 * Get the data for guest attendee feedback submission
 * @param {LoadGuestAttendeeFeedbackData} data - The form data for feedback
 * @returns {AttendeeFeedbackCreateClient} - The data formatted for feedback submission API
 */
export const getGuestAttendeeFeedbackData = ({
  values,
}: LoadGuestAttendeeFeedbackData): AttendeeFeedbackCreateClient => {
  const data: AttendeeFeedbackCreateClient = {
    feedback: values.feedback || null,
  };

  return data;
};

/**
 * Helper function to create checkin info from metadata
 */
export const createCheckinInfo = (
  fingerprint: string,
  sessionId: string,
  locationInfo: any,
  deviceInfo: any,
): AttendeeCheckinInfoCreate => {
  return {
    device_fingerprint: fingerprint,
    session_id: sessionId,
    checkin_datetime: new Date().toISOString(),
    checkin_location: locationInfo,
    checkin_device: deviceInfo,
  };
};
