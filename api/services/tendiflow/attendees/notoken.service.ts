import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowNoTokenApiService } from "../notoken.service";
import { DataServiceResponse } from "../types/general";
import {
  ApiActionAttendee,
  Attendee,
  AttendeeGuestCheckinOtpRequestResponse,
  RequestGuestCheckinOtpProps,
  RequestGuestCheckinOtpResponseApi,
  VerifyGuestCheckinOtpProps,
  VerifyGuestCheckinOtpResponseApi,
} from "./types";
import { getAttendeeApiUrlV1 } from "./utilities";

/**
 * Service for attendee endpoints that don't require authentication (guest endpoints)
 */
export class AttendeeNoTokenService extends TendiflowNoTokenApiService {
  /**
   * Request a one-time check-in code for a guest attendee. The backend
   * validates the proposed check-in and sends a 6-digit code to the chosen
   * channel (email or SMS); nothing is written until verify-otp succeeds.
   */
  async requestGuestCheckinOtp({
    organisation_id,
    data,
  }: RequestGuestCheckinOtpProps): Promise<
    DataServiceResponse<AttendeeGuestCheckinOtpRequestResponse | null>
  > {
    try {
      const res = await this.api.post<RequestGuestCheckinOtpResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          action: ApiActionAttendee.GUEST_CHECKIN_REQUEST_OTP,
        }),
        data,
      );

      if (isRequestSuccess(res.status) && "status" in res.data) {
        return {
          success: true,
          message: "OTP sent to the attendee",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to request check-in OTP");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to request check-in OTP. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Verify a guest check-in OTP. On success the backend writes the
   * attendee record and sets the tendiflow_checkin_session cookie.
   */
  async verifyGuestCheckinOtp({
    organisation_id,
    data,
  }: VerifyGuestCheckinOtpProps): Promise<
    DataServiceResponse<Attendee | null>
  > {
    try {
      const res = await this.api.post<VerifyGuestCheckinOtpResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          action: ApiActionAttendee.GUEST_CHECKIN_VERIFY_OTP,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "Check-in confirmed",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to verify check-in OTP");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to verify check-in OTP. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

}
