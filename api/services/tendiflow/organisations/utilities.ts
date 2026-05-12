import {
  ApiActionOrganisation,
  OrganisationParams,
  OrganisationQuery,
} from "./types";

interface OrganisationUrlBuildingParams {
  base_url: string;
  organisation_id?: string | null;
}

type OrganisationUrlBuilder = (params: OrganisationUrlBuildingParams) => string;

interface GetOrganisationApiUrlV1Params {
  action: ApiActionOrganisation;
  organisation_id?: string | null;
}

/**
 * URL builders for each organisation action type.
 * Each function takes the necessary parameters and returns the complete URL.
 */
const organisationUrlBuilders: Record<
  ApiActionOrganisation,
  OrganisationUrlBuilder
> = {
  // Collection endpoints
  [ApiActionOrganisation.GET_FILTERED]: ({ base_url }) =>
    `${base_url}/filtered`,
  [ApiActionOrganisation.GET_FILTERED_MEMBER]: ({ base_url }) =>
    `${base_url}/filtered-member`,
  [ApiActionOrganisation.CREATE]: ({ base_url }) => base_url,
  [ApiActionOrganisation.GET_STATISTICS]: ({ base_url, organisation_id }) =>
    `${base_url}/${organisation_id}/statistics`,

  // Individual organisation endpoints
  [ApiActionOrganisation.GET_BY_ID]: ({ base_url, organisation_id }) =>
    `${base_url}/${organisation_id}`,
  [ApiActionOrganisation.UPDATE]: ({ base_url, organisation_id }) =>
    `${base_url}/${organisation_id}`,
  [ApiActionOrganisation.DELETE]: ({ base_url, organisation_id }) =>
    `${base_url}/${organisation_id}`,

  // Organisation-specific operations
  [ApiActionOrganisation.UPDATE_DATABASE_STATUS]: ({
    base_url,
    organisation_id,
  }) => `${base_url}/${organisation_id}/database-status`,
};

/**
 * Generate the complete API URL for organisation endpoints.
 *
 * @param params - The parameters needed to build the URL
 * @returns The complete API URL for the specified action
 * @throws Error if the action is not recognized
 */
export const getOrganisationApiUrlV1 = ({
  action,
  organisation_id,
}: GetOrganisationApiUrlV1Params): string => {
  const base_url = `/api/v1/organisations`;

  const urlBuilder = organisationUrlBuilders[action];
  if (!urlBuilder) {
    throw new Error(`Unsupported organisation API action: ${action}`);
  }

  return urlBuilder({
    base_url,
    organisation_id,
  });
};

interface GetOrganisationSwrUrlParams extends GetOrganisationApiUrlV1Params {
  query?: OrganisationQuery | null;
  params?: OrganisationParams | null;
}

/**
 * Generate the SWR URL for organisation endpoints with query parameters.
 *
 * @param params - The parameters needed to build the SWR URL
 * @returns The complete SWR URL with serialized query and params
 */
export const getOrganisationSwrUrlV1 = ({
  action,
  organisation_id,
  query,
  params,
}: GetOrganisationSwrUrlParams): string => {
  const baseUrl = getOrganisationApiUrlV1({
    action,
    organisation_id,
  });

  return `${baseUrl}?query=${JSON.stringify(query)}&params=${JSON.stringify(params)}`;
};
