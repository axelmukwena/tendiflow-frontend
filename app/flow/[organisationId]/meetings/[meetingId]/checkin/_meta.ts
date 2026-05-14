import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";

export interface MeetingForMeta {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  address: string | null;
  organisation_name: string;
}

interface BackendMeetingResponse {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  address: string | null;
  organisation?: { name?: string | null } | null;
}

/**
 * Server-side fetch of the public meeting record used by both
 * generateMetadata and opengraph-image.tsx. Cached for 5 min via
 * Next's fetch cache so a flurry of unfurler hits doesn't hammer
 * the backend. Returns null on any failure — callers fall back to
 * generic metadata / a placeholder OG image rather than 5xx-ing.
 */
export async function fetchMeetingForMeta(
  organisationId: string,
  meetingId: string,
): Promise<MeetingForMeta | null> {
  try {
    const url =
      `${ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_BASE_URL}` +
      `/api/v1/organisations/${organisationId}` +
      `/meetings/${meetingId}/public`;
    const res = await fetch(url, {
      headers: { "x-api-key": ENVIRONMENT_VARIABLES.API_KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const meeting = (await res.json()) as BackendMeetingResponse;
    return {
      id: meeting.id,
      title: meeting.title,
      start_datetime: meeting.start_datetime,
      end_datetime: meeting.end_datetime,
      address: meeting.address ?? null,
      organisation_name: meeting.organisation?.name ?? "Tendiflow",
    };
  } catch {
    return null;
  }
}
