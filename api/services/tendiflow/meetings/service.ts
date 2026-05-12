import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowApiService } from "../service";
import { BasicApiResponse, DataServiceResponse } from "../types/general";
import {
  ApiActionMeeting,
  CheckMeetingLocation,
  CheckMeetingLocationProps,
  CheckMeetingLocationResponseApi,
  CreateMeetingProps,
  CreateMeetingResponseApi,
  DeleteMeetingProps,
  DeleteMeetingResponseApi,
  GetByIdMeetingProps,
  GetManyFilteredMeetingsProps,
  GetMeetingResponseApi,
  GetMeetingsResponseApi,
  GetRecurringSeriesProps,
  GetRecurringSeriesResponseApi,
  Meeting,
  RegenerateMeetingQrcodeProps,
  RegenerateMeetingQrcodeResponseApi,
  UpdateMeetingDatabaseStatusProps,
  UpdateMeetingDatabaseStatusResponseApi,
  UpdateMeetingProps,
  UpdateMeetingResponseApi,
} from "./types";
import { getMeetingApiUrlV1 } from "./utilities";

/**
 * Service for meeting management endpoints (requires authentication)
 */
export class MeetingService extends TendiflowApiService {
  /**
   * Get many meetings with filtering, sorting, and pagination
   * @param {GetManyFilteredMeetingsProps} props - The organisation ID, query and parameters
   * @returns {Promise<DataServiceResponse<Meeting[]>>} The meetings response
   */
  async getManyFiltered({
    organisation_id,
    query,
    params,
  }: GetManyFilteredMeetingsProps): Promise<DataServiceResponse<Meeting[]>> {
    try {
      const res = await this.api.post<GetMeetingsResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          action: ApiActionMeeting.GET_FILTERED,
        }),
        query,
        { params },
      );

      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "Meetings fetched successfully",
          data: res.data,
          total: Number(res.headers[HeaderKey.X_TOTAL_COUNT]),
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch meetings");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch meetings. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new meeting
   * @param {CreateMeetingProps} props - The organisation ID and meeting creation data
   * @returns {Promise<DataServiceResponse<Meeting | null>>} The meeting response
   */
  async create({
    organisation_id,
    data,
  }: CreateMeetingProps): Promise<DataServiceResponse<Meeting | null>> {
    try {
      const res = await this.api.post<CreateMeetingResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          action: ApiActionMeeting.CREATE,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "title" in res.data
      ) {
        return {
          success: true,
          message: "Meeting created successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to create meeting");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to create meeting. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Regenerate meeting QR code
   * @param {RegenerateMeetingQrcodeProps} props - The QR code regeneration data
   * @returns {Promise<DataServiceResponse<Meeting | null>>} The meeting response
   */
  async regenerateQrcode({
    organisation_id,
    meeting_id,
    options,
  }: RegenerateMeetingQrcodeProps): Promise<
    DataServiceResponse<Meeting | null>
  > {
    try {
      const res = await this.api.post<RegenerateMeetingQrcodeResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          meeting_id,
          action: ApiActionMeeting.REGENERATE_QRCODE,
        }),
        options || {},
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "title" in res.data
      ) {
        return {
          success: true,
          message: "Meeting QR code regenerated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to regenerate meeting QR code",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to regenerate meeting QR code. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get meeting by ID
   * @param {GetByIdMeetingProps} props - The organisation ID and meeting ID
   * @returns {Promise<DataServiceResponse<Meeting | null>>} The meeting response
   */
  async getById({
    organisation_id,
    id,
  }: GetByIdMeetingProps): Promise<DataServiceResponse<Meeting | null>> {
    try {
      const res = await this.api.get<GetMeetingResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          meeting_id: id,
          action: ApiActionMeeting.GET_BY_ID,
        }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "title" in res.data
      ) {
        return {
          success: true,
          message: "Meeting fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch meeting");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch meeting. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update meeting
   * @param {UpdateMeetingProps} props - The meeting update data
   * @returns {Promise<DataServiceResponse<Meeting | null>>} The meeting response
   */
  async update({
    organisation_id,
    id,
    data,
  }: UpdateMeetingProps): Promise<DataServiceResponse<Meeting | null>> {
    try {
      const res = await this.api.put<UpdateMeetingResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          meeting_id: id,
          action: ApiActionMeeting.UPDATE,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "title" in res.data
      ) {
        return {
          success: true,
          message: "Meeting updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update meeting");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update meeting. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update meeting database status
   * @param {UpdateMeetingDatabaseStatusProps} props - The database status update data
   * @returns {Promise<DataServiceResponse<Meeting | null>>} The meeting response
   */
  async updateDatabaseStatus({
    organisation_id,
    id,
    data,
  }: UpdateMeetingDatabaseStatusProps): Promise<
    DataServiceResponse<Meeting | null>
  > {
    try {
      const res = await this.api.put<UpdateMeetingDatabaseStatusResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          meeting_id: id,
          action: ApiActionMeeting.UPDATE_DATABASE_STATUS,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "title" in res.data
      ) {
        return {
          success: true,
          message: "Meeting database status updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to update meeting database status",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update meeting database status. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Delete meeting
   * @param {DeleteMeetingProps} props - The meeting deletion data
   * @returns {Promise<DataServiceResponse<BasicApiResponse>>} The response
   */
  async delete({
    organisation_id,
    id,
    update_effect,
  }: DeleteMeetingProps): Promise<DataServiceResponse<BasicApiResponse>> {
    try {
      const url = getMeetingApiUrlV1({
        organisation_id,
        meeting_id: id,
        action: ApiActionMeeting.DELETE,
      });

      // Add update_effect as query parameter if provided
      const params = update_effect ? { update_effect } : undefined;

      const res = await this.api.delete<DeleteMeetingResponseApi>(url, {
        params,
      });

      if (isRequestSuccess(res.status)) {
        return {
          success: true,
          message: "Meeting deleted successfully",
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to delete meeting");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to delete meeting. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Get recurring meeting series
   * @param {GetRecurringSeriesProps} props - The organisation ID and meeting ID
   * @returns {Promise<DataServiceResponse<Meeting[]>>} The meetings response
   */
  async getRecurringSeries({
    organisation_id,
    meeting_id,
  }: GetRecurringSeriesProps): Promise<DataServiceResponse<Meeting[]>> {
    try {
      const res = await this.api.get<GetRecurringSeriesResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          meeting_id,
          action: ApiActionMeeting.GET_RECURRING_SERIES,
        }),
      );

      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "Recurring meeting series fetched successfully",
          data: res.data,
          total: res.data.length,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to fetch recurring meeting series",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch recurring meeting series. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Check meeting location
   * @param {CheckMeetingLocationProps} props - The location check data
   * @returns {Promise<DataServiceResponse<CheckMeetingLocation | null>>} The location check response
   */
  async checkLocation({
    organisation_id,
    meeting_id,
    user_coordinates,
  }: CheckMeetingLocationProps): Promise<
    DataServiceResponse<CheckMeetingLocation | null>
  > {
    try {
      const res = await this.api.post<CheckMeetingLocationResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          meeting_id,
          action: ApiActionMeeting.CHECK_LOCATION,
        }),
        user_coordinates,
      );

      if (
        isRequestSuccess(res.status) &&
        "within_radius" in res.data &&
        "meeting_has_location" in res.data
      ) {
        return {
          success: true,
          message: "Meeting location checked successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to check meeting location");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to check meeting location. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
