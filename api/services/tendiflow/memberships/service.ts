import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowApiService } from "../service";
import { BasicApiResponse, DataServiceResponse } from "../types/general";
import {
  ApiActionMembership,
  DeleteMembershipProps,
  DeleteMembershipResponseApi,
  GetByIdMembershipProps,
  GetManyFilteredMembershipsProps,
  GetMembershipResponseApi,
  GetMembershipsResponseApi,
  InviteUserProps,
  InviteUserResponseApi,
  Membership,
  RespondToInvitationProps,
  RespondToInvitationResponseApi,
  UpdateMembershipPermissionProps,
  UpdateMembershipPermissionResponseApi,
  UpdateMembershipStatusProps,
  UpdateMembershipStatusResponseApi,
} from "./types";
import { getMembershipApiUrlV1 } from "./utilities";

/**
 * Service for membership management endpoints (requires authentication)
 */
export class MembershipService extends TendiflowApiService {
  /**
   * Get many memberships with filtering, sorting, and pagination
   * @param {GetManyFilteredMembershipsProps} props - The organisation ID, query and parameters
   * @returns {Promise<DataServiceResponse<Membership[]>>} The memberships response
   */
  async getManyFiltered({
    organisation_id,
    query,
    params,
  }: GetManyFilteredMembershipsProps): Promise<
    DataServiceResponse<Membership[]>
  > {
    try {
      const res = await this.api.post<GetMembershipsResponseApi>(
        getMembershipApiUrlV1({
          organisation_id,
          action: ApiActionMembership.GET_FILTERED,
        }),
        query,
        { params },
      );

      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "Memberships fetched successfully",
          data: res.data,
          total: Number(res.headers[HeaderKey.X_TOTAL_COUNT]),
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch memberships");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch memberships. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Invite user to organisation
   * @param {InviteUserProps} props - The organisation ID and invitation data
   * @returns {Promise<DataServiceResponse<Membership | null>>} The membership response
   */
  async inviteUser({
    organisation_id,
    data,
  }: InviteUserProps): Promise<DataServiceResponse<Membership | null>> {
    try {
      const res = await this.api.post<InviteUserResponseApi>(
        getMembershipApiUrlV1({
          organisation_id,
          action: ApiActionMembership.INVITE_USER,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "user_id" in res.data
      ) {
        return {
          success: true,
          message: "User invited successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to invite user");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to invite user. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Respond to organisation invitation (accept/decline)
   * @param {RespondToInvitationProps} props - The organisation ID and invitation response
   * @returns {Promise<DataServiceResponse<Membership | null>>} The membership response
   */
  async respondToInvitation({
    organisation_id,
    data,
  }: RespondToInvitationProps): Promise<
    DataServiceResponse<Membership | null>
  > {
    try {
      const res = await this.api.put<RespondToInvitationResponseApi>(
        getMembershipApiUrlV1({
          organisation_id,
          action: ApiActionMembership.RESPOND_TO_INVITATION,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "user_id" in res.data
      ) {
        return {
          success: true,
          message: "Invitation response updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to respond to invitation");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to respond to invitation. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get membership by ID
   * @param {GetByIdMembershipProps} props - The organisation ID and membership ID
   * @returns {Promise<DataServiceResponse<Membership | null>>} The membership response
   */
  async getById({
    organisation_id,
    id,
  }: GetByIdMembershipProps): Promise<DataServiceResponse<Membership | null>> {
    try {
      const res = await this.api.get<GetMembershipResponseApi>(
        getMembershipApiUrlV1({
          organisation_id,
          membership_id: id,
          action: ApiActionMembership.GET_BY_ID,
        }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "user_id" in res.data
      ) {
        return {
          success: true,
          message: "Membership fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch membership");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch membership. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update membership permission
   * @param {UpdateMembershipPermissionProps} props - The membership permission update data
   * @returns {Promise<DataServiceResponse<Membership | null>>} The membership response
   */
  async updatePermission({
    organisation_id,
    id,
    data,
  }: UpdateMembershipPermissionProps): Promise<
    DataServiceResponse<Membership | null>
  > {
    try {
      const res = await this.api.put<UpdateMembershipPermissionResponseApi>(
        getMembershipApiUrlV1({
          organisation_id,
          membership_id: id,
          action: ApiActionMembership.UPDATE_PERMISSION,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "user_id" in res.data
      ) {
        return {
          success: true,
          message: "Membership permission updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to update membership permission",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update membership permission. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update membership status (admin operation)
   * @param {UpdateMembershipStatusProps} props - The membership status update data
   * @returns {Promise<DataServiceResponse<Membership | null>>} The membership response
   */
  async updateStatus({
    organisation_id,
    id,
    data,
  }: UpdateMembershipStatusProps): Promise<
    DataServiceResponse<Membership | null>
  > {
    try {
      const res = await this.api.put<UpdateMembershipStatusResponseApi>(
        getMembershipApiUrlV1({
          organisation_id,
          membership_id: id,
          action: ApiActionMembership.UPDATE_STATUS,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "user_id" in res.data
      ) {
        return {
          success: true,
          message: "Membership status updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update membership status");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update membership status. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Remove membership (delete)
   * @param {DeleteMembershipProps} props - The organisation ID and membership ID
   * @returns {Promise<DataServiceResponse<BasicApiResponse>>} The response
   */
  async delete({
    organisation_id,
    id,
  }: DeleteMembershipProps): Promise<DataServiceResponse<BasicApiResponse>> {
    try {
      const res = await this.api.delete<DeleteMembershipResponseApi>(
        getMembershipApiUrlV1({
          organisation_id,
          membership_id: id,
          action: ApiActionMembership.DELETE,
        }),
      );

      if (isRequestSuccess(res.status)) {
        return {
          success: true,
          message: "Membership removed successfully",
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to remove membership");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to remove membership. ${message}`,
        statuscode: 500,
      };
    }
  }
}
