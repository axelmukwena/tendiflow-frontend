import { ApiActionUser } from "./types";

interface UserUrlBuildingParams {
  base_url: string;
  user_id?: string | null;
}

type UserUrlBuilder = (params: UserUrlBuildingParams) => string;

interface GetUserApiUrlV1Params {
  action: ApiActionUser;
  user_id?: string | null;
}

/**
 * URL builders for each user action type.
 * Each function takes the necessary parameters and returns the complete URL.
 */
const userUrlBuilders: Record<ApiActionUser, UserUrlBuilder> = {
  // Collection endpoints
  [ApiActionUser.GET_FILTERED]: ({ base_url }) => `${base_url}/filtered`,
  [ApiActionUser.CREATE]: ({ base_url }) => base_url,

  // Individual user endpoints
  [ApiActionUser.GET_BY_ID]: ({ base_url, user_id }) =>
    `${base_url}/${user_id}`,
  [ApiActionUser.UPDATE]: ({ base_url, user_id }) => `${base_url}/${user_id}`,
  [ApiActionUser.DELETE]: ({ base_url, user_id }) => `${base_url}/${user_id}`,

  // User-specific operations
  [ApiActionUser.UPDATE_STATUS]: ({ base_url, user_id }) =>
    `${base_url}/${user_id}/status`,
};

/**
 * Generate the complete API URL for user endpoints.
 *
 * @param params - The parameters needed to build the URL
 * @returns The complete API URL for the specified action
 * @throws Error if the action is not recognized
 */
export const getUserApiUrlV1 = ({
  action,
  user_id,
}: GetUserApiUrlV1Params): string => {
  const base_url = `/api/v1/users`;

  const urlBuilder = userUrlBuilders[action];
  if (!urlBuilder) {
    throw new Error(`Unsupported user API action: ${action}`);
  }

  return urlBuilder({
    base_url,
    user_id,
  });
};
