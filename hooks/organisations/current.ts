"use client";

import useSWR, { useSWRConfig } from "swr";

import { getOrganisationByIdFetcher } from "@/api/services/tendiflow/organisations/fetchers";
import {
  ApiActionOrganisation,
  Organisation,
  UseCurrentOrganisation,
} from "@/api/services/tendiflow/organisations/types";
import { getOrganisationApiUrlV1 } from "@/api/services/tendiflow/organisations/utilities";
import { useCurrentUserContext } from "@/contexts/current-user";
import { LocalStorageKey } from "@/storage/local/enum";
import { setLocalStorageItem } from "@/storage/local/storage";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { useUserCredentials } from "../profile/credentials";

/**
 * A hook to get and manage the current organisation.
 * @returns The current organisation and methods to manage it.
 */
export const useCurrentOrganisation = (): UseCurrentOrganisation => {
  const { currentOrganisationId } = useCurrentUserContext();
  const { getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const setCurrentOrganisation = (id: string | null): void => {
    if (id) {
      setLocalStorageItem(LocalStorageKey.CURRENT_ORGANISATION_ID, id);
    } else {
      setLocalStorageItem(LocalStorageKey.CURRENT_ORGANISATION_ID, null);
    }
  };

  const organisationSwrUrl = getOrganisationApiUrlV1({
    organisation_id: currentOrganisationId,
    action: ApiActionOrganisation.GET_BY_ID,
  });

  const fetcher = async (): Promise<Organisation | null> =>
    getOrganisationByIdFetcher({
      id: currentOrganisationId,
      getIdToken,
    });

  const {
    data: currentOrganisation,
    error,
    isLoading: organisationLoading,
  } = useSWR(currentOrganisationId ? organisationSwrUrl : null, fetcher, {
    // refreshInterval: 60000,
  });

  const mutateCurrentOrganisation = (): void => {
    if (currentOrganisationId) {
      mutate(organisationSwrUrl);
    }
  };

  const isLoading =
    organisationLoading ||
    !!(currentOrganisationId && !currentOrganisation && !error);

  return {
    currentOrganisation: currentOrganisation || null,
    isLoading,
    error: getErrorMessage(error),
    setCurrentOrganisation,
    mutateCurrentOrganisation,
  };
};
