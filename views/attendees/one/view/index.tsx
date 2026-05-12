"use client";

import { FC } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import {
  ViewContent,
  ViewPageContent,
  ViewPageHeaderContainer,
  ViewPageTitle,
} from "@/components/ui/view";

import { AttendeeActionsMenu } from "../actions-menu";
import { AttendeeLeftSection } from "./left";
import { AttendeeRightSection } from "./right";

interface AttendeePageContentProps {
  attendee: Attendee;
  handleMutateAttendees: () => void;
}

export const AttendeePageContent: FC<AttendeePageContentProps> = ({
  attendee,
  handleMutateAttendees,
}) => {
  return (
    <ViewPageContent>
      <ViewPageHeaderContainer>
        <ViewPageTitle>
          {attendee.first_name} {attendee.last_name}
        </ViewPageTitle>
        <AttendeeActionsMenu
          attendee={attendee}
          handleMutateAttendees={handleMutateAttendees}
          contentAlign="end"
          useDropdownMenu={false}
        />
      </ViewPageHeaderContainer>
      <ViewContent>
        <AttendeeLeftSection attendee={attendee} />
        <AttendeeRightSection />
      </ViewContent>
    </ViewPageContent>
  );
};
