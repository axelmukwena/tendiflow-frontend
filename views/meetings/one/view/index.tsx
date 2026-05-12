"use client";

import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import {
  ViewContent,
  ViewPageContent,
  ViewPageHeaderContainer,
  ViewPageTitle,
} from "@/components/ui/view";

import { MeetingActionsMenu } from "../actions-menu";
import { MeetingLeftSection } from "./left";
import { MeetingRightSection } from "./right";

interface MeetingPageContentProps {
  meeting: Meeting;
  handleMutateMeetings: () => void;
}

export const MeetingPageContent: FC<MeetingPageContentProps> = ({
  meeting,
  handleMutateMeetings,
}) => {
  return (
    <ViewPageContent>
      <ViewPageHeaderContainer>
        <ViewPageTitle>{meeting.title}</ViewPageTitle>
        <MeetingActionsMenu
          meeting={meeting}
          handleMutateMeetings={handleMutateMeetings}
          contentAlign="end"
          useDropdownMenu={false}
        />
      </ViewPageHeaderContainer>
      <ViewContent>
        <span className="sm:hidden">
          <MeetingRightSection meeting={meeting} />
        </span>
        <MeetingLeftSection meeting={meeting} />
        <span className="hidden sm:block w-2/5">
          <MeetingRightSection meeting={meeting} />
        </span>
      </ViewContent>
    </ViewPageContent>
  );
};
