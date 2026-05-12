import { ApiActionMembership } from "./types";

interface MembershipUrlBuildingParams {
  base_url: string;
  membership_id?: string | null;
}

type MembershipUrlBuilder = (params: MembershipUrlBuildingParams) => string;

interface GetMembershipApiUrlV1Params {
  organisation_id: string;
  action: ApiActionMembership;
  membership_id?: string | null;
}

/**
 * URL builders for each membership action type.
 * Each function takes the necessary parameters and returns the complete URL.
 */
const membershipUrlBuilders: Record<ApiActionMembership, MembershipUrlBuilder> =
  {
    // Collection endpoints
    [ApiActionMembership.GET_FILTERED]: ({ base_url }) =>
      `${base_url}/filtered`,
    [ApiActionMembership.INVITE_USER]: ({ base_url }) => base_url,

    // Invitation endpoints
    [ApiActionMembership.RESPOND_TO_INVITATION]: ({ base_url }) =>
      `${base_url}/invitation`,

    // Individual membership endpoints
    [ApiActionMembership.GET_BY_ID]: ({ base_url, membership_id }) =>
      `${base_url}/${membership_id}`,
    [ApiActionMembership.UPDATE_PERMISSION]: ({ base_url, membership_id }) =>
      `${base_url}/${membership_id}/permission`,
    [ApiActionMembership.UPDATE_STATUS]: ({ base_url, membership_id }) =>
      `${base_url}/${membership_id}/status`,
    [ApiActionMembership.DELETE]: ({ base_url, membership_id }) =>
      `${base_url}/${membership_id}`,
  };

/**
 * Generate the complete API URL for membership endpoints.
 *
 * @param params - The parameters needed to build the URL
 * @returns The complete API URL for the specified action
 * @throws Error if the action is not recognized
 */
export const getMembershipApiUrlV1 = ({
  organisation_id,
  action,
  membership_id,
}: GetMembershipApiUrlV1Params): string => {
  const base_url = `/api/v1/organisations/${organisation_id}/memberships`;

  const urlBuilder = membershipUrlBuilders[action];
  if (!urlBuilder) {
    throw new Error(`Unsupported membership API action: ${action}`);
  }

  return urlBuilder({
    base_url,
    membership_id,
  });
};
