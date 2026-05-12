import { HeaderKey } from "@/utilities/helpers/enums";
import { getErrorMessage } from "@/utilities/helpers/errors";

import {
  Attendee,
  AttendeeParams,
  AttendeeQuery,
  AttendeeUserStatistics,
  AttendeeUserStatisticsQuery,
} from "../attendees/types";
import { getCsrfToken } from "../oauth/fetchers";
import { DataServiceResponse } from "../types/general";
import { User } from "../users/types";
import { ProfileService } from "./service";
import { EmailVerificationRequestClient, SuccessResponse } from "./types";

interface GetUserFetcherProps {
  id?: string | null;
  getIdToken: () => Promise<string>;
  logout: () => Promise<void>;
}

/**
 * Fetches the current user.
 * @param {GetUserFetcherProps} props The fetcher props.
 * @returns {Promise<User | null>} The user.
 */
export const currentUserFetcher = async ({
  id,
  getIdToken,
  logout,
}: GetUserFetcherProps): Promise<User | null> => {
  if (!id) {
    return null;
  }
  const token = await getIdToken();
  const profileService = new ProfileService(token);
  const res = await profileService.getProfile();
  if (res.success && res.data) {
    return res.data;
  }
  if (res.statuscode === 401) {
    await logout();
  }

  throw new Error(res.message);
};

interface GetCurrentUserServerSideProps {
  token?: string | null;
}

/**
 * Fetches the current user including organisation info on the server side.
 * @param {GetCurrentUserServerSideProps} props The fetcher props.
 * @returns {Promise<CurrentUserDetails | null>} The current user.
 */
export const getCurrentUserServerSide = async ({
  token,
}: GetCurrentUserServerSideProps): Promise<User | null> => {
  if (!token) {
    return null;
  }
  try {
    const profileService = new ProfileService(token);
    const res = await profileService.getProfile();
    if (res.success && res.data) {
      return res.data;
    }
    console.error(res.message);
  } catch (error) {
    console.error(`Failed to fetch current user. ${getErrorMessage(error)}`);
  }
  return null;
};

interface EmailVerificationRequestProps {
  data: EmailVerificationRequestClient;
}

/**
 * Requests email verification for the current user.
 * @param {EmailVerificationRequestProps} props The request props.
 * @returns {Promise<SuccessResponse>} The success response.
 */
export const requestEmailVerification = async ({
  data,
}: EmailVerificationRequestProps): Promise<SuccessResponse> => {
  try {
    const headers = {
      [HeaderKey.CONTENT_TYPE]: "application/json",
      [HeaderKey.X_TENDIFLOW_CSRF_TOKEN]: await getCsrfToken(),
    };
    const res = await fetch("/api/profile/request-email-verification", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: `Failed to sign in with Google. ${getErrorMessage(error)}`,
    };
  }
};

interface GetAttendeeUserStatisticsFetcherProps {
  user_id?: string | null;
  query: AttendeeUserStatisticsQuery;
  getIdToken: () => Promise<string>;
}

/**
 * Fetches attendee statistics for the current user.
 * @param {GetAttendeeUserStatisticsFetcherProps} props The fetcher props.
 * @returns {Promise<AttendeeUserStatistics | null>} The statistics.
 */
export const getAttendeeUserStatisticsFetcher = async ({
  user_id,
  query,
  getIdToken,
}: GetAttendeeUserStatisticsFetcherProps): Promise<AttendeeUserStatistics | null> => {
  if (!user_id) {
    return null;
  }
  const token = await getIdToken();
  const profileService = new ProfileService(token);
  const res = await profileService.getAttendeeUserStatistics({
    user_id,
    query,
  });
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message);
};

interface GetManyAttendeeUserFetcherProps {
  getIdToken: () => Promise<string>;
  userId: string;
  query: AttendeeQuery;
  params: AttendeeParams;
}

/**
 * Fetcher function for attendee user search
 */
export const getManyAttendeeUserFetcher = async ({
  getIdToken,
  userId,
  query,
  params,
}: GetManyAttendeeUserFetcherProps): Promise<
  DataServiceResponse<Attendee[]>
> => {
  const token = await getIdToken();
  const profileService = new ProfileService(token);
  const res = await profileService.getManyAttendeeUsers({
    user_id: userId,
    query,
    params,
  });
  return res;
};
