import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import {
  Attendee,
  AttendeeUserStatistics,
  GetAttendeeResponseApi,
  GetAttendeesResponseApi,
  GetAttendeeUserProps,
  GetAttendeeUsersProps,
  GetAttendeeUserStatisticsProps,
  GetAttendeeUserStatisticsResponseApi,
} from "../attendees/types";
import { TendiflowApiService } from "../service";
import { DataServiceResponse } from "../types/general";
import { User } from "../users/types";
import {
  ApiActionProfile,
  ChangePasswordProps,
  ChangePasswordResponseApi,
  GetProfileResponseApi,
  SuccessResponse,
  UpdateProfileProps,
  UpdateProfileResponseApi,
} from "./types";
import { getProfileApiUrlV1 } from "./utilities";

/**
 * Service for profile management endpoints (requires authentication)
 */
export class ProfileService extends TendiflowApiService {
  /**
   * Get current user profile
   * @returns {Promise<DataServiceResponse<User | null>>} The user profile response
   */
  async getProfile(): Promise<DataServiceResponse<User | null>> {
    try {
      const res = await this.api.get<GetProfileResponseApi>(
        getProfileApiUrlV1({ action: ApiActionProfile.GET_PROFILE }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "Profile fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch profile");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch profile. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get my attendances
   * @param {GetAttendeeUsersProps} props - The user ID, query and parameters
   * @returns {Promise<DataServiceResponse<Attendee[]>>} The attendees response
   */
  async getManyAttendeeUsers({
    user_id,
    query,
    params,
  }: GetAttendeeUsersProps): Promise<DataServiceResponse<Attendee[]>> {
    try {
      const res = await this.api.post<GetAttendeesResponseApi>(
        getProfileApiUrlV1({
          action: ApiActionProfile.MY_ATTENDANCES,
          user_id,
        }),
        query,
        { params },
      );

      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "My attendances fetched successfully",
          data: res.data,
          total: Number(res.headers[HeaderKey.X_TOTAL_COUNT]),
          statuscode: res.status,
        };
      }
      return processApiErrorResponse(res, "Failed to fetch my attendances");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch my attendances. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Get my attendance
   * @param {string} user_id - The user ID
   * @param {string} attendance_id - The attendance ID
   * @returns {Promise<DataServiceResponse<Attendee | null>>} The attendee response
   */
  async getAttendeeUser({
    user_id,
    attendance_id,
  }: GetAttendeeUserProps): Promise<DataServiceResponse<Attendee | null>> {
    try {
      const res = await this.api.get<GetAttendeeResponseApi>(
        getProfileApiUrlV1({
          action: ApiActionProfile.MY_ATTENDANCE,
          user_id,
          attendance_id,
        }),
      );
      if (isRequestSuccess(res.status) && "id" in res.data) {
        return {
          success: true,
          message: "My attendance fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }
      return processApiErrorResponse(res, "Failed to fetch my attendance");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch my attendance. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get my attendance statistics
   * @param {GetAttendeeUserStatisticsProps} props - The user ID and query
   * @returns {Promise<DataServiceResponse<AttendeeUserStatistics | null>>} The statistics response
   */
  async getAttendeeUserStatistics({
    user_id,
    query,
  }: GetAttendeeUserStatisticsProps): Promise<
    DataServiceResponse<AttendeeUserStatistics | null>
  > {
    try {
      const res = await this.api.post<GetAttendeeUserStatisticsResponseApi>(
        getProfileApiUrlV1({
          action: ApiActionProfile.MY_ATTENDANCE_STATISTICS,
          user_id,
        }),
        query,
      );
      if (
        isRequestSuccess(res.status) &&
        "meetings_attended_count" in res.data
      ) {
        return {
          success: true,
          message: "My attendance statistics fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }
      return processApiErrorResponse(
        res,
        "Failed to fetch my attendance statistics",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch my attendance statistics. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update user profile
   * @param {UpdateProfileProps} props - The profile update data
   * @returns {Promise<DataServiceResponse<User | null>>} The updated user response
   */
  async updateProfile({
    user_id,
    data,
  }: UpdateProfileProps): Promise<DataServiceResponse<User | null>> {
    try {
      const res = await this.api.put<UpdateProfileResponseApi>(
        getProfileApiUrlV1({
          action: ApiActionProfile.UPDATE_PROFILE,
          user_id,
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
          message: "Profile updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update profile");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update profile. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Change user password
   * @param {ChangePasswordProps} props - The password change data
   * @returns {Promise<DataServiceResponse<SuccessResponse | null>>} The success response
   */
  async changePassword({
    user_id,
    data,
  }: ChangePasswordProps): Promise<
    DataServiceResponse<SuccessResponse | null>
  > {
    try {
      const res = await this.api.put<ChangePasswordResponseApi>(
        getProfileApiUrlV1({
          action: ApiActionProfile.CHANGE_PASSWORD,
          user_id,
        }),
        data,
      );

      if (isRequestSuccess(res.status) && "success" in res.data) {
        return {
          success: true,
          message: "Password changed successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to change password");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to change password. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
