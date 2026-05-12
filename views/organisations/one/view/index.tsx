"use client";

import { FC } from "react";

import { Organisation } from "@/api/services/tendiflow/organisations/types";
import {
  ViewContent,
  ViewPageContent,
  ViewPageHeaderContainer,
  ViewPageTitle,
} from "@/components/ui/view";

import { OrganisationActionsMenu } from "../actions-menu";
import { OrganisationLeftSection } from "./left";
import { OrganisationRightSection } from "./right";

interface OrganisationPageContentProps {
  organisation?: Organisation | null;
  handleMutateOrganisations: () => void;
}

export const OrganisationPageContent: FC<OrganisationPageContentProps> = ({
  organisation,
  handleMutateOrganisations,
}) => {
  if (!organisation) {
    return null;
  }

  return (
    <ViewPageContent>
      <ViewPageHeaderContainer>
        <ViewPageTitle>{organisation.name}</ViewPageTitle>
        <OrganisationActionsMenu
          organisation={organisation}
          handleMutateOrganisations={handleMutateOrganisations}
          contentAlign="end"
          useDropdownMenu={false}
        />
      </ViewPageHeaderContainer>
      <ViewContent>
        <OrganisationLeftSection />
        <OrganisationRightSection />
      </ViewContent>
    </ViewPageContent>
  );
};
