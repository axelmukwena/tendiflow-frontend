import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowApiService } from "../service";
import { BasicApiResponse, DataServiceResponse } from "../types/general";
import {
  ApiActionOrganisation,
  CreateOrganisationProps,
  CreateOrganisationResponseApi,
  DeleteOrganisationProps,
  DeleteOrganisationResponseApi,
  GetByIdOrganisationProps,
  GetManyFilteredOrganisationsProps,
  GetOrganisationResponseApi,
  GetOrganisationsResponseApi,
  GetOrganisationStatisticsProps,
  GetOrganisationStatisticsResponseApi,
  Organisation,
  OrganisationStatistics,
  UpdateOrganisationDatabaseStatusProps,
  UpdateOrganisationDatabaseStatusResponseApi,
  UpdateOrganisationProps,
  UpdateOrganisationResponseApi,
} from "./types";
import { getOrganisationApiUrlV1 } from "./utilities";

/**
 * Service for organisation management endpoints (requires authentication)
 */
export class OrganisationService extends TendiflowApiService {
  /**
   * Get many organisations with filtering, sorting, and pagination
   * @param {GetManyFilteredOrganisationsProps} props - The query and parameters
   * @returns {Promise<DataServiceResponse<Organisation[]>>} The organisations response
   */
  async getManyFiltered({
    query,
    params,
  }: GetManyFilteredOrganisationsProps): Promise<
    DataServiceResponse<Organisation[]>
  > {
    try {
      const res = await this.api.post<GetOrganisationsResponseApi>(
        getOrganisationApiUrlV1({ action: ApiActionOrganisation.GET_FILTERED }),
        query,
        { params },
      );

      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "Organisations fetched successfully",
          data: res.data,
          total: Number(res.headers[HeaderKey.X_TOTAL_COUNT]),
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch organisations");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch organisations. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Get many member organisations with filtering, sorting, and pagination
   * @param {GetManyFilteredOrganisationsProps} props - The query and parameters
   * @returns {Promise<DataServiceResponse<Organisation[]>>} The organisations response
   */
  async getManyFilteredMember({
    query,
    params,
  }: GetManyFilteredOrganisationsProps): Promise<
    DataServiceResponse<Organisation[]>
  > {
    try {
      const res = await this.api.post<GetOrganisationsResponseApi>(
        getOrganisationApiUrlV1({
          action: ApiActionOrganisation.GET_FILTERED_MEMBER,
        }),
        query,
        { params },
      );
      if (isRequestSuccess(res.status) && Array.isArray(res.data)) {
        return {
          success: true,
          message: "Member organisations fetched successfully",
          data: res.data,
          total: Number(res.headers[HeaderKey.X_TOTAL_COUNT]),
          statuscode: res.status,
        };
      }
      return processApiErrorResponse(
        res,
        "Failed to fetch member organisations",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch member organisations. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Get organisation statistics
   * @param {GetOrganisationStatisticsProps} props - The organisation ID
   * @returns {Promise<DataServiceResponse<OrganisationStatistics>>} The organisation statistics response
   */
  async getStatistics({
    id,
  }: GetOrganisationStatisticsProps): Promise<
    DataServiceResponse<OrganisationStatistics>
  > {
    try {
      const res = await this.api.get<GetOrganisationStatisticsResponseApi>(
        getOrganisationApiUrlV1({
          organisation_id: id,
          action: ApiActionOrganisation.GET_STATISTICS,
        }),
      );
      if (isRequestSuccess(res.status) && "active_meetings_count" in res.data) {
        return {
          success: true,
          message: "Organisation statistics fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }
      return processApiErrorResponse(
        res,
        "Failed to fetch organisation statistics",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch organisation statistics. ${message}`,
        statuscode: 500,
      };
    }
  }

  /**
   * Create a new organisation
   * @param {CreateOrganisationProps} props - The organisation creation data
   * @returns {Promise<DataServiceResponse<Organisation | null>>} The organisation response
   */
  async create({
    data,
  }: CreateOrganisationProps): Promise<
    DataServiceResponse<Organisation | null>
  > {
    try {
      const res = await this.api.post<CreateOrganisationResponseApi>(
        getOrganisationApiUrlV1({ action: ApiActionOrganisation.CREATE }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "name" in res.data
      ) {
        return {
          success: true,
          message: "Organisation created successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to create organisation");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to create organisation. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Get organisation by ID
   * @param {GetByIdOrganisationProps} props - The organisation ID
   * @returns {Promise<DataServiceResponse<Organisation | null>>} The organisation response
   */
  async getById({
    id,
  }: GetByIdOrganisationProps): Promise<
    DataServiceResponse<Organisation | null>
  > {
    try {
      const res = await this.api.get<GetOrganisationResponseApi>(
        getOrganisationApiUrlV1({
          organisation_id: id,
          action: ApiActionOrganisation.GET_BY_ID,
        }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "name" in res.data
      ) {
        return {
          success: true,
          message: "Organisation fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch organisation");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch organisation. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update organisation
   * @param {UpdateOrganisationProps} props - The organisation update data
   * @returns {Promise<DataServiceResponse<Organisation | null>>} The organisation response
   */
  async update({
    id,
    data,
  }: UpdateOrganisationProps): Promise<
    DataServiceResponse<Organisation | null>
  > {
    try {
      const res = await this.api.put<UpdateOrganisationResponseApi>(
        getOrganisationApiUrlV1({
          organisation_id: id,
          action: ApiActionOrganisation.UPDATE,
        }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "name" in res.data
      ) {
        return {
          success: true,
          message: "Organisation updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to update organisation");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update organisation. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Update organisation database status
   * @param {UpdateOrganisationDatabaseStatusProps} props - The database status update data
   * @returns {Promise<DataServiceResponse<Organisation | null>>} The organisation response
   */
  async updateDatabaseStatus({
    id,
    data,
  }: UpdateOrganisationDatabaseStatusProps): Promise<
    DataServiceResponse<Organisation | null>
  > {
    try {
      const res =
        await this.api.put<UpdateOrganisationDatabaseStatusResponseApi>(
          getOrganisationApiUrlV1({
            organisation_id: id,
            action: ApiActionOrganisation.UPDATE_DATABASE_STATUS,
          }),
          data,
        );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "name" in res.data
      ) {
        return {
          success: true,
          message: "Organisation database status updated successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to update organisation database status",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to update organisation database status. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Delete organisation
   * @param {DeleteOrganisationProps} props - The organisation ID
   * @returns {Promise<DataServiceResponse<BasicApiResponse>>} The response
   */
  async delete({
    id,
  }: DeleteOrganisationProps): Promise<DataServiceResponse<BasicApiResponse>> {
    try {
      const res = await this.api.delete<DeleteOrganisationResponseApi>(
        getOrganisationApiUrlV1({
          organisation_id: id,
          action: ApiActionOrganisation.DELETE,
        }),
      );

      if (isRequestSuccess(res.status)) {
        return {
          success: true,
          message: "Organisation deleted successfully",
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to delete organisation");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to delete organisation. ${message}`,
        statuscode: 500,
      };
    }
  }
}
