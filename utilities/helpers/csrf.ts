import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { OauthToken } from "@/api/services/tendiflow/oauth/types";
import { DataServiceResponse } from "@/api/services/tendiflow/types/general";
import {
  getDomainNextRequestCookie,
  getSeureNextRequestCookie,
} from "@/api/utilities";

import { CookieKey, HeaderKey } from "./enums";

/**
 * Generate a secure random token
 * @returns {string} The generated token
 */
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const CSRF_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

/**
 * Set the CSRF token in a cookie
 * @param {NextResponse} res The response
 * @param {string} token The CSRF token
 */
export function setCsrfTokenCookie(res: NextResponse, token: string): void {
  res.cookies.set(CookieKey.TENDIFLOW_CSRF_TOKEN, token, {
    /**
     * Designating the CSRF cookie as HttpOnly doesn't offer any practical protection
     * because CSRF is only to protect against cross-domain attacks. If an attacker
     * can read the cookie via JavaScript, they're already on the same domain as
     * far as the browser knows, so they can do anything they like anyway.
     */
    httpOnly: false,
    sameSite: "strict",
    maxAge: CSRF_TOKEN_MAX_AGE,
    secure: getSeureNextRequestCookie(),
    domain: getDomainNextRequestCookie(),
  });
}

/**
 * Middleware to verify CSRF token from request headers
 * @param {NextRequest} req The request
 * @returns {boolean} If the CSRF token is valid
 */
/**
 * Middleware to verify CSRF token from request headers
 * @param {NextRequest} req The request
 * @returns {boolean} If the CSRF token is valid
 */
export const verifyCsrfToken = async (req: NextRequest): Promise<boolean> => {
  const csrfSecret = req.headers.get(HeaderKey.X_TENDIFLOW_CSRF_SECRET);
  if (csrfSecret && csrfSecret === process.env.CSRF_SECRET) {
    return true;
  }

  // Fetch the CSRF token from cookies using Next.js built-in cookie handling
  const cooks = await cookies();
  const csrfTokenFromCookie = cooks.get(CookieKey.TENDIFLOW_CSRF_TOKEN)?.value;
  // Fetch the CSRF token from the request header
  const csrfTokenFromHeader = req.headers.get(HeaderKey.X_TENDIFLOW_CSRF_TOKEN);
  // Validate that both exist and match
  if (!csrfTokenFromCookie || !csrfTokenFromHeader) {
    return false;
  }
  return csrfTokenFromCookie === csrfTokenFromHeader;
};

const isISOExpiringSoon = (iso?: string, minutes = 5): boolean => {
  if (!iso) return true;
  return new Date(iso).getTime() - Date.now() <= minutes * 60_000;
};

export const ensureServerIdToken = async (): Promise<
  string | null | undefined
> => {
  const cooks = await cookies();
  const idToken = cooks.get(CookieKey.TENDIFLOW_ID_TOKEN)?.value ?? null;
  const expiresAt = cooks.get(CookieKey.TENDIFLOW_ID_TOKEN_EXPIRES_AT)?.value;
  const refresh = cooks.get(CookieKey.TENDIFLOW_REFRESH_TOKEN)?.value;
  const isExpiringSoon = isISOExpiringSoon(expiresAt, 5);

  if (idToken && !isExpiringSoon) {
    return idToken;
  }

  if (!refresh) {
    return null;
  }

  const requestHeaders = {
    [HeaderKey.CONTENT_TYPE]: "application/json",
    [HeaderKey.X_TENDIFLOW_CSRF_SECRET]: process.env.CSRF_SECRET ?? "",
    [HeaderKey.X_TENDIFLOW_REFRESH_TOKEN]: refresh,
  };
  const url = `${process.env.NEXT_PUBLIC_SITE_BASE_URL}/api/oauth/token`;
  const res = await fetch(url, {
    method: "POST",
    headers: requestHeaders,
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as DataServiceResponse<OauthToken | null>;
  return data.data?.id_token;
};
