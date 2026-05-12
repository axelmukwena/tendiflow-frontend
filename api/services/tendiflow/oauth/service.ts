import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { TendiflowNoTokenApiService } from "../notoken.service";
import { DataServiceResponse } from "../types/general";
import { User } from "../users/types";
import {
  ApiActionOauth,
  GoogleLoginProps,
  GoogleLoginResponseApi,
  LoginProps,
  LoginResponseApi,
  OauthToken,
  RefreshTokenProps,
  RefreshTokenResponseApi,
  SignupProps,
  SignupResponseApi,
} from "./types";
import { getOauthApiUrlV1 } from "./utilities";

/**
 * Service for Oauth authentication endpoints
 */
export class OauthService extends TendiflowNoTokenApiService {
  /**
   * Sign up a new user
   * @param {SignupProps} props - The signup data
   * @returns {Promise<DataServiceResponse<User | null>>} The user response
   */
  async signup({
    data,
  }: SignupProps): Promise<DataServiceResponse<User | null>> {
    try {
      const res = await this.api.post<SignupResponseApi>(
        getOauthApiUrlV1({ action: ApiActionOauth.SIGNUP }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "email" in res.data
      ) {
        return {
          success: true,
          message: "Account created successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to create account");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to create account. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Login user with email and password
   * @param {LoginProps} props - The login data
   * @returns {Promise<DataServiceResponse<OauthToken | null>>} The token response
   */
  async login({
    data,
  }: LoginProps): Promise<DataServiceResponse<OauthToken | null>> {
    try {
      const res = await this.api.post<LoginResponseApi>(
        getOauthApiUrlV1({ action: ApiActionOauth.LOGIN }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id_token" in res.data &&
        "refresh_token" in res.data
      ) {
        return {
          success: true,
          message: "Login successful",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Invalid credentials", true);
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Login failed. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Refresh id token using refresh token
   * @param {RefreshTokenProps} props - The refresh token data
   * @returns {Promise<DataServiceResponse<OauthToken | null>>} The new token response
   */
  async token({
    data,
  }: RefreshTokenProps): Promise<DataServiceResponse<OauthToken | null>> {
    try {
      const res = await this.api.post<RefreshTokenResponseApi>(
        getOauthApiUrlV1({ action: ApiActionOauth.TOKEN }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id_token" in res.data &&
        "refresh_token" in res.data
      ) {
        return {
          success: true,
          message: "Token refreshed successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to refresh token", true);
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to refresh token. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }

  /**
   * Login user with Google OAuth
   * @param {GoogleLoginProps} props - The Google login data
   * @returns {Promise<DataServiceResponse<OauthToken | null>>} The token response
   */
  async google({
    data,
  }: GoogleLoginProps): Promise<DataServiceResponse<OauthToken | null>> {
    try {
      const res = await this.api.post<GoogleLoginResponseApi>(
        getOauthApiUrlV1({ action: ApiActionOauth.GOOGLE }),
        data,
      );

      if (
        isRequestSuccess(res.status) &&
        "id_token" in res.data &&
        "refresh_token" in res.data
      ) {
        return {
          success: true,
          message: "Google login successful",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to login with Google", true);
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Google login failed. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
