import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import { getAttendeesManyFetcher } from "@/api/services/tendiflow/attendees/fetchers";
import {
  ApiActionAttendee,
  Attendee,
  AttendeeParams,
  AttendeeQuery,
  AttendeesManyResponse,
} from "@/api/services/tendiflow/attendees/types";
import { getAttendeeSwrUrlV1 } from "@/api/services/tendiflow/attendees/utilities";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getErrorMessage } from "@/utilities/helpers/errors";

import { useUserCredentials } from "../profile/credentials";

interface UseAttendeeSearchProps {
  query: AttendeeQuery;
  limit?: number;
  enableInfiniteLoading?: boolean;
}

interface UseAttendeeSearch {
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
 * Hook to search attendees with infinite loading support
 * @param {UseAttendeeSearchProps} props - The query to search the attendees
 * @returns {UseAttendeeSearch} The attendees
 */
export const useAttendeeSearch = ({
  query,
  limit = 10,
  enableInfiniteLoading = false,
}: UseAttendeeSearchProps): UseAttendeeSearch => {
  const { currentOrganisation } = useCurrentOrganisationContext();
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

  const fetcher = async (): Promise<AttendeesManyResponse> =>
    getAttendeesManyFetcher({
      organisation_id: currentOrganisation?.id,
      getIdToken,
      query,
      params,
    });

  const attendeesSwrUrl = getAttendeeSwrUrlV1({
    organisation_id: currentOrganisation?.id || "",
    action: ApiActionAttendee.GET_FILTERED,
    query,
    params,
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
