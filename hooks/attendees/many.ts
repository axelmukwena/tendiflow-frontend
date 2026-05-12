import { useEffect, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";

import { getAttendeesManyFetcher } from "@/api/services/tendiflow/attendees/fetchers";
import {
  ApiActionAttendee,
  Attendee,
  AttendeeParams,
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

interface UseAttendeesMany {
  isLoading: boolean;
  attendees?: Attendee[] | null;
  count: number;
  handleMutateAttendees: () => void;
}

interface UseAttendeesManyProps {
  search?: string;
  meeting_ids: string[];
  databaseStatuses?: DatabaseStatus[];
  sortBy?: AttendeeSortBy;
  orderBy?: OrderBy;
  limit: number;
  page: number;
  setTotal: (total: number) => void;
  handleMutateParent?: () => void;
}

export const useAttendeesMany = ({
  search,
  meeting_ids,
  databaseStatuses,
  sortBy,
  orderBy,
  limit,
  page,
  setTotal,
  handleMutateParent,
}: UseAttendeesManyProps): UseAttendeesMany => {
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

  const params: AttendeeParams = {
    limit,
    skip: page * limit,
  };

  const fetcher = (): Promise<AttendeesManyResponse> =>
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

  const { data, isLoading, error } = useSWR(
    userId ? attendeesSwrUrl : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  );

  const { attendees, count } = useMemo(() => {
    if (!data || !data.success) {
      setTotal(0);
      return { attendees: [], count: 0 };
    }
    setTotal(data.total || 0);
    return {
      attendees: data.data,
      count: data?.data?.length || 0,
    };
  }, [data, setTotal]);

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
