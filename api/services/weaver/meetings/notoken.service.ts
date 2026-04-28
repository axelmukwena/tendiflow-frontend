import { isRequestSuccess, processApiErrorResponse } from "@/api/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { WeaverNoTokenApiService } from "../notoken.service";
import { DataServiceResponse } from "../types/general";
import {
  ApiActionMeeting,
  GetPublicMeetingProps,
  GetPublicMeetingResponseApi,
  Meeting,
} from "./types";
import { getMeetingApiUrlV1 } from "./utilities";

/**
 * Service for meeting endpoints that don't require authentication (guest endpoints)
 */
export class MeetingNoTokenService extends WeaverNoTokenApiService {
  /**
   * Get a public meeting by ID
   * @param {GetPublicMeetingProps} props - The organisation ID, meeting ID, and parameters
   * @returns {Promise<DataServiceResponse<Meeting | null>>} The meeting response
   */
  async get({
    organisation_id,
    meeting_id,
  }: GetPublicMeetingProps): Promise<DataServiceResponse<Meeting | null>> {
    try {
      const res = await this.api.get<GetPublicMeetingResponseApi>(
        getMeetingApiUrlV1({
          organisation_id,
          meeting_id,
          action: ApiActionMeeting.PUBLIC,
        }),
      );

      if (
        isRequestSuccess(res.status) &&
        "id" in res.data &&
        "title" in res.data
      ) {
        return {
          success: true,
          message: "Meeting fetched successfully",
          data: res.data,
          statuscode: res.status,
        };
      }

      return processApiErrorResponse(res, "Failed to fetch meeting");
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Failed to fetch meeting. ${message}`,
        data: null,
        statuscode: 500,
      };
    }
  }
}
