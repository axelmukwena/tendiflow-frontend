import { ApiActionAttendee, AttendeeParams, AttendeeQuery } from "./types";

interface AttendeeUrlBuildingParams {
  base_url: string;
  attendee_id?: string | null;
  device_fingerprint?: string | null;
}

type AttendeeUrlBuilder = (params: AttendeeUrlBuildingParams) => string;

interface GetAttendeeApiUrlV1Params {
  organisation_id: string;
  action: ApiActionAttendee;
  attendee_id?: string | null;
  device_fingerprint?: string | null;
}

/**
 * URL builders for each attendee action type.
 * Each function takes the necessary parameters and returns the complete URL.
 */
const attendeeUrlBuilders: Record<ApiActionAttendee, AttendeeUrlBuilder> = {
  // Collection endpoints
  [ApiActionAttendee.GET_FILTERED]: ({ base_url }) => `${base_url}/filtered`,

  // Individual attendee endpoints
  [ApiActionAttendee.GET_BY_ID]: ({ base_url, attendee_id }) =>
    `${base_url}/${attendee_id}`,
  [ApiActionAttendee.UPDATE]: ({ base_url, attendee_id }) =>
    `${base_url}/${attendee_id}`,
  [ApiActionAttendee.UPDATE_DATABASE_STATUS]: ({ base_url, attendee_id }) =>
    `${base_url}/${attendee_id}/database-status`,
  [ApiActionAttendee.DELETE]: ({ base_url, attendee_id }) =>
    `${base_url}/${attendee_id}`,
  [ApiActionAttendee.CANCEL]: ({ base_url, attendee_id }) =>
    `${base_url}/${attendee_id}/cancel`,
  [ApiActionAttendee.SUBMIT_FEEDBACK]: ({ base_url, attendee_id }) =>
    `${base_url}/${attendee_id}/feedback`,

  // Registration endpoints
  [ApiActionAttendee.REGISTER]: ({ base_url }) => `${base_url}/register`,

  // Guest endpoints (using device fingerprint)
  [ApiActionAttendee.GUEST_CHECKIN]: ({ base_url }) =>
    `${base_url}/checkin/public`,
  [ApiActionAttendee.GET_GUEST_BY_FINGERPRINT]: ({
    base_url,
    device_fingerprint,
  }) => `${base_url}/guest/${device_fingerprint}`,
  [ApiActionAttendee.UPDATE_GUEST_BY_FINGERPRINT]: ({
    base_url,
    device_fingerprint,
  }) => `${base_url}/guest/${device_fingerprint}`,
  [ApiActionAttendee.CANCEL_GUEST_BY_FINGERPRINT]: ({
    base_url,
    device_fingerprint,
  }) => `${base_url}/guest/${device_fingerprint}/cancel`,
  [ApiActionAttendee.SUBMIT_GUEST_FEEDBACK]: ({
    base_url,
    device_fingerprint,
  }) => `${base_url}/guest/${device_fingerprint}/feedback`,
};

/**
 * Generate the complete API URL for attendee endpoints.
 *
 * @param params - The parameters needed to build the URL
 * @returns The complete API URL for the specified action
 * @throws Error if the action is not recognized
 */
export const getAttendeeApiUrlV1 = ({
  organisation_id,
  action,
  attendee_id,
  device_fingerprint,
}: GetAttendeeApiUrlV1Params): string => {
  const base_url = `/api/v1/organisations/${organisation_id}/attendees`;

  const urlBuilder = attendeeUrlBuilders[action];
  if (!urlBuilder) {
    throw new Error(`Unsupported attendee API action: ${action}`);
  }

  return urlBuilder({
    base_url,
    attendee_id,
    device_fingerprint,
  });
};

interface GetAttendeeSwrUrlParams extends GetAttendeeApiUrlV1Params {
  query?: AttendeeQuery | null;
  params?: AttendeeParams | null;
}

/**
 * Generate the SWR URL for attendee endpoints with query parameters.
 *
 * @param params - The parameters needed to build the SWR URL
 * @returns The complete SWR URL with serialized query and params
 */
export const getAttendeeSwrUrlV1 = ({
  attendee_id,
  device_fingerprint,
  action,
  organisation_id,
  query,
  params,
}: GetAttendeeSwrUrlParams): string => {
  const baseUrl = getAttendeeApiUrlV1({
    attendee_id,
    action,
    organisation_id,
    device_fingerprint,
  });

  return `${baseUrl}?query=${JSON.stringify(query)}&params=${JSON.stringify(params)}`;
};
