import {
  Attendee,
  AttendeeCreateGuestClient,
  AttendeeFeedbackCreateClient,
  AttendeeGuestCheckinOtpRequestResponse,
  AttendeeGuestCheckinOtpVerifyBody,
} from "@/api/services/tendiflow/attendees/types";
import { DataServiceResponse } from "@/api/services/tendiflow/types/general";
import { HeaderKey } from "@/utilities/helpers/enums";

import { getCsrfToken } from "../oauth/fetchers";

/**
 * Client-side service for attendee operations that go through Next.js API routes
 * These routes handle OAuth credentials server-side
 */
export class AttendeeClientService {
  private baseUrl = "/api";

  /**
   * Request a guest check-in OTP via the Next.js proxy.
   */
  async requestGuestCheckinOtp(
    organisationId: string,
    data: AttendeeCreateGuestClient,
  ): Promise<DataServiceResponse<AttendeeGuestCheckinOtpRequestResponse | null>> {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisationId}/attendees/guest/checkin/request-otp`,
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
        message: `Failed to request check-in OTP: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Verify a guest check-in OTP via the Next.js proxy. The cookie set by
   * the backend on success is forwarded by the proxy route.
   */
  async verifyGuestCheckinOtp(
    organisationId: string,
    data: AttendeeGuestCheckinOtpVerifyBody,
  ): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisationId}/attendees/guest/checkin/verify-otp`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
          // Critical: include credentials so the Set-Cookie returned by the
          // proxy (forwarded from the backend) actually lands in the browser
          // and is sent on subsequent cancel/feedback calls.
          credentials: "include",
        },
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to verify check-in OTP: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Probe whether this browser already holds a valid check-in session for
   * the given meeting. Returns the Attendee on hit, null on miss. The
   * proxy reads the HttpOnly tendiflow_checkin_session cookie server-side
   * (the browser can't), so we need `credentials: "include"` on the
   * outbound request.
   */
  async getCheckinSessionAttendee(
    organisationId: string,
    meetingId: string,
  ): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const qs = new URLSearchParams({ meeting_id: meetingId }).toString();
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisationId}/attendees/guest/checkin/session?${qs}`,
        {
          method: "GET",
          headers: { [HeaderKey.CONTENT_TYPE]: "application/json" },
          credentials: "include",
        },
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to read check-in session: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Cancel the caller's own guest check-in. The backend clears the
   * tendiflow_checkin_session cookie on success — the proxy forwards
   * that Set-Cookie verbatim, so credentials: include is required so
   * the cookie removal actually lands.
   */
  async cancelGuestCheckin(
    organisationId: string,
    meetingId: string,
  ): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const qs = new URLSearchParams({ meeting_id: meetingId }).toString();
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisationId}/attendees/guest/checkin/cancel?${qs}`,
        {
          method: "PUT",
          headers,
          credentials: "include",
        },
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to cancel check-in: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Submit feedback for the caller's own check-in. Cookie identifies
   * which attendee record gets the feedback attached.
   */
  async submitGuestCheckinFeedback(
    organisationId: string,
    meetingId: string,
    data: AttendeeFeedbackCreateClient,
  ): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const qs = new URLSearchParams({ meeting_id: meetingId }).toString();
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisationId}/attendees/guest/checkin/feedback?${qs}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
          credentials: "include",
        },
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to submit feedback: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
