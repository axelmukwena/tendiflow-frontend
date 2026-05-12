import { getCookie } from "cookies-next";

import { CookieKey, HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { DataServiceResponse } from "../types/general";
import { User } from "../users/types";
import {
  GoogleLoginRequestClient,
  LoginRequestClient,
  OauthToken,
  SignupRequestClient,
} from "./types";

/**
 * Fetch a new CSRF token.
 * @returns {Promise<void>} The promise that resolves when the CSRF token is fetched.
 */
export const fetchNewCsrfToken = async (): Promise<void> => {
  try {
    const res = await fetch("/api/oauth/csrf", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch CSRF token");
    }
  } catch (error) {
    throw new Error(`Failed to fetch CSRF token. ${getErrorMessage(error)}`);
  }
};

/**
 * Get the CSRF token.
 * @returns {Promise<string>} The promise that resolves to the CSRF token.
 */
export const getCsrfToken = async (): Promise<string> => {
  const csrfToken = await getCookie(CookieKey.TENDIFLOW_CSRF_TOKEN);
  if (csrfToken) {
    return csrfToken;
  }
  await fetchNewCsrfToken();
  const newCsrfToken = await getCookie(CookieKey.TENDIFLOW_CSRF_TOKEN);
  return newCsrfToken || "";
};

interface SignupProps {
  data: SignupRequestClient;
}

/**
 * Sign up a new user.
 * @param {SignupRequestClient} data The signup data.
 * @returns {Promise<DataServiceResponse<User | null>>} The promise that resolves to a data service response.
 */
export const signup = async ({
  data,
}: SignupProps): Promise<DataServiceResponse<User | null>> => {
  try {
    const headers = {
      [HeaderKey.CONTENT_TYPE]: "application/json",
      [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
    };
    const res = await fetch("/api/oauth/signup", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: `Failed to create account. ${getErrorMessage(error)}`,
    };
  }
};

/**
 * Get the oauth token using the refresh token.
 * @param {GetOauthTokenWithRefreshTokenProps} props The properties to get the oauth token with refresh token.
 * @returns {Promise<DataServiceResponse<OauthToken | null>>} The promise that resolves to a data service response.
 */
export const getOauthTokenWithRefreshToken = async (): Promise<
  DataServiceResponse<OauthToken | null>
> => {
  try {
    const headers = {
      [HeaderKey.CONTENT_TYPE]: "application/json",
      [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
    };
    const res = await fetch("/api/oauth/token", {
      method: "POST",
      headers,
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch oauth token. ${getErrorMessage(error)}`,
    };
  }
};

interface LoginWithEmailPasswordProps {
  data: LoginRequestClient;
}

/**
 * Log in with email and password.
 * @param {LoginWithEmailPasswordProps} props The properties to sign in with email and password.
 * @returns {Promise<DataServiceResponse<OauthToken | null>>} The promise that resolves to a data service response.
 */
export const loginWithEmailPassword = async ({
  data,
}: LoginWithEmailPasswordProps): Promise<
  DataServiceResponse<OauthToken | null>
> => {
  try {
    const headers = {
      [HeaderKey.CONTENT_TYPE]: "application/json",
      [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
    };
    const res = await fetch("/api/oauth/login", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: `Failed to login in. ${getErrorMessage(error)}`,
    };
  }
};

/**
 * Log out the user.
 * @returns {Promise<void>} The promise that resolves when the user is logged out.
 */
export const logout = async (): Promise<void> => {
  const headers = {
    [HeaderKey.CONTENT_TYPE]: "application/json",
    [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
  };
  try {
    const res = await fetch("/api/oauth/logout", {
      method: "POST",
      headers,
    });
    if (!res.ok) {
      throw new Error("Failed to log out");
    }
  } catch (error) {
    throw new Error(`Failed to log out. ${getErrorMessage(error)}`);
  }
};

interface LoginWithGoogleProps {
  data: GoogleLoginRequestClient;
}

/**
 * Sign in with Google.
 * @param {LoginWithGoogleProps} props The properties to sign in with Google.
 * @returns {Promise<DataServiceResponse<OauthToken | null>>} The promise that resolves to a data service response.
 */
export const signInWithGoogle = async ({
  data,
}: LoginWithGoogleProps): Promise<DataServiceResponse<OauthToken | null>> => {
  try {
    const headers = {
      [HeaderKey.CONTENT_TYPE]: "application/json",
      [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
    };
    const res = await fetch("/api/oauth/google", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: `Failed to sign in with Google. ${getErrorMessage(error)}`,
    };
  }
};
