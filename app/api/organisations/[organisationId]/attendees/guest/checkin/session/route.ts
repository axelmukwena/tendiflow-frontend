import { NextRequest, NextResponse } from "next/server";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import {
  DataServiceResponse,
  ErrorApiResponse,
} from "@/api/services/tendiflow/types/general";
import { getHeadersNextRequest, isRequestSuccess } from "@/api/utilities";
import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";
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
 * Hydration probe for the OTP-issued session cookie. Reads the HttpOnly
 * cookie server-side and forwards it to the backend so the check-in
 * page can tell, on mount, whether the caller has already checked in
 * for this meeting and skip straight to the "already checked in" screen.
 *
 * Returns DataServiceResponse<Attendee | null>:
 *   data === null → caller is anonymous for this meeting (no cookie,
 *                   expired, scope mismatch, or attendee missing).
 *   data !== null → caller is the returned Attendee for this meeting.
 */
export const GET = async (
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> => {
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
      // Fast path: no cookie means no session — skip the round trip.
      const empty: DataServiceResponse<Attendee | null> = {
        success: true,
        message: "No check-in session",
        data: null,
        statuscode: 200,
      };
      return NextResponse.json(empty);
    }

    const forwardedHeaders = getHeadersNextRequest(req);
    const headers: Record<string, string> = {
      ...forwardedHeaders,
      "Content-Type": "application/json",
      "x-api-key": ENVIRONMENT_VARIABLES.API_KEY,
      // Forward only the session cookie — don't leak unrelated browser
      // cookies (eg. dashboard auth) to the backend.
      Cookie: `${CHECKIN_SESSION_COOKIE_NAME}=${sessionCookie.value}`,
    };
    const qs = new URLSearchParams({ meeting_id: meetingId }).toString();
    const url =
      `${ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_BASE_URL}` +
      `/api/v1/organisations/${organisationId}` +
      `/attendees/checkin/public/session?${qs}`;

    const backendRes = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    let parsed: Attendee | ErrorApiResponse | null = null;
    try {
      parsed = (await backendRes.json()) as
        | Attendee
        | ErrorApiResponse
        | null;
    } catch {
      parsed = null;
    }

    if (!isRequestSuccess(backendRes.status)) {
      const errBody = parsed as ErrorApiResponse | null;
      const wrapped: DataServiceResponse<Attendee | null> = {
        success: false,
        message:
          errBody?.description ||
          errBody?.title ||
          "Failed to read check-in session.",
        data: null,
        statuscode: backendRes.status,
      };
      return NextResponse.json(wrapped);
    }

    const isAttendee =
      parsed !== null && typeof parsed === "object" && "id" in parsed;
    const wrapped: DataServiceResponse<Attendee | null> = {
      success: true,
      message: isAttendee ? "Session active" : "No check-in session",
      data: isAttendee ? (parsed as Attendee) : null,
      statuscode: backendRes.status,
    };
    return NextResponse.json(wrapped);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to read check-in session: ${getErrorMessage(error)}`,
        data: null,
        statuscode: 500,
      },
      { status: 500 },
    );
  }
};
