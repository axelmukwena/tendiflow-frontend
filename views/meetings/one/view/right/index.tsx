import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { DataDisplayContainer } from "@/components/data-display/container";
import { QrCodeDisplay } from "@/components/data-display/qrcode";
import { RightSectionContainer } from "@/components/ui/view";

interface MeetingRightSectionProps {
  meeting: Meeting;
}

// Append a version stamp tied to the meeting's last-write time. Chat apps
// (WhatsApp in particular) cache OG previews per URL for days/weeks with no
// public flush tool; bumping the query string forces a fresh fetch the next
// time someone shares the link after an edit. The check-in page ignores `v`.
const buildShareableCheckInUrl = (meeting: Meeting): string | null => {
  if (!meeting.check_in_url) return null;
  const stamp = meeting.updated_at ?? meeting.created_at;
  if (!stamp) return meeting.check_in_url;
  const version = Date.parse(stamp);
  if (Number.isNaN(version)) return meeting.check_in_url;
  const separator = meeting.check_in_url.includes("?") ? "&" : "?";
  return `${meeting.check_in_url}${separator}v=${version}`;
};

export const MeetingRightSection: FC<MeetingRightSectionProps> = ({
  meeting,
}) => (
  <RightSectionContainer className="md:w-full">
    <DataDisplayContainer
      title="Check-in & Access"
      description="Use the QR code for quick meeting access and check-in."
      className="mb-8"
    >
      {meeting.qrcode && (
        <QrCodeDisplay
          label="QR Code"
          caption="Scan for easy meeting access and attendance tracking."
          qrcode={meeting.qrcode}
          checkInUrl={buildShareableCheckInUrl(meeting)}
        />
      )}
    </DataDisplayContainer>
  </RightSectionContainer>
);
