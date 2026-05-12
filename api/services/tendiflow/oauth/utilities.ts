import { ApiActionOauth } from "./types";

interface GetOauthApiUrlV1Params {
  action: ApiActionOauth;
}

/**
 * Get the API URL for Oauth endpoints
 * @param {GetOauthApiUrlV1Params} params The parameters to get the API URL
 * @returns {string} The API URL
 */
export const getOauthApiUrlV1 = ({ action }: GetOauthApiUrlV1Params): string =>
  `/api/v1/oauth/${action}`;
