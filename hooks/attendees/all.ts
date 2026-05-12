import { useEffect, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";

import { getAttendeesAllFetcher } from "@/api/services/tendiflow/attendees/fetchers";
import {
  ApiActionAttendee,
  Attendee,
  AttendeeQuery,
  AttendeesManyResponse,
  AttendeeSortBy,
} from "@/api/services/tendiflow/attendees/types";
import { getAttendeeSwrUrlV1 } from "@/api/services/tendiflow/attendees/utilities";
import { DatabaseStatus, OrderBy } from "@/api/services/tendiflow/types/general";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getErrorMessage } from "@/utilities/helpers/errors";
import { notify } from "@/utilities/helpers/toaster";

import { useUserCredentials } from "../profile/credentials";

interface UseAttendeesAll {
  isLoading: boolean;
  attendees?: Attendee[] | null;
  count: number;
  handleMutateAttendees: () => void;
}

interface UseAttendeesAllProps {
  search?: string;
  meeting_ids: string[];
  databaseStatuses?: DatabaseStatus[];
  sortBy?: AttendeeSortBy;
  orderBy?: OrderBy;
  handleMutateParent?: () => void;
}

export const useAttendeesAll = ({
  search,
  meeting_ids,
  databaseStatuses,
  sortBy,
  orderBy,
  handleMutateParent,
}: UseAttendeesAllProps): UseAttendeesAll => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const { id: userId, getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const query: AttendeeQuery = {
    search,
    meeting_ids,
    database_statuses: databaseStatuses,
    sort_by: sortBy,
    order_by: orderBy,
  };

  const fetcher = (): Promise<AttendeesManyResponse> =>
    getAttendeesAllFetcher({
      organisation_id: currentOrganisation?.id,
      getIdToken,
      query,
      params: {},
    });

  const attendeesSwrUrl = getAttendeeSwrUrlV1({
    organisation_id: currentOrganisation?.id || "",
    action: ApiActionAttendee.GET_FILTERED,
    query,
    params: {},
  });

  const { data, isLoading, error } = useSWR(
    userId ? attendeesSwrUrl : null,
    fetcher,
  );

  const { attendees, count } = useMemo(() => {
    if (!data || !data.success) {
      return { attendees: [], count: 0 };
    }
    return {
      attendees: data.data,
      count: data?.data?.length || 0,
    };
  }, [data]);

  useEffect(() => {
    if (error) {
      notify({
        message: getErrorMessage(error),
        type: "error",
      });
    }
  }, [error]);

  const handleMutateAttendees = (): void => {
    mutate(attendeesSwrUrl);
    if (handleMutateParent) {
      handleMutateParent();
    }
  };

  return {
    isLoading,
    attendees,
    count,
    handleMutateAttendees,
  };
};
