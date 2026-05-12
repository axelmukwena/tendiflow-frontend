import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";

import {
  AttendeeUserStatistics,
  AttendeeUserStatisticsQuery,
} from "@/api/services/tendiflow/attendees/types";
import { getAttendeeUserStatisticsFetcher } from "@/api/services/tendiflow/profile/fetchers";
import { ApiActionProfile } from "@/api/services/tendiflow/profile/types";
import { getProfileSwrUrlV1 } from "@/api/services/tendiflow/profile/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";
import { notify } from "@/utilities/helpers/toaster";

import { useUserCredentials } from "../credentials";

interface UseAttendeeUserStatistics {
  isLoading: boolean;
  statistics?: AttendeeUserStatistics | null;
  handleMutateUserAttendeeStatistics: () => void;
}

interface UseAttendeeUserStatisticsProps {
  query?: AttendeeUserStatisticsQuery;
}

export const useAttendeeUserStatistics = ({
  query = {},
}: UseAttendeeUserStatisticsProps): UseAttendeeUserStatistics => {
  const { id: userId, getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();
  const fetcher = (): Promise<AttendeeUserStatistics | null> =>
    getAttendeeUserStatisticsFetcher({
      user_id: userId,
      query,
      getIdToken,
    });

  const swrUrl = getProfileSwrUrlV1({
    action: ApiActionProfile.MY_ATTENDANCE_STATISTICS,
    user_id: userId || "",
    query: JSON.stringify(query),
  });
  const { data, isLoading, error } = useSWR(swrUrl, fetcher);

  useEffect(() => {
    if (error) {
      notify({
        message: getErrorMessage(error),
        type: "error",
      });
    }
  }, [error]);

  const handleMutateAssets = (): void => {
    mutate(swrUrl);
  };

  return {
    isLoading,
    statistics: data || null,
    handleMutateUserAttendeeStatistics: handleMutateAssets,
  };
};
