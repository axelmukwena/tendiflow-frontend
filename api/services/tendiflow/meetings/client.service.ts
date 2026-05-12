import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { DataServiceResponse } from "@/api/services/tendiflow/types/general";
import { HeaderKey } from "@/utilities/helpers/enums";

import { getCsrfToken } from "../oauth/fetchers";

export interface GetPublicMeetingClientProps {
  organisation_id: string;
  meeting_id: string;
}

/**
 * Client-side service for meeting operations that go through Next.js API routes
 * These routes handle OAuth credentials server-side
 */
export class MeetingClientService {
  private baseUrl = "/api";

  /**
   * Get a public meeting by ID
   */
  async getPublicMeeting({
    organisation_id,
    meeting_id,
  }: GetPublicMeetingClientProps): Promise<
    DataServiceResponse<Meeting | null>
  > {
    try {
      const headers = {
        [HeaderKey.CONTENT_TYPE]: "application/json",
        [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
      };
      const response = await fetch(
        `${this.baseUrl}/organisations/${organisation_id}/meetings/${meeting_id}`,
        {
          method: "GET",
          headers,
        },
      );

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: `Failed to get meeting: ${error}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
