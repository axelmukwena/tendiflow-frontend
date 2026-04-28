import { NextRequest, NextResponse } from "next/server";

import { AttendeeNoTokenService } from "@/api/services/weaver/attendees/notoken.service";
import { AttendeeCreateGuest } from "@/api/services/weaver/attendees/types";
import { getHeadersNextRequest } from "@/api/utilities";
import { verifyCsrfToken } from "@/utilities/helpers/csrf";
import { getErrorMessage } from "@/utilities/helpers/errors";

type RouteParams = Promise<{
  organisationId: string;
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
    const { organisationId } = params;
    const guestCheckinData: AttendeeCreateGuest = await req.json();

    if (!organisationId) {
      return NextResponse.json(
        { success: false, message: "Missing organisation ID" },
        { status: 400 },
      );
    }

    const headers = getHeadersNextRequest(req);
    const attendeeService = new AttendeeNoTokenService(headers);

    const requestResponse = await attendeeService.guestCheckin({
      organisation_id: organisationId,
      data: guestCheckinData,
    });

    return NextResponse.json(requestResponse);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to check in guest: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
};
