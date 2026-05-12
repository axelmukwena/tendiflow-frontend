"use client";

import { useState } from "react";

import { OrganisationService } from "@/api/services/tendiflow/organisations/service";
import { Organisation } from "@/api/services/tendiflow/organisations/types";
import { DatabaseStatus } from "@/api/services/tendiflow/types/general";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

interface UseOrganisationDatabaseStatusProps {
  organisation?: Organisation | null;
  handleMutateOrganisations: () => void;
}

interface UseOrganisationDatabaseStatus {
  isSubmitting: boolean;
  handleUpdateDatabaseStatus: (status: DatabaseStatus) => Promise<void>;
}

/**
 * Hook to handle organisation database status form section
 * @param {UseOrganisationDatabaseStatusProps} props - form hook, organisation, and handleMutateOrganisations function
 * @returns {UseOrganisationDatabaseStatus} hook - object containing functions and states for organisation costs form section
 */
export const useOrganisationDatabaseStatus = ({
  organisation,
  handleMutateOrganisations,
}: UseOrganisationDatabaseStatusProps): UseOrganisationDatabaseStatus => {
  const { getIdToken } = useUserCredentials();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUpdateDatabaseStatus = async (
    status: DatabaseStatus,
  ): Promise<void> => {
    if (!organisation) {
      return;
    }

    setIsSubmitting(true);
    const token = await getIdToken();
    const service = new OrganisationService(token);
    const res = await service.updateDatabaseStatus({
      id: organisation.id,
      data: { database_status: status },
    });
    if (res.success) {
      notify({
        message: "Organisation Database Status updated successfully",
        type: "success",
      });
      handleMutateOrganisations();
    } else {
      notify({ message: res.message, type: "error" });
    }

    setIsSubmitting(false);
  };

  return { isSubmitting, handleUpdateDatabaseStatus };
};
