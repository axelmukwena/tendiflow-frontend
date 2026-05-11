import {
  Attendee,
  AttendeeCreateGuestClient,
  AttendeeFeedbackCreateClient,
  CancelGuestAttendanceClientProps,
  GetGuestAttendeeClientProps,
  UpdateGuestAttendeeClientProps,
} from "@/api/services/weaver/attendees/types";
import { DataServiceResponse } from "@/api/services/weaver/types/general";
import { HeaderKey } from "@/utilities/helpers/enums";

import { getCsrfToken } from "../oauth/fetchers";

/**
 * Client-side service for attendee operations that go through Next.js API routes
 * These routes handle OAuth credentials server-side
 */
export class AttendeeClientService {
  private baseUrl = "/api";

  /**
   * Guest check-in (register + check-in in one step)
   */
  async guestCheckin(
    organisationId: string,
    data: AttendeeCreateGuestClient,
  ): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisationId}/attendees/guest/checkin`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        },
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to check in guest: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get guest attendee by device fingerprint
   */
  async getGuestByFingerprint({
    organisation_id,
    meeting_id,
    device_fingerprint,
  }: GetGuestAttendeeClientProps): Promise<
    DataServiceResponse<Attendee | null>
  > {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const qs = new URLSearchParams({ meeting_id }).toString();
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisation_id}/attendees/guest/${device_fingerprint}?${qs}`,
        {
          method: "GET",
          headers,
        },
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to get guest attendee: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update guest attendee by device fingerprint
   */
  async updateGuestByFingerprint({
    organisation_id,
    meeting_id,
    device_fingerprint,
    data,
  }: UpdateGuestAttendeeClientProps): Promise<
    DataServiceResponse<Attendee | null>
  > {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const qs = new URLSearchParams({ meeting_id }).toString();
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisation_id}/attendees/guest/${device_fingerprint}?${qs}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
        },
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to update guest attendee: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Cancel guest attendance by device fingerprint
   */
  async cancelGuestByFingerprint({
    organisation_id,
    meeting_id,
    device_fingerprint,
  }: CancelGuestAttendanceClientProps): Promise<
    DataServiceResponse<Attendee | null>
  > {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const qs = new URLSearchParams({ meeting_id }).toString();
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisation_id}/attendees/guest/${device_fingerprint}?${qs}`,
        {
          method: "DELETE",
          headers,
        },
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to cancel guest attendance: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Submit guest feedback by device fingerprint
   */
  async submitGuestFeedback(
    organisationId: string,
    meetingId: string,
    deviceFingerprint: string,
    data: AttendeeFeedbackCreateClient,
  ): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const qs = new URLSearchParams({ meeting_id: meetingId }).toString();
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisationId}/attendees/guest/${deviceFingerprint}/feedback?${qs}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        },
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to submit guest feedback: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
