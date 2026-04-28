import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { WeaverNoTokenApiService } from "../notoken.service";
import { DataServiceResponse } from "../types/general";
import {
  ApiActionAttendee,
  Attendee,
  CancelGuestAttendanceProps,
  CancelGuestAttendanceResponseApi,
  GetGuestAttendeeProps,
  GetGuestAttendeeResponseApi,
  GuestCheckinProps,
  GuestCheckinResponseApi,
  SubmitGuestFeedbackProps,
  SubmitGuestFeedbackResponseApi,
  UpdateGuestAttendeeProps,
  UpdateGuestAttendeeResponseApi,
} from "./types";
import { getAttendeeApiUrlV1 } from "./utilities";

/**
 * Service for attendee endpoints that don't require authentication (guest endpoints)
 */
export class AttendeeNoTokenService extends WeaverNoTokenApiService {
  /**
   * Guest check-in (register + check-in in one step)
   * @param {GuestCheckinProps} props - The guest check-in data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async guestCheckin({
    organisation_id,
    data,
  }: GuestCheckinProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.post<GuestCheckinResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          action: ApiActionAttendee.GUEST_CHECKIN,
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
          message: "Guest checked in successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to check in guest");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to check in guest. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get guest attendee by device fingerprint
   * @param {GetGuestAttendeeProps} props - The device fingerprint data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async getGuestByFingerprint({
    organisation_id,
    device_fingerprint,
  }: GetGuestAttendeeProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.get<GetGuestAttendeeResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          device_fingerprint,
          action: ApiActionAttendee.GET_GUEST_BY_FINGERPRINT,
        }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "Guest attendee fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch guest attendee");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch guest attendee. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update guest attendee by device fingerprint
   * @param {UpdateGuestAttendeeProps} props - The guest update data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async updateGuestByFingerprint({
    organisation_id,
    device_fingerprint,
    data,
  }: UpdateGuestAttendeeProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.put<UpdateGuestAttendeeResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          device_fingerprint,
          action: ApiActionAttendee.UPDATE_GUEST_BY_FINGERPRINT,
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
          message: "Guest attendee updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update guest attendee");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update guest attendee. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Cancel guest attendance by device fingerprint
   * @param {CancelGuestAttendanceProps} props - The guest cancellation data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async cancelGuestByFingerprint({
    organisation_id,
    device_fingerprint,
  }: CancelGuestAttendanceProps): Promise<
    DataServiceResponse<Attendee | null>
  > {
    try {
      const res = await this.api.put<CancelGuestAttendanceResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          device_fingerprint,
          action: ApiActionAttendee.CANCEL_GUEST_BY_FINGERPRINT,
        }),
        {},
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "Guest attendance cancelled successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to cancel guest attendance");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to cancel guest attendance. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Submit guest feedback by device fingerprint
   * @param {SubmitGuestFeedbackProps} props - The guest feedback data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async submitGuestFeedback({
    organisation_id,
    device_fingerprint,
    data,
  }: SubmitGuestFeedbackProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.post<SubmitGuestFeedbackResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          device_fingerprint,
          action: ApiActionAttendee.SUBMIT_GUEST_FEEDBACK,
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
          message: "Guest feedback submitted successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to submit guest feedback");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to submit guest feedback. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
