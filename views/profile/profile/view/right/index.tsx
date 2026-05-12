import { FC } from "react";

import { RightSectionContainer } from "@/components/ui/view";

import { ProfileSessionView } from "./view";

interface ProfileRightSectionProps {}

export const ProfileRightSection: FC<ProfileRightSectionProps> = () => (
  <RightSectionContainer>
    <ProfileSessionView />
  </RightSectionContainer>
);
