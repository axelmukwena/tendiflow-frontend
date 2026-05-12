import { ApiActionProfile } from "./types";

interface ProfileUrlBuildingParams {
  base_url: string;
  user_id?: string | null;
  attendance_id?: string | null;
}

type ProfileUrlBuilder = (params: ProfileUrlBuildingParams) => string;

interface GetProfileApiUrlV1Params {
  action: ApiActionProfile;
  user_id?: string | null;
  attendance_id?: string | null;
}

/**
 * URL builders for each profile action type.
 * Each function takes the necessary parameters and returns the complete URL.
 */
const profileUrlBuilders: Record<ApiActionProfile, ProfileUrlBuilder> = {
  // Profile endpoints
  [ApiActionProfile.GET_PROFILE]: ({ base_url }) => `${base_url}`,
  [ApiActionProfile.UPDATE_PROFILE]: ({ base_url, user_id }) =>
    `${base_url}/${user_id}`,

  // Password endpoints
  [ApiActionProfile.CHANGE_PASSWORD]: ({ base_url, user_id }) =>
    `${base_url}/${user_id}/password`,
  [ApiActionProfile.REQUEST_PASSWORD_RESET]: ({ base_url }) =>
    `${base_url}/password/reset/request`,
  [ApiActionProfile.CONFIRM_PASSWORD_RESET]: ({ base_url }) =>
    `${base_url}/password/reset/confirm`,

  // Email verification endpoints
  [ApiActionProfile.REQUEST_EMAIL_VERIFICATION]: ({ base_url }) =>
    `${base_url}/email/verification/request`,
  [ApiActionProfile.CONFIRM_EMAIL_VERIFICATION]: ({ base_url }) =>
    `${base_url}/email/verification/confirm`,

  // Attendance endpoints
  [ApiActionProfile.MY_ATTENDANCES]: ({ base_url, user_id }) =>
    `${base_url}/${user_id}/attendances`,
  [ApiActionProfile.MY_ATTENDANCE]: ({ base_url, user_id, attendance_id }) =>
    `${base_url}/${user_id}/attendances/${attendance_id}`,
  [ApiActionProfile.MY_ATTENDANCE_STATISTICS]: ({ base_url, user_id }) =>
    `${base_url}/${user_id}/attendances/statistics`,
};

/**
 * Generate the complete API URL for profile endpoints.
 *
 * @param params - The parameters needed to build the URL
 * @returns The complete API URL for the specified action
 * @throws Error if the action is not recognized
 */
export const getProfileApiUrlV1 = ({
  action,
  user_id,
  attendance_id,
}: GetProfileApiUrlV1Params): string => {
  const base_url = `/api/v1/profile`;

  const urlBuilder = profileUrlBuilders[action];
  if (!urlBuilder) {
    throw new Error(`Unsupported profile API action: ${action}`);
  }

  return urlBuilder({
    base_url,
    user_id,
    attendance_id,
  });
};

interface GetProfileSwrUrlParams {
  action: ApiActionProfile;
  user_id?: string | null;
  attendance_id?: string | null;
  query?: string;
}

/**
 * Generate the SWR URL for profile endpoints with query parameters.
 *
 * @param params - The parameters needed to build the SWR URL
 * @returns The complete SWR URL with query parameters
 */
export const getProfileSwrUrlV1 = ({
  action,
  user_id,
  attendance_id,
  query,
}: GetProfileSwrUrlParams): string => {
  const baseUrl = getProfileApiUrlV1({
    action,
    user_id,
    attendance_id,
  });

  return query ? `${baseUrl}?${query}` : baseUrl;
};
