"use client";

import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { LeftSectionContainer } from "@/components/ui/view";

import { MeetingContentView } from "./view";

interface MeetingLeftSectionProps {
  meeting: Meeting;
}

export const MeetingLeftSection: FC<MeetingLeftSectionProps> = ({
  meeting,
}) => (
  <LeftSectionContainer className="gap-3">
    <MeetingContentView meeting={meeting} />
  </LeftSectionContainer>
);
