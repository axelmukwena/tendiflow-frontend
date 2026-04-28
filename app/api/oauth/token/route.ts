import { deleteCookie, OptionsType, setCookie } from "cookies-next";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { OauthService } from "@/api/services/weaver/oauth/service";
import { RefreshTokenRequest } from "@/api/services/weaver/oauth/types";
import {
  getDomainNextRequestCookie,
  getHeadersNextRequest,
  getSeureNextRequestCookie,
} from "@/api/utilities";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
import { CookieKey, HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const valid = await verifyCsrfToken(req);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Authentication Error! Invalid CSRF token" },
      { status: 403 },
    );
  }

  try {
    const cooks = await cookies();
    const refreshToken =
      cooks.get(CookieKey.TENDIFLOW_REFRESH_TOKEN)?.value ||
      req.headers.get(HeaderKey.X_TENDIFLOW_REFRESH_TOKEN);
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication Error! Refresh token is not set!",
        },
        { status: 401 },
      );
    }

    const headers = getHeadersNextRequest(req);
    const tokenData: RefreshTokenRequest = {
      refresh_token: refreshToken,
    };
    const oauthService = new OauthService(headers);
    const tokenResponse = await oauthService.token({ data: tokenData });
    const { data, message, statuscode } = tokenResponse;

    if (data) {
      const cookieOptions: OptionsType = {
        req,
        res: new NextResponse(),
        cookies,
        sameSite: "strict",
        secure: getSeureNextRequestCookie(),
        domain: getDomainNextRequestCookie(),
      };
      setCookie(CookieKey.TENDIFLOW_ID_TOKEN, data.id_token, {
        ...cookieOptions,
        maxAge: data.expires_in,
      });
      setCookie(CookieKey.TENDIFLOW_ID_TOKEN_EXPIRES_AT, data.expires_at, {
        ...cookieOptions,
        maxAge: data.expires_in,
      });
      if (data.refresh_token) {
        setCookie(
          CookieKey.TENDIFLOW_REFRESH_TOKEN,
          data.refresh_token,
          cookieOptions,
        );
      }
      return NextResponse.json(tokenResponse, { status: statuscode || 200 });
    }
    if (
      message.includes("refresh token") &&
      (message.includes("invalid") || message.includes("expired"))
    ) {
      const cookieOptions: OptionsType = {
        req,
        res: new NextResponse(),
        cookies,
        sameSite: "strict",
        secure: getSeureNextRequestCookie(),
        domain: getDomainNextRequestCookie(),
      };
      // Delete authentication cookies
      deleteCookie(CookieKey.TENDIFLOW_ID_TOKEN, cookieOptions);
      deleteCookie(CookieKey.TENDIFLOW_ID_TOKEN_EXPIRES_AT, cookieOptions);
      deleteCookie(CookieKey.TENDIFLOW_REFRESH_TOKEN, cookieOptions);
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: statuscode || 401 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch token. ${message}`,
      },
      { status: statuscode || 500 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        succsess: false,
        message: `Failed to fetch token. ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
