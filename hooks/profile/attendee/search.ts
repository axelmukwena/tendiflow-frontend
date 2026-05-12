import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import {
  Attendee,
  AttendeeParams,
  AttendeeQuery,
} from "@/api/services/tendiflow/attendees/types";
import { getManyAttendeeUserFetcher } from "@/api/services/tendiflow/profile/fetchers";
import { ApiActionProfile } from "@/api/services/tendiflow/profile/types";
import { getProfileSwrUrlV1 } from "@/api/services/tendiflow/profile/utilities";
import { DataServiceResponse } from "@/api/services/tendiflow/types/general";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { useUserCredentials } from "../credentials";

interface UseAttendeeUserSearchProps {
  query: AttendeeQuery;
  limit?: number;
  enableInfiniteLoading?: boolean;
}

interface UseAttendeeUserSearch {
  attendees: Attendee[];
  isLoading: boolean;
  error: string;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  isLoadingMore: boolean;
  handleMutateAttendees: () => void;
  reset: () => void;
}

/**
 * Hook to search user's attendances with infinite loading support
 * @param {UseAttendeeUserSearchProps} props - The query to search the attendees
 * @returns {UseAttendeeUserSearch} The attendees
 */
export const useAttendeeUserSearch = ({
  query,
  limit = 10,
  enableInfiniteLoading = false,
}: UseAttendeeUserSearchProps): UseAttendeeUserSearch => {
  const { id: userId, getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const [allAttendees, setAllAttendees] = useState<Attendee[]>([]);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const params: AttendeeParams = {
    limit,
    skip: currentSkip,
  };

  const fetcher = async (): Promise<DataServiceResponse<Attendee[]>> =>
    getManyAttendeeUserFetcher({
      getIdToken,
      userId: userId!,
      query,
      params,
    });

  const attendeesSwrUrl = getProfileSwrUrlV1({
    action: ApiActionProfile.MY_ATTENDANCES,
    user_id: userId || "",
    query: JSON.stringify(query) + JSON.stringify(params),
  });

  const { data, error, isLoading } = useSWR(
    userId ? attendeesSwrUrl : null,
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
        setAllAttendees(newData);
      } else {
        // Infinite loading - append new data, but check for duplicates
        setAllAttendees((prev) => {
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
    () => enableInfiniteLoading && allAttendees.length < total && total > 0,
    [enableInfiniteLoading, allAttendees.length, total],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    setCurrentSkip((prev) => prev + limit);
  }, [hasMore, isLoadingMore, isLoading, limit]);

  const reset = useCallback(() => {
    setCurrentSkip(0);
    setAllAttendees([]);
    setTotal(0);
    setIsLoadingMore(false);
    // Clear SWR cache for this query
    mutate(attendeesSwrUrl, undefined, { revalidate: false });
  }, [mutate, attendeesSwrUrl]);

  const handleMutateAttendees = useCallback((): void => {
    reset();
    // Revalidate the current request
    mutate(attendeesSwrUrl);
  }, [mutate, attendeesSwrUrl, reset]);

  const finalAttendees = enableInfiniteLoading
    ? allAttendees
    : data?.data || [];

  return {
    attendees: finalAttendees,
    isLoading,
    error: getErrorMessage(error),
    hasMore,
    total,
    loadMore,
    isLoadingMore,
    handleMutateAttendees,
    reset,
  };
};
