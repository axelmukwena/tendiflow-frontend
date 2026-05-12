"use client";

import { FC } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { LeftSectionContainer } from "@/components/ui/view";

import { AttendeeContentView } from "./view";

interface AttendeeLeftSectionProps {
  attendee: Attendee;
}

export const AttendeeLeftSection: FC<AttendeeLeftSectionProps> = ({
  attendee,
}) => (
  <LeftSectionContainer className="gap-3">
    <AttendeeContentView attendee={attendee} />
  </LeftSectionContainer>
);
