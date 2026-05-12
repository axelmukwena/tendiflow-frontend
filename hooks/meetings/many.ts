import { useEffect, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";

import { getMeetingsFetcher } from "@/api/services/tendiflow/meetings/fetchers";
import {
  ApiActionMeeting,
  Meeting,
  MeetingParams,
  MeetingQuery,
  MeetingsManyResponse,
  MeetingSortBy,
} from "@/api/services/tendiflow/meetings/types";
import { getMeetingSwrUrlV1 } from "@/api/services/tendiflow/meetings/utilities";
import { DatabaseStatus, OrderBy } from "@/api/services/tendiflow/types/general";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getErrorMessage } from "@/utilities/helpers/errors";
import { notify } from "@/utilities/helpers/toaster";

import { useUserCredentials } from "../profile/credentials";

interface UseMeetingsMany {
  isLoading: boolean;
  meetings?: Meeting[] | null;
  count: number;
  handleMutateMeetings: () => void;
}

interface UseMeetingsManyProps {
  search?: string;
  databaseStatuses?: DatabaseStatus[];
  sortBy?: MeetingSortBy;
  orderBy?: OrderBy;
  limit: number;
  page: number;
  setTotal: (total: number) => void;
  handleMutateParent?: () => void;
}

export const useMeetingsMany = ({
  search,
  databaseStatuses,
  sortBy,
  orderBy,
  limit,
  page,
  setTotal,
  handleMutateParent,
}: UseMeetingsManyProps): UseMeetingsMany => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const { id: userId, getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const query: MeetingQuery = {
    search,
    database_statuses: databaseStatuses,
    sort_by: sortBy,
    order_by: orderBy,
  };

  const params: MeetingParams = {
    limit,
    skip: page * limit,
  };

  const fetcher = (): Promise<MeetingsManyResponse> =>
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

  const { data, isLoading, error } = useSWR(
    userId ? meetingsSwrUrl : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  );

  const { meetings, count } = useMemo(() => {
    if (!data || !data.success) {
      setTotal(0);
      return { meetings: [], count: 0 };
    }
    setTotal(data.total || 0);
    return {
      meetings: data.data,
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

  const handleMutateMeetings = (): void => {
    mutate(meetingsSwrUrl);
    if (handleMutateParent) {
      handleMutateParent();
    }
  };

  return {
    isLoading,
    meetings,
    count,
    handleMutateMeetings,
  };
};
