"use client";

import { FC, Fragment } from "react";

import { User } from "@/api/services/tendiflow/users/types";

import { ProfileHeader } from "./header";
import { ProfilePageContent } from "./view";

interface ProfileViewProps {
  profile?: User | null;
  handleMutateProfiles: () => void;
}

export const ProfileView: FC<ProfileViewProps> = ({
  profile,
  handleMutateProfiles,
}) => {
  return (
    <Fragment>
      <ProfileHeader />
      <ProfilePageContent
        profile={profile}
        handleMutateProfiles={handleMutateProfiles}
      />
    </Fragment>
  );
};
