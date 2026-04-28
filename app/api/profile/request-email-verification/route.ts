import { NextRequest, NextResponse } from "next/server";

import { ProfileNoTokenService } from "@/api/services/weaver/profile/notoken.service";
import { EmailVerificationRequest } from "@/api/services/weaver/profile/types";
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
    const requestData: EmailVerificationRequest = await req.json();
    const headers = getHeadersNextRequest(req);
    const profileNoTokenService = new ProfileNoTokenService(headers);
    const requestResponse =
      await profileNoTokenService.requestEmailVerification({
        data: requestData,
      });
    return NextResponse.json(requestResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to request email verification. ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
