import { NextRequest, NextResponse } from "next/server";

import { AttendeeNoTokenService } from "@/api/services/weaver/attendees/notoken.service";
import { AttendeeFeedbackCreate } from "@/api/services/weaver/attendees/types";
import { getHeadersNextRequest } from "@/api/utilities";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
import { getErrorMessage } from "@/utilities/helpers/errors";

type RouteParams = Promise<{
  organisationId: string;
  deviceFingerprint: string;
}>;

interface RouteContext {
  params: RouteParams;
}

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
    const { organisationId, deviceFingerprint } = params;
    const feedbackData: AttendeeFeedbackCreate = await req.json();

    if (!organisationId || !deviceFingerprint) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing organisation ID or device fingerprint",
        },
        { status: 400 },
      );
    }

    const headers = getHeadersNextRequest(req);
    const attendeeService = new AttendeeNoTokenService(headers);

    const requestResponse = await attendeeService.submitGuestFeedback({
      organisation_id: organisationId,
      device_fingerprint: deviceFingerprint,
      data: feedbackData,
    });

    return NextResponse.json(requestResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to submit guest feedback: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
