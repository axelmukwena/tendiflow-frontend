import { Metadata } from "next";
import { FC } from "react";

import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";
import { getFormattedDateAndTimeInTimezone } from "@/utilities/helpers/date";
import { MeetingCheckInFlowView } from "@/views/flow";

import { fetchMeetingForMeta } from "./_meta";

type Params = Promise<{
  organisationId: string;
  meetingId: string;
}>;

interface CheckInPageProps {
  params: Params;
}

export async function generateMetadata({
  params,
}: CheckInPageProps): Promise<Metadata> {
  const { organisationId, meetingId } = await params;
  const meeting = await fetchMeetingForMeta(organisationId, meetingId);

  // Operational URL — never index even on the failure path.
  const robots = { index: false, follow: false };

  if (!meeting) {
    return { robots };
  }

  const title = `${meeting.title} — ${meeting.organisation_name}`;
  const dateText = getFormattedDateAndTimeInTimezone({
    utc: meeting.start_datetime,
    timezone: meeting.timezone,
  });
  const description = [dateText, meeting.address]
    .filter(Boolean)
    .join(" · ");
  const baseUrl = ENVIRONMENT_VARIABLES.NEXT_PUBLIC_SITE_BASE_URL.replace(
    /\/$/,
    "",
  );
  const url = `${baseUrl}/flow/${organisationId}/meetings/${meetingId}/checkin`;

  return {
    title,
    description,
    robots,
    openGraph: {
      type: "website",
      url,
      title,
      siteName: "Tendiflow",
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const CheckInPage: FC<CheckInPageProps> = async (props) => {
  const params = await props.params;
  return (
    <MeetingCheckInFlowView
      organisationId={params.organisationId}
      meetingId={params.meetingId}
    />
  );
};

export default CheckInPage;
