"use client";

import { FC, Fragment } from "react";

import { ProfileAttendeeOneHeader } from "./breadcrumb";
import { ProfileAttendeeOneContent } from "./content";

interface ProfileAttendeeOneViewProps {
  attendeeId: string;
}

export const ProfileAttendeeOneView: FC<ProfileAttendeeOneViewProps> = ({
  attendeeId,
}) => (
  <Fragment>
    <ProfileAttendeeOneHeader />
    <div className="flex flex-col gap-6">
      <ProfileAttendeeOneContent attendeeId={attendeeId} />
    </div>
  </Fragment>
);
