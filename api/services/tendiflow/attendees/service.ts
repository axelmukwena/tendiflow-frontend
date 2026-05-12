import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowApiService } from "../service";
import { BasicApiResponse, DataServiceResponse } from "../types/general";
import {
  ApiActionAttendee,
  Attendee,
  CancelAttendanceProps,
  CancelAttendanceResponseApi,
  DeleteAttendeeProps,
  DeleteAttendeeResponseApi,
  GetAttendeeResponseApi,
  GetAttendeesResponseApi,
  GetByIdAttendeeProps,
  GetManyFilteredAttendeesProps,
  RegisterAttendeeProps,
  RegisterAttendeeResponseApi,
  SubmitFeedbackProps,
  SubmitFeedbackResponseApi,
  UpdateAttendeeDatabaseStatusProps,
  UpdateAttendeeDatabaseStatusResponseApi,
  UpdateAttendeeProps,
  UpdateAttendeeResponseApi,
} from "./types";
import { getAttendeeApiUrlV1 } from "./utilities";

/**
 * Service for attendee management endpoints (requires authentication)
 */
export class AttendeeService extends TendiflowApiService {
  /**
   * Get many attendees with filtering, sorting, and pagination
   * @param {GetManyFilteredAttendeesProps} props - The organisation ID, meeting ID, query and parameters
   * @returns {Promise<DataServiceResponse<Attendee[]>>} The attendees response
   */
  async getManyFiltered({
    organisation_id,
    query,
    params,
  }: GetManyFilteredAttendeesProps): Promise<DataServiceResponse<Attendee[]>> {
    try {
      const res = await this.api.post<GetAttendeesResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          action: ApiActionAttendee.GET_FILTERED,
        }),
        query,
        { params },
      );

      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "Attendees fetched successfully",
          data: res.data,
          total: Number(res.headers[HeaderKey.X_TOTAL_COUNT]),
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch attendees");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch attendees. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Get attendee by ID
   * @param {GetByIdAttendeeProps} props - The organisation ID, meeting ID and attendee ID
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async getById({
    organisation_id,
    id,
  }: GetByIdAttendeeProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.get<GetAttendeeResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          attendee_id: id,
          action: ApiActionAttendee.GET_BY_ID,
        }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "Attendee fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch attendee");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch attendee. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Register attendee for meeting
   * @param {RegisterAttendeeProps} props - The attendee registration data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async register({
    organisation_id,
    data,
  }: RegisterAttendeeProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.post<RegisterAttendeeResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          action: ApiActionAttendee.REGISTER,
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
          message: "Attendee registered successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to register attendee");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to register attendee. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update attendee
   * @param {UpdateAttendeeProps} props - The attendee update data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async update({
    organisation_id,
    id,
    data,
  }: UpdateAttendeeProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.put<UpdateAttendeeResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          attendee_id: id,
          action: ApiActionAttendee.UPDATE,
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
          message: "Attendee updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update attendee");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update attendee. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update attendee database status
   * @param {UpdateAttendeeDatabaseStatusProps} props - The database status update data
   * @returns {Promise<DataServiceResponse<Attendee| null>>} The attendee response
   */
  async updateDatabaseStatus({
    organisation_id,
    id,
    data,
  }: UpdateAttendeeDatabaseStatusProps): Promise<
    DataServiceResponse<Attendee | null>
  > {
    try {
      const res = await this.api.put<UpdateAttendeeDatabaseStatusResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          attendee_id: id,
          action: ApiActionAttendee.UPDATE_DATABASE_STATUS,
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
          message: "Attendee database status updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to update attendee database status",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update attendee database status. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Delete attendee
   * @param {DeleteAttendeeProps} props - The attendee deletion data
   * @returns {Promise<DataServiceResponse<BasicApiResponse>>} The response
   */
  async delete({
    organisation_id,
    id,
  }: DeleteAttendeeProps): Promise<DataServiceResponse<BasicApiResponse>> {
    try {
      const res = await this.api.delete<DeleteAttendeeResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          attendee_id: id,
          action: ApiActionAttendee.DELETE,
        }),
      );

      if (isRequestSuccess(res.status)) {
        return {
          success: true,
          message: "Attendee deleted successfully",
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to delete attendee");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to delete attendee. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Cancel attendee attendance
   * @param {CancelAttendanceProps} props - The attendance cancellation data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async cancel({
    organisation_id,
    id,
  }: CancelAttendanceProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.put<CancelAttendanceResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          attendee_id: id,
          action: ApiActionAttendee.CANCEL,
        }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "Attendance cancelled successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to cancel attendance");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to cancel attendance. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Submit feedback for attendee
   * @param {SubmitFeedbackProps} props - The feedback submission data
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async submitFeedback({
    organisation_id,
    id,
    data,
  }: SubmitFeedbackProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.post<SubmitFeedbackResponseApi>(
        getAttendeeApiUrlV1({
          organisation_id,
          attendee_id: id,
          action: ApiActionAttendee.SUBMIT_FEEDBACK,
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
          message: "Feedback submitted successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to submit feedback");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to submit feedback. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
