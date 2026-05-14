import { NextRequest, NextResponse } from "next/server";

import {
  Attendee,
  AttendeeGuestCheckinOtpVerifyBody,
} from "@/api/services/tendiflow/attendees/types";
import {
  DataServiceResponse,
  ErrorApiResponse,
} from "@/api/services/tendiflow/types/general";
import { getHeadersNextRequest, isRequestSuccess } from "@/api/utilities";
import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
import { getErrorMessage } from "@/utilities/helpers/errors";

type RouteParams = Promise<{
  organisationId: string;
}>;

interface RouteContext {
  params: RouteParams;
}

/**
 * Forwards Set-Cookie from the backend response onto our response so the
 * browser stores the tendiflow_checkin_session cookie. The shared no-token
 * service strips response headers, so we hand-roll the call here.
 */
export const POST = async (
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> => {
  const valid = await verifyCsrfToken(req);
  if (!valid) {
    return NextResponse.json(
      { success: false, message: "Authentication Error! Invalid CSRF token" },
      { status: 403 },
    );
  }

  try {
    const params = await context.params;
    const { organisationId } = params;
    const body: AttendeeGuestCheckinOtpVerifyBody = await req.json();

    if (!organisationId) {
      return NextResponse.json(
        { success: false, message: "Missing organisation ID" },
        { status: 400 },
      );
    }

    const forwardedHeaders = getHeadersNextRequest(req);
    const headers: Record<string, string> = {
      ...forwardedHeaders,
      "Content-Type": "application/json",
      "x-api-key": ENVIRONMENT_VARIABLES.API_KEY,
    };
    const url =
      `${ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_BASE_URL}` +
      `/api/v1/organisations/${organisationId}` +
      `/attendees/checkin/public/verify-otp`;

    const backendRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    let parsed: Attendee | ErrorApiResponse | null = null;
    try {
      parsed = (await backendRes.json()) as Attendee | ErrorApiResponse;
    } catch {
      parsed = null;
    }

    let wrapped: DataServiceResponse<Attendee | null>;
    if (
      isRequestSuccess(backendRes.status) &&
      parsed &&
      "id" in parsed &&
      "email" in parsed
    ) {
      wrapped = {
        success: true,
        message: "Check-in confirmed",
        data: parsed as Attendee,
        statuscode: backendRes.status,
      };
    } else {
      const errBody = parsed as ErrorApiResponse | null;
      wrapped = {
        success: false,
        message:
          errBody?.description ||
          errBody?.title ||
          "Failed to verify check-in OTP. Please try again.",
        data: null,
        statuscode: backendRes.status,
      };
    }

    const response = NextResponse.json(wrapped, { status: 200 });
    // Forward Set-Cookie verbatim so the browser stores
    // tendiflow_checkin_session for the frontend origin. The backend already
    // emits the correct attributes (HttpOnly, SameSite=Lax, Secure off in
    // dev) so no rewriting is needed here.
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie && wrapped.success) {
      response.headers.append("Set-Cookie", setCookie);
    }
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to verify check-in OTP: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
