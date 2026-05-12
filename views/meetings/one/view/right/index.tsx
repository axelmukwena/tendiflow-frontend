import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { DataDisplayContainer } from "@/components/data-display/container";
import { QrCodeDisplay } from "@/components/data-display/qrcode";
import { RightSectionContainer } from "@/components/ui/view";

interface MeetingRightSectionProps {
  meeting: Meeting;
}

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
          checkInUrl={meeting.check_in_url}
        />
      )}
    </DataDisplayContainer>
  </RightSectionContainer>
);
