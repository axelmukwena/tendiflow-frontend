import { NextRequest, NextResponse } from "next/server";

import { OauthService } from "@/api/services/weaver/oauth/service";
import { SignupRequest } from "@/api/services/weaver/oauth/types";
import { getHeadersNextRequest } from "@/api/utilities";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
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
    const signupData: SignupRequest = await req.json();
    const headers = getHeadersNextRequest(req);
    const oauthService = new OauthService(headers);
    const tokenResponse = await oauthService.signup({ data: signupData });
    return NextResponse.json(tokenResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to sign in. ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
