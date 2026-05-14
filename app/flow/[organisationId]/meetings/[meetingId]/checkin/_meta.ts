// Underscore prefix marks this as a private module Next.js will not expose as a route.
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";

export interface MeetingForMeta {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  address: string | null;
  organisation_name: string;
}

type PublicMeetingResponse = Pick<
  Meeting,
  "id" | "title" | "start_datetime" | "end_datetime" | "timezone" | "address" | "organisation"
>;

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
    const meeting = (await res.json()) as PublicMeetingResponse;
    return {
      id: meeting.id,
      title: meeting.title,
      start_datetime: meeting.start_datetime,
      end_datetime: meeting.end_datetime,
      timezone: meeting.timezone,
      address: meeting.address,
      organisation_name: meeting.organisation?.name ?? "Tendiflow",
    };
  } catch (err) {
    console.error("[fetchMeetingForMeta] fetch failed:", err);
    return null;
  }
}
