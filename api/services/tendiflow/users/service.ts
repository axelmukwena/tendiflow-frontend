import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowApiService } from "../service";
import { BasicApiResponse, DataServiceResponse } from "../types/general";
import {
  ApiActionUser,
  CreateUserProps,
  CreateUserResponseApi,
  DeleteUserProps,
  DeleteUserResponseApi,
  GetByIdUserProps,
  GetManyFilteredUsersProps,
  GetUserResponseApi,
  GetUsersResponseApi,
  UpdateUserPasswordProps,
  UpdateUserProps,
  UpdateUserResponseApi,
  UpdateUserStatusProps,
  UpdateUserStatusResponseApi,
  User,
} from "./types";
import { getUserApiUrlV1 } from "./utilities";

/**
 * Service for user management endpoints (requires authentication)
 */
export class UserService extends TendiflowApiService {
  /**
   * Get many users with filtering, sorting, and pagination
   * @param {GetManyFilteredUsersProps} props - The query and parameters
   * @returns {Promise<DataServiceResponse<User[]>>} The users response
   */
  async getManyFiltered({
    query,
    params,
  }: GetManyFilteredUsersProps): Promise<DataServiceResponse<User[]>> {
    try {
      const res = await this.api.post<GetUsersResponseApi>(
        getUserApiUrlV1({ action: ApiActionUser.GET_FILTERED }),
        query,
        { params },
      );

      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "Users fetched successfully",
          data: res.data,
          total: Number(res.headers[HeaderKey.X_TOTAL_COUNT]),
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch users");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch users. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new user
   * @param {CreateUserProps} props - The user creation data
   * @returns {Promise<DataServiceResponse<User | null>>} The user response
   */
  async create({
    data,
  }: CreateUserProps): Promise<DataServiceResponse<User | null>> {
    try {
      const res = await this.api.post<CreateUserResponseApi>(
        getUserApiUrlV1({ action: ApiActionUser.CREATE }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "User created successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to create user");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to create user. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get user by ID
   * @param {GetByIdUserProps} props - The user ID
   * @returns {Promise<DataServiceResponse<User | null>>} The user response
   */
  async getById({
    id,
  }: GetByIdUserProps): Promise<DataServiceResponse<User | null>> {
    try {
      const res = await this.api.get<GetUserResponseApi>(
        getUserApiUrlV1({ user_id: id, action: ApiActionUser.GET_BY_ID }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "User fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch user");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch user. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update user
   * @param {UpdateUserProps} props - The user update data
   * @returns {Promise<DataServiceResponse<User | null>>} The user response
   */
  async update({
    id,
    data,
  }: UpdateUserProps): Promise<DataServiceResponse<User | null>> {
    try {
      const res = await this.api.put<UpdateUserResponseApi>(
        getUserApiUrlV1({ user_id: id, action: ApiActionUser.UPDATE }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "User updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update user");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update user. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update user status
   * @param {UpdateUserStatusProps} props - The user status update data
   * @returns {Promise<DataServiceResponse<User | null>>} The user response
   */
  async updateStatus({
    id,
    data,
  }: UpdateUserStatusProps): Promise<DataServiceResponse<User | null>> {
    try {
      const res = await this.api.put<UpdateUserStatusResponseApi>(
        getUserApiUrlV1({ user_id: id, action: ApiActionUser.UPDATE_STATUS }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "User status updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update user status");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update user status. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update user password
   * @param {UpdateUserPasswordProps} props - The password update data
   * @returns {Promise<DataServiceResponse<BasicApiResponse>>} The response
   */
  async updatePassword({
    id,
    data,
  }: UpdateUserPasswordProps): Promise<DataServiceResponse<BasicApiResponse>> {
    try {
      const res = await this.api.put(
        getUserApiUrlV1({ user_id: id, action: ApiActionUser.UPDATE }) +
          "/password",
        data,
      );

      if (isRequestSuccess(res.status)) {
        return {
          success: true,
          message: "Password updated successfully",
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update password");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update password. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Delete user
   * @param {DeleteUserProps} props - The user ID
   * @returns {Promise<DataServiceResponse<BasicApiResponse>>} The response
   */
  async delete({
    id,
  }: DeleteUserProps): Promise<DataServiceResponse<BasicApiResponse>> {
    try {
      const res = await this.api.delete<DeleteUserResponseApi>(
        getUserApiUrlV1({ user_id: id, action: ApiActionUser.DELETE }),
      );

      if (isRequestSuccess(res.status)) {
        return {
          success: true,
          message: "User deleted successfully",
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to delete user");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to delete user. ${message}`,
        statuscode: 500,
      };
    }
  }
}
