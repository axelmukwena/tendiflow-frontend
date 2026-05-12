import { OrganisationService } from "./service";
import {
  Organisation,
  OrganisationParams,
  OrganisationQuery,
  OrganisationsManyResponse,
  OrganisationStatisticsResponse,
} from "./types";

interface GetOrganisationByIdFetcherProps {
  id?: string | null;
  getIdToken: () => Promise<string>;
}

/**
 * Fetches an organisation by ID.
 * @param {GetOrganisationByIdFetcherProps} props The fetcher props.
 * @returns {Promise<Organisation | null>} The organisation.
 */
export const getOrganisationByIdFetcher = async ({
  id,
  getIdToken,
}: GetOrganisationByIdFetcherProps): Promise<Organisation | null> => {
  if (!id) {
    return null;
  }
  const token = await getIdToken();
  const organisationService = new OrganisationService(token);
  const res = await organisationService.getById({ id });
  if (res.success) {
    return res.data || null;
  }
  throw new Error(res.message);
};

interface GetManyOrganisationsFetcherProps {
  params: OrganisationParams;
  query: OrganisationQuery;
  getIdToken: () => Promise<string>;
  requireIdsOrSearch?: boolean;
}

/**
 * Fetches many organisations.
 * @param {GetManyOrganisationsFetcherProps} props The fetcher props.
 * @returns {Promise<OrganisationsManyResponse>} The organisations.
 */
export const getMemberOrganisationsFetcher = async ({
  params,
  query,
  getIdToken,
  requireIdsOrSearch,
}: GetManyOrganisationsFetcherProps): Promise<OrganisationsManyResponse> => {
  if (requireIdsOrSearch && !query.ids?.length && !query.search) {
    return null;
  }
  const token = await getIdToken();
  const organisationService = new OrganisationService(token);
  const res = await organisationService.getManyFilteredMember({
    query,
    params,
  });
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
};

interface GetOrganisationStatisticsFetcherProps {
  id?: string | null;
  getIdToken: () => Promise<string>;
}
/**
 * Fetches statistics for an organisation.
 * @param {GetOrganisationStatisticsFetcherProps} props The fetcher props.
 * @returns {Promise<OrganisationStatisticsResponse>} The organisation statistics.
 */
export const getOrganisationStatisticsFetcher = async ({
  id,
  getIdToken,
}: GetOrganisationStatisticsFetcherProps): Promise<OrganisationStatisticsResponse> => {
  if (!id) {
    return null;
  }
  const token = await getIdToken();
  const organisationService = new OrganisationService(token);
  const res = await organisationService.getStatistics({ id });
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
};
