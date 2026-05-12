"use client";

import { User as UserIcon } from "lucide-react";
import { FC } from "react";

import { User } from "@/api/services/tendiflow/users/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ViewContent,
  ViewPageContent,
  ViewPageHeaderContainer,
} from "@/components/ui/view";

import { ProfileActionsMenu } from "../actions-menu";
import { ProfileLeftSection } from "./left";
import { ProfileRightSection } from "./right";

interface ProfilePageContentProps {
  profile?: User | null;
  handleMutateProfiles: () => void;
}

export const ProfilePageContent: FC<ProfilePageContentProps> = ({
  profile,
  handleMutateProfiles,
}) => {
  if (!profile) {
    return null;
  }

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ");
  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`;

  return (
    <ViewPageContent>
      <ViewPageHeaderContainer>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || ""} alt={fullName} />
            <AvatarFallback className="text-xl">
              {initials || <UserIcon />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{fullName}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>
        <ProfileActionsMenu
          profile={profile}
          handleMutateProfiles={handleMutateProfiles}
          contentAlign="end"
          useDropdownMenu={false}
        />
      </ViewPageHeaderContainer>
      <ViewContent>
        <ProfileLeftSection />
        <ProfileRightSection />
      </ViewContent>
    </ViewPageContent>
  );
};
