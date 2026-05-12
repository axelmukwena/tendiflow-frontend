"use client";

import { deleteCookie, getCookie } from "cookies-next";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";

import {
  getOauthTokenWithRefreshToken,
  logout as logoutOauth,
} from "@/api/services/tendiflow/oauth/fetchers";
import { OauthIdTokenPayload } from "@/api/services/tendiflow/oauth/types";
import { LOGGED_OUT_PUBLIC_ROUTES } from "@/utilities/constants/paths";
import { isDateExpiringSoon } from "@/utilities/helpers/date";
import { CookieKey } from "@/utilities/helpers/enums";

class InvalidRefreshTokenError extends Error {
  constructor(message?: string) {
    super(message || "Invalid refresh token");
    this.name = "InvalidRefreshTokenError";
  }
}

// Shared variable to keep track of the ongoing token refresh
let refreshingTokenPromise: Promise<string> | null = null;

interface TokenPayloadFetched {
  id: string;
  payload: OauthIdTokenPayload;
}

export interface UseUserCredentials {
  id?: string | null;
  payload: OauthIdTokenPayload | null;
  promptSignin: boolean;
  isLoading: boolean;
  isValidating: boolean;
  getIdToken: () => Promise<string>;
  logout: () => Promise<void>;
}

/**
 * Decode JWT token payload without verification (client-side only)
 * @param token JWT token
 * @returns Decoded payload
 */
const decodeJwtPayload = (token: string): OauthIdTokenPayload => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    throw new Error("Invalid JWT token");
  }
};

/**
 * Get ID token payload
 * @param getIdToken Function to get ID token
 * @returns Token payload with decoded information
 */
const getIdTokenPayload = async ({
  getIdToken,
}: {
  getIdToken: () => Promise<string>;
}): Promise<TokenPayloadFetched> => {
  try {
    const token = await getIdToken();
    const payload = decodeJwtPayload(token);
    return {
      id: payload.sub,
      payload,
    };
  } catch {
    throw new InvalidRefreshTokenError();
  }
};

export const useUserCredentials = (): UseUserCredentials => {
  const SWR_KEY = "oauth-token-payload";
  const { mutate } = useSWRConfig();
  const pathname = usePathname();

  const getTokenWithRefreshToken = useCallback(async (): Promise<string> => {
    if (pathname && LOGGED_OUT_PUBLIC_ROUTES.includes(pathname)) {
      // If on a public route, do not attempt to refresh token
      return "";
    }
    try {
      const tokenResponse = await getOauthTokenWithRefreshToken();
      if (tokenResponse.success && tokenResponse.data?.id_token) {
        return tokenResponse.data.id_token;
      }
      throw new InvalidRefreshTokenError();
    } catch (error: unknown) {
      throw new InvalidRefreshTokenError(
        error instanceof Error ? error.message : String(error),
      );
    }
  }, []);

  /**
   * Get the id token.
   * @returns {Promise<string>} The promise that resolves to the id token.
   */
  const getIdToken = useCallback(async (): Promise<string> => {
    const token = await getCookie(CookieKey.TENDIFLOW_ID_TOKEN);
    const expiresAt = await getCookie(CookieKey.TENDIFLOW_ID_TOKEN_EXPIRES_AT);

    if (!token) {
      // Try to get a new token using the refresh token
      if (!refreshingTokenPromise) {
        refreshingTokenPromise = getTokenWithRefreshToken().finally(() => {
          refreshingTokenPromise = null;
        });
      }
      return refreshingTokenPromise;
    }

    const isExpiringSoon = isDateExpiringSoon({
      utcDateString: expiresAt,
      minutes: 15,
    });
    if (isExpiringSoon) {
      if (!refreshingTokenPromise) {
        refreshingTokenPromise = getTokenWithRefreshToken().finally(() => {
          refreshingTokenPromise = null;
        });
      }
      return refreshingTokenPromise;
    }

    return Promise.resolve(token);
  }, [getTokenWithRefreshToken]);

  /**
   * Sign out the user.
   * @returns {Promise<void>} The promise that resolves when the user is signed out.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      const cookieNames = [
        CookieKey.TENDIFLOW_ID_TOKEN,
        CookieKey.TENDIFLOW_ID_TOKEN_EXPIRES_AT,
        CookieKey.TENDIFLOW_REFRESH_TOKEN,
      ];
      cookieNames.forEach((key) => {
        deleteCookie(key);
      });
      await logoutOauth();
    } catch {
      // pass
    }
    mutate(SWR_KEY, null, false);
  }, [mutate]);

  const fetcher = async (): Promise<TokenPayloadFetched> =>
    getIdTokenPayload({ getIdToken });

  const {
    data: payload,
    error,
    isValidating,
  } = useSWR(SWR_KEY, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  const isLoading = !payload && !error;

  return {
    id: payload?.id || null,
    payload: payload?.payload || null,
    promptSignin: error instanceof InvalidRefreshTokenError,
    isLoading,
    isValidating,
    getIdToken,
    logout,
  };
};
