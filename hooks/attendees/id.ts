"use client";

import useSWR, { useSWRConfig } from "swr";

import { getAttendeeByIdFetcher } from "@/api/services/tendiflow/attendees/fetchers";
import {
  ApiActionAttendee,
  Attendee,
  UseAttendee,
} from "@/api/services/tendiflow/attendees/types";
import { getAttendeeSwrUrlV1 } from "@/api/services/tendiflow/attendees/utilities";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { useUserCredentials } from "../profile/credentials";

interface UseAttendeeByIdProps {
  attendeeId?: string | null;
}

/**
 * Hook to get the attendee by ID
 * @param {UseAttendeeByIdProps} props - The query to search the attendees
 * @returns {UseAttendees} The attendees
 */
export const useAttendeeById = ({
  attendeeId,
}: UseAttendeeByIdProps): UseAttendee => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const { getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const fetcher = async (): Promise<Attendee | null> =>
    getAttendeeByIdFetcher({
      id: attendeeId,
      organisationId: currentOrganisation?.id,
      getIdToken,
    });

  const attendeeSwrUrl = getAttendeeSwrUrlV1({
    attendee_id: attendeeId,
    organisation_id: currentOrganisation?.id || "",
    action: ApiActionAttendee.GET_BY_ID,
  });
  const { data, error, isLoading } = useSWR(attendeeSwrUrl, fetcher);

  const mutateAttendee = (): void => {
    mutate(attendeeSwrUrl);
  };

  return {
    attendee: data,
    isLoading,
    error: getErrorMessage(error),
    mutateAttendee,
  };
};
