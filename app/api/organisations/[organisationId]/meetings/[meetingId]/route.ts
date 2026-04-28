import { NextRequest, NextResponse } from "next/server";

import { MeetingNoTokenService } from "@/api/services/weaver/meetings/notoken.service";
import { getHeadersNextRequest } from "@/api/utilities";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
import { getErrorMessage } from "@/utilities/helpers/errors";

type RouteParams = Promise<{
  organisationId: string;
  meetingId: string;
}>;

interface RouteContext {
  params: RouteParams;
}

export const GET = async (
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
    const { organisationId, meetingId } = params;

    if (!organisationId || !meetingId) {
      return NextResponse.json(
        { success: false, message: "Missing organisation ID or meeting ID" },
        { status: 400 },
      );
    }

    const headers = getHeadersNextRequest(req);
    const meetingsService = new MeetingNoTokenService(headers);

    const requestResponse = await meetingsService.get({
      organisation_id: organisationId,
      meeting_id: meetingId,
    });

    return NextResponse.json(requestResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to get meeting: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
