import { AttendeeService } from "./service";
import {
  Attendee,
  AttendeeParams,
  AttendeeQuery,
  AttendeesManyResponse,
} from "./types";

interface GetAttendeeByIdFetcherProps {
  id?: string | null;
  organisationId?: string | null;
  getIdToken: () => Promise<string>;
}

/**
 * Fetches an attendee by ID.
 * @param {GetAttendeeByIdFetcherProps} props The fetcher props.
 * @returns {Promise<Attendee | null>} The attendee.
 */
export const getAttendeeByIdFetcher = async ({
  id,
  organisationId,
  getIdToken,
}: GetAttendeeByIdFetcherProps): Promise<Attendee | null> => {
  if (!id || !organisationId) {
    return null;
  }
  const token = await getIdToken();
  const attendeeService = new AttendeeService(token);
  const res = await attendeeService.getById({
    organisation_id: organisationId,
    id,
  });
  if (res.success) {
    return res.data || null;
  }
  throw new Error(res.message);
};

interface GetManyAttendeesFetcherProps {
  organisation_id?: string | null;
  params: AttendeeParams;
  query: AttendeeQuery;
  getIdToken: () => Promise<string>;
  requireIdsOrSearch?: boolean;
}

/**
 * Fetches many attendees.
 * @param {GetManyAttendeesFetcherProps} props The fetcher props.
 * @returns {Promise<AttendeesManyResponse>} The attendees.
 */
export const getAttendeesManyFetcher = async ({
  organisation_id,
  params,
  query,
  getIdToken,
  requireIdsOrSearch,
}: GetManyAttendeesFetcherProps): Promise<AttendeesManyResponse> => {
  if (!organisation_id) {
    return null;
  }
  if (requireIdsOrSearch && !query.ids?.length && !query.search) {
    return null;
  }
  const token = await getIdToken();
  const attendeeService = new AttendeeService(token);
  const res = await attendeeService.getManyFiltered({
    organisation_id: organisation_id,
    query,
    params,
  });
  if (res.success) {
    return res;
  }
  throw new Error(res.message);
};

/**
 * Fetches all attendees across pages.
 * @param {GetManyAttendeesFetcherProps} props The fetcher props.
 * @returns {Promise<AttendeesManyResponse>} The attendees.
 */
export const getAttendeesAllFetcher = async ({
  organisation_id,
  query,
  getIdToken,
  requireIdsOrSearch,
}: GetManyAttendeesFetcherProps): Promise<AttendeesManyResponse> => {
  let allAttendees: Attendee[] = [];
  let currentPage = 0;
  let totalCount = 0;
  const limit = 100;
  do {
    const response = await getAttendeesManyFetcher({
      organisation_id,
      params: { skip: currentPage * limit },
      query,
      getIdToken,
      requireIdsOrSearch,
    });

    if (response && response.data) {
      allAttendees = allAttendees.concat(response.data);
      totalCount = response.total || 0;
    } else {
      break; // No more attendees to fetch
    }

    currentPage++;
  } while (allAttendees.length < totalCount);

  return {
    success: true,
    data: allAttendees,
    total: totalCount,
    message: "Fetched all attendees successfully",
  };
};
