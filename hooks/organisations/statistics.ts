"use client";

import useSWR, { useSWRConfig } from "swr";

import { getOrganisationStatisticsFetcher } from "@/api/services/tendiflow/organisations/fetchers";
import {
  ApiActionOrganisation,
  OrganisationStatisticsResponse,
  UseOrganisationStatistics,
} from "@/api/services/tendiflow/organisations/types";
import { getOrganisationSwrUrlV1 } from "@/api/services/tendiflow/organisations/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { useUserCredentials } from "../profile/credentials";

interface UseOrganisationStatisticsProps {
  id?: string | null;
}

/**
 * Hook to get organisation statistics by ID.
 * @param {UseOrganisationStatisticsProps} props - The ID of the organisation to fetch statistics
 * @returns {UseOrganisationStatistics} The organisation statistics
 */
export const useOrganisationStatistics = ({
  id,
}: UseOrganisationStatisticsProps): UseOrganisationStatistics => {
  const { getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();
  const fetcher = async (): Promise<OrganisationStatisticsResponse> =>
    getOrganisationStatisticsFetcher({
      id,
      getIdToken,
    });

  const statisticsSwrUrl = getOrganisationSwrUrlV1({
    organisation_id: id,
    action: ApiActionOrganisation.GET_STATISTICS,
  });
  const { data, error, isLoading } = useSWR(statisticsSwrUrl, fetcher);

  const handleMutateStatistics = (): void => {
    mutate(statisticsSwrUrl);
  };

  return {
    statistics: data?.data || null,
    isLoading,
    error: getErrorMessage(error),
    handleMutateStatistics,
  };
};
