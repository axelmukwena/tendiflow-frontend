import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { getAttendeeUserFetcher } from "@/api/services/tendiflow/profile/fetchers";
import { ApiActionProfile } from "@/api/services/tendiflow/profile/types";
import { getProfileSwrUrlV1 } from "@/api/services/tendiflow/profile/utilities";
import { getErrorMessage } from "@/utilities/helpers/errors";
import { notify } from "@/utilities/helpers/toaster";

import { useUserCredentials } from "../credentials";

interface UseAttendeeUser {
  isLoading: boolean;
  attendee: Attendee | null;
  error: string;
  handleMutateAttendee: () => void;
}

interface UseAttendeeUserProps {
  attendanceId?: string | null;
}

export const useAttendeeUser = ({
  attendanceId,
}: UseAttendeeUserProps): UseAttendeeUser => {
  const { id: userId, getIdToken } = useUserCredentials();
  const { mutate } = useSWRConfig();

  const swrUrl =
    userId && attendanceId
      ? getProfileSwrUrlV1({
          action: ApiActionProfile.MY_ATTENDANCE,
          user_id: userId,
          attendance_id: attendanceId,
        })
      : null;

  const fetcher = (): Promise<Attendee | null> =>
    getAttendeeUserFetcher({
      user_id: userId,
      attendance_id: attendanceId,
      getIdToken,
    });

  const { data, isLoading, error } = useSWR(swrUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  useEffect(() => {
    if (error) {
      notify({ message: getErrorMessage(error), type: "error" });
    }
  }, [error]);

  const handleMutateAttendee = (): void => {
    if (swrUrl) {
      mutate(swrUrl);
    }
  };

  return {
    isLoading,
    attendee: data ?? null,
    error: error ? getErrorMessage(error) : "",
    handleMutateAttendee,
  };
};
