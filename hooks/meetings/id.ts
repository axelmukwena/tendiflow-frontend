"use client";

import useSWR, { useSWRConfig } from "swr";

import { getMeetingByIdFetcher } from "@/api/services/tendiflow/meetings/fetchers";
import {
  ApiActionMeeting,
  Meeting,
  UseMeeting,
} from "@/api/services/tendiflow/meetings/types";
import { getMeetingSwrUrlV1 } from "@/api/services/tendiflow/meetings/utilities";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { useUserCredentials } from "../profile/credentials";

interface UseMeetingByIdProps {
  meetingId?: string | null;
}

/**
 * Hook to get the meeting by ID
 * @param {UseMeetingByIdProps} props - The query to search the meetings
 * @returns {UseMeetings} The meetings
 */
export const useMeetingById = ({
  meetingId,
}: UseMeetingByIdProps): UseMeeting => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const { getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const fetcher = async (): Promise<Meeting | null> =>
    getMeetingByIdFetcher({
      id: meetingId,
      organisationId: currentOrganisation?.id,
      getIdToken,
    });

  const meetingSwrUrl = getMeetingSwrUrlV1({
    meeting_id: meetingId,
    organisation_id: currentOrganisation?.id || "",
    action: ApiActionMeeting.GET_BY_ID,
  });
  const { data, error, isLoading } = useSWR(meetingSwrUrl, fetcher);

  const mutateMeeting = (): void => {
    mutate(meetingSwrUrl);
  };

  return {
    meeting: data,
    isLoading,
    error: getErrorMessage(error),
    mutateMeeting,
  };
};
