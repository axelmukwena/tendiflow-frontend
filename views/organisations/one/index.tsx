"use client";

import { FC, Fragment } from "react";

import { Organisation } from "@/api/services/tendiflow/organisations/types";

import { OrganisationHeader } from "./header";
import { OrganisationPageContent } from "./view";

interface OrganisationViewProps {
  organisation?: Organisation | null;
  handleMutateOrganisations: () => void;
}

export const OrganisationView: FC<OrganisationViewProps> = ({
  organisation,
  handleMutateOrganisations,
}) => {
  return (
    <Fragment>
      <OrganisationHeader />
      <OrganisationPageContent
        organisation={organisation}
        handleMutateOrganisations={handleMutateOrganisations}
      />
    </Fragment>
  );
};
