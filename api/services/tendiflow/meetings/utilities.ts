import { ApiActionMeeting, MeetingParams, MeetingQuery } from "./types";

interface MeetingUrlBuildingParams {
  base_url: string;
  meeting_id?: string | null;
}

type MeetingUrlBuilder = (params: MeetingUrlBuildingParams) => string;

interface GetMeetingApiUrlV1Params {
  organisation_id: string;
  action: ApiActionMeeting;
  meeting_id?: string | null;
}

/**
 * URL builders for each meeting action type.
 * Each function takes the necessary parameters and returns the complete URL.
 */
const meetingUrlBuilders: Record<ApiActionMeeting, MeetingUrlBuilder> = {
  // Collection endpoints
  [ApiActionMeeting.GET_FILTERED]: ({ base_url }) => `${base_url}/filtered`,
  [ApiActionMeeting.CREATE]: ({ base_url }) => base_url,

  // Individual meeting endpoints
  [ApiActionMeeting.GET_BY_ID]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}`,
  [ApiActionMeeting.UPDATE]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}`,
  [ApiActionMeeting.DELETE]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}`,

  // Meeting-specific operations
  [ApiActionMeeting.REGENERATE_QRCODE]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}/qrcode/regenerate`,
  [ApiActionMeeting.UPDATE_DATABASE_STATUS]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}/database-status`,
  [ApiActionMeeting.GET_RECURRING_SERIES]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}/recurring-series`,
  [ApiActionMeeting.CHECK_LOCATION]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}/check-location`,
  [ApiActionMeeting.PUBLIC]: ({ base_url, meeting_id }) =>
    `${base_url}/${meeting_id}/public`,
};

/**
 * Generate the complete API URL for meeting endpoints.
 *
 * @param params - The parameters needed to build the URL
 * @returns The complete API URL for the specified action
 * @throws Error if the action is not recognized
 */
export const getMeetingApiUrlV1 = ({
  organisation_id,
  action,
  meeting_id,
}: GetMeetingApiUrlV1Params): string => {
  const base_url = `/api/v1/organisations/${organisation_id}/meetings`;

  const urlBuilder = meetingUrlBuilders[action];
  if (!urlBuilder) {
    throw new Error(`Unsupported meeting API action: ${action}`);
  }

  return urlBuilder({
    base_url,
    meeting_id,
  });
};

interface GetMeetingSwrUrlParams extends GetMeetingApiUrlV1Params {
  query?: MeetingQuery | null;
  params?: MeetingParams | null;
}

/**
 * Generate the SWR URL for meeting endpoints with query parameters.
 *
 * @param params - The parameters needed to build the SWR URL
 * @returns The complete SWR URL with serialized query and params
 */
export const getMeetingSwrUrlV1 = ({
  meeting_id,
  action,
  organisation_id,
  query,
  params,
}: GetMeetingSwrUrlParams): string => {
  const baseUrl = getMeetingApiUrlV1({
    meeting_id,
    action,
    organisation_id,
  });

  return `${baseUrl}?query=${JSON.stringify(query)}&params=${JSON.stringify(params)}`;
};
