import { MeetingService } from "./service";
import {
  Meeting,
  MeetingParams,
  MeetingQuery,
  MeetingsManyResponse,
} from "./types";

interface GetMeetingByIdFetcherProps {
  id?: string | null;
  organisationId?: string | null;
  getIdToken: () => Promise<string>;
}

/**
 * Fetches an meeting by ID.
 * @param {GetMeetingByIdFetcherProps} props The fetcher props.
 * @returns {Promise<Meeting | null>} The meeting.
 */
export const getMeetingByIdFetcher = async ({
  id,
  organisationId,
  getIdToken,
}: GetMeetingByIdFetcherProps): Promise<Meeting | null> => {
  if (!id || !organisationId) {
    return null;
  }
  const token = await getIdToken();
  const meetingService = new MeetingService(token);
  const res = await meetingService.getById({
    organisation_id: organisationId,
    id,
  });
  if (res.success) {
    return res.data || null;
  }
  throw new Error(res.message);
};

interface GetManyMeetingsFetcherProps {
  organisation_id?: string | null;
  params: MeetingParams;
  query: MeetingQuery;
  getIdToken: () => Promise<string>;
  requireIdsOrSearch?: boolean;
}

/**
 * Fetches many meetings.
 * @param {GetManyMeetingsFetcherProps} props The fetcher props.
 * @returns {Promise<MeetingsManyResponse>} The meetings.
 */
export const getMeetingsFetcher = async ({
  organisation_id,
  params,
  query,
  getIdToken,
  requireIdsOrSearch,
}: GetManyMeetingsFetcherProps): Promise<MeetingsManyResponse> => {
  if (!organisation_id) {
    return null;
  }
  if (requireIdsOrSearch && !query.ids?.length && !query.search) {
    return null;
  }
  const token = await getIdToken();
  const meetingService = new MeetingService(token);
  const res = await meetingService.getManyFiltered({
    organisation_id: organisation_id,
    query,
    params,
  });
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
};
