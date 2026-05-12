import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowNoTokenApiService } from "../notoken.service";
import { DataServiceResponse } from "../types/general";
import {
  ApiActionProfile,
  EmailVerificationConfirmProps,
  EmailVerificationConfirmResponseApi,
  EmailVerificationRequestProps,
  EmailVerificationRequestResponseApi,
  PasswordResetConfirmProps,
  PasswordResetConfirmResponseApi,
  PasswordResetRequestProps,
  PasswordResetRequestResponseApi,
  SuccessResponse,
} from "./types";
import { getProfileApiUrlV1 } from "./utilities";

/**
 * Profile service for endpoints that don't require authentication
 */
export class ProfileNoTokenService extends TendiflowNoTokenApiService {
  /**
   * Request email verification
   * @param {EmailVerificationRequestProps} props - The email verification request data
   * @returns {Promise<DataServiceResponse<SuccessResponse | null>>} The success response
   */
  async requestEmailVerification({
    data,
  }: EmailVerificationRequestProps): Promise<
    DataServiceResponse<SuccessResponse | null>
  > {
    try {
      const res = await this.api.post<EmailVerificationRequestResponseApi>(
        getProfileApiUrlV1({
          action: ApiActionProfile.REQUEST_EMAIL_VERIFICATION,
        }),
        data,
      );

      if (isRequestSuccess(res.status) && "success" in res.data) {
        return {
          success: true,
          message: "Email verification request sent successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to request email verification",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to request email verification. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Confirm email verification
   * @param {EmailVerificationConfirmProps} props - The email verification confirm data
   * @returns {Promise<DataServiceResponse<SuccessResponse | null>>} The success response
   */
  async confirmEmailVerification({
    data,
  }: EmailVerificationConfirmProps): Promise<
    DataServiceResponse<SuccessResponse | null>
  > {
    try {
      const res = await this.api.post<EmailVerificationConfirmResponseApi>(
        getProfileApiUrlV1({
          action: ApiActionProfile.CONFIRM_EMAIL_VERIFICATION,
        }),
        data,
      );

      if (isRequestSuccess(res.status) && "success" in res.data) {
        return {
          success: true,
          message: "Email verification confirmed successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(
        res,
        "Failed to confirm email verification",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to confirm email verification. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Request password reset
   * @param {PasswordResetRequestProps} props - The password reset request data
   * @returns {Promise<DataServiceResponse<SuccessResponse | null>>} The success response
   */
  async requestPasswordReset({
    data,
  }: PasswordResetRequestProps): Promise<
    DataServiceResponse<SuccessResponse | null>
  > {
    try {
      const res = await this.api.post<PasswordResetRequestResponseApi>(
        getProfileApiUrlV1({ action: ApiActionProfile.REQUEST_PASSWORD_RESET }),
        data,
      );

      if (isRequestSuccess(res.status) && "success" in res.data) {
        return {
          success: true,
          message: "Password reset request sent successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to request password reset");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to request password reset. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Confirm password reset
   * @param {PasswordResetConfirmProps} props - The password reset confirm data
   * @returns {Promise<DataServiceResponse<SuccessResponse | null>>} The success response
   */
  async confirmPasswordReset({
    data,
  }: PasswordResetConfirmProps): Promise<
    DataServiceResponse<SuccessResponse | null>
  > {
    try {
      const res = await this.api.post<PasswordResetConfirmResponseApi>(
        getProfileApiUrlV1({ action: ApiActionProfile.CONFIRM_PASSWORD_RESET }),
        data,
      );

      if (isRequestSuccess(res.status) && "success" in res.data) {
        return {
          success: true,
          message: "Password reset confirmed successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to confirm password reset");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to confirm password reset. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
