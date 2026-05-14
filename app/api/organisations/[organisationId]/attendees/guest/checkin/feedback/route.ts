import { NextRequest, NextResponse } from "next/server";

import {
  Attendee,
  AttendeeFeedbackCreateClient,
} from "@/api/services/tendiflow/attendees/types";
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
 * Submit feedback for the caller's own check-in. Forwards the session
 * cookie outbound so the backend can identify which attendee record
 * the feedback attaches to.
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
    const meetingId = req.nextUrl.searchParams.get("meeting_id");
    const body: AttendeeFeedbackCreateClient = await req.json();

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
      `/attendees/checkin/public/feedback?${qs}`;

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
        message: "Feedback submitted",
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
          "Failed to submit feedback.",
        data: null,
        statuscode: backendRes.status,
      };
    }

    return NextResponse.json(wrapped, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to submit feedback: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
