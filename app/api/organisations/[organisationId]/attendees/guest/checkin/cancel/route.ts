import { NextRequest, NextResponse } from "next/server";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import {
  DataServiceResponse,
  ErrorApiResponse,
} from "@/api/services/tendiflow/types/general";
import { getHeadersNextRequest, isRequestSuccess } from "@/api/utilities";
import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
import { getErrorMessage } from "@/utilities/helpers/errors";

// Keep in sync with CHECKIN_SESSION_COOKIE_NAME in
// app/plugins/v1/checkin_session/client.py on the backend.
const CHECKIN_SESSION_COOKIE_NAME = "tendiflow_checkin_session";

type RouteParams = Promise<{
  organisationId: string;
}>;

interface RouteContext {
  params: RouteParams;
}

/**
 * Cancel the caller's own check-in. Forwards the session cookie outbound
 * and the Set-Cookie clear directive back, so a successful cancel both
 * marks the attendee CANCELLED server-side and clears the browser
 * cookie (forcing re-OTP if the user changes their mind).
 */
export const PUT = async (
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
    const meetingId = req.nextUrl.searchParams.get("meeting_id");

    if (!organisationId) {
      return NextResponse.json(
        { success: false, message: "Missing organisation ID" },
        { status: 400 },
      );
    }
    if (!meetingId) {
      return NextResponse.json(
        { success: false, message: "Missing meeting_id" },
        { status: 400 },
      );
    }

    const sessionCookie = req.cookies.get(CHECKIN_SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      // No cookie = nothing to cancel against. Backend would 401 anyway.
      return NextResponse.json({
        success: false,
        message: "No active check-in session.",
        data: null,
        statuscode: 401,
      });
    }

    const headers: Record<string, string> = {
      ...getHeadersNextRequest(req),
      "Content-Type": "application/json",
      "x-api-key": ENVIRONMENT_VARIABLES.API_KEY,
      Cookie: `${CHECKIN_SESSION_COOKIE_NAME}=${sessionCookie.value}`,
    };
    const qs = new URLSearchParams({ meeting_id: meetingId }).toString();
    const url =
      `${ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_BASE_URL}` +
      `/api/v1/organisations/${organisationId}` +
      `/attendees/checkin/public/cancel?${qs}`;

    const backendRes = await fetch(url, { method: "PUT", headers });

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
        message: "Check-in cancelled",
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
          "Failed to cancel check-in.",
        data: null,
        statuscode: backendRes.status,
      };
    }

    const response = NextResponse.json(wrapped, { status: 200 });
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie && wrapped.success) {
      response.headers.append("Set-Cookie", setCookie);
    }
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to cancel check-in: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
