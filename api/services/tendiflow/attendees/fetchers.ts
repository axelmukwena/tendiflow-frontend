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
  // Backend caps `limit` at 100 (AttendeeParams.limit). Must be passed
  // explicitly in `params` — relying on the backend default of 20 while
  // advancing skip in steps of 100 silently drops 80 records per page
  // and never converges on `totalCount`, leading to an infinite loop of
  // empty fetches that masquerades as a timeout.
  const limit = 100;
  do {
    const response = await getAttendeesManyFetcher({
      organisation_id,
      params: { skip: currentPage * limit, limit },
      query,
      getIdToken,
      requireIdsOrSearch,
    });

    if (!response || !response.data) {
      break;
    }
    allAttendees = allAttendees.concat(response.data);
    totalCount = response.total || 0;
    // Defensive: stop if the page returned nothing, in case totalCount
    // and the actual rowcount disagree (e.g. records deleted mid-export).
    if (response.data.length === 0) {
      break;
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
