import { OptionsType, setCookie } from "cookies-next";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { OauthService } from "@/api/services/weaver/oauth/service";
import { GoogleLoginRequest } from "@/api/services/weaver/oauth/types";
import {
  getDomainNextRequestCookie,
  getHeadersNextRequest,
  getSeureNextRequestCookie,
} from "@/api/utilities";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
import { CookieKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const valid = await verifyCsrfToken(req);
  if (!valid) {
    return NextResponse.json(
      {
        success: false,
        message: "Google Authentication Error! Invalid CSRF token",
      },
      { status: 403 },
    );
  }

  try {
    const googleLoginData: GoogleLoginRequest = await req.json();
    const headers = getHeadersNextRequest(req);
    const oauthService = new OauthService(headers);
    const tokenResponse = await oauthService.google({
      data: googleLoginData,
    });
    const { data } = tokenResponse;

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
      return NextResponse.json(tokenResponse);
    }
    return NextResponse.json(tokenResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to authenticate with Google. ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
