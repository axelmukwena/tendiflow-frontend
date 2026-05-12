import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import { getMeetingsFetcher } from "@/api/services/tendiflow/meetings/fetchers";
import {
  ApiActionMeeting,
  Meeting,
  MeetingParams,
  MeetingQuery,
  MeetingsManyResponse,
} from "@/api/services/tendiflow/meetings/types";
import { getMeetingSwrUrlV1 } from "@/api/services/tendiflow/meetings/utilities";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { useUserCredentials } from "../profile/credentials";

interface UseMeetingSearchProps {
  query: MeetingQuery;
  limit?: number;
  enableInfiniteLoading?: boolean;
}

interface UseMeetingSearch {
  meetings: Meeting[];
  isLoading: boolean;
  error: string;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  isLoadingMore: boolean;
  handleMutateMeetings: () => void;
  reset: () => void;
}

/**
 * Hook to search meetings with infinite loading support
 * @param {UseMeetingSearchProps} props - The query to search the meetings
 * @returns {UseMeetingSearch} The meetings
 */
export const useMeetingSearch = ({
  query,
  limit = 10,
  enableInfiniteLoading = false,
}: UseMeetingSearchProps): UseMeetingSearch => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const { id: userId, getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const params: MeetingParams = {
    limit,
    skip: currentSkip,
  };

  const fetcher = async (): Promise<MeetingsManyResponse> =>
    getMeetingsFetcher({
      organisation_id: currentOrganisation?.id,
      getIdToken,
      query,
      params,
    });

  const meetingsSwrUrl = getMeetingSwrUrlV1({
    organisation_id: currentOrganisation?.id || "",
    action: ApiActionMeeting.GET_FILTERED,
    query,
    params,
  });

  const { data, error, isLoading } = useSWR(
    userId ? meetingsSwrUrl : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  );

  useEffect(() => {
    if (data?.success && data.data) {
      const newData = data.data;

      if (currentSkip === 0) {
        // First load or reset - replace all data
        setAllMeetings(newData);
      } else {
        // Infinite loading - append new data, but check for duplicates
        setAllMeetings((prev) => {
          // Create a Set of existing IDs to prevent duplicates
          const existingIds = new Set(prev.map((item) => item.id));
          const uniqueNewData = newData.filter(
            (item) => !existingIds.has(item.id),
          );

          return [...prev, ...uniqueNewData];
        });
      }

      setTotal(data.total || 0);
      setIsLoadingMore(false);
    }
  }, [data, currentSkip]);

  const hasMore = useMemo(
    () => enableInfiniteLoading && allMeetings.length < total && total > 0,
    [enableInfiniteLoading, allMeetings.length, total],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    setCurrentSkip((prev) => prev + limit);
  }, [hasMore, isLoadingMore, isLoading, limit]);

  const reset = useCallback(() => {
    setCurrentSkip(0);
    setAllMeetings([]);
    setTotal(0);
    setIsLoadingMore(false);
    // Clear SWR cache for this query
    mutate(meetingsSwrUrl, undefined, { revalidate: false });
  }, [mutate, meetingsSwrUrl]);

  const handleMutateMeetings = useCallback((): void => {
    reset();
    // Revalidate the current request
    mutate(meetingsSwrUrl);
  }, [mutate, meetingsSwrUrl, reset]);

  const finalMeetings = enableInfiniteLoading ? allMeetings : data?.data || [];

  return {
    meetings: finalMeetings,
    isLoading,
    error: getErrorMessage(error),
    hasMore,
    total,
    loadMore,
    isLoadingMore,
    handleMutateMeetings,
    reset,
  };
};
