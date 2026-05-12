"use client";

import { useState } from "react";

import { OrganisationService } from "@/api/services/tendiflow/organisations/service";
import { Organisation } from "@/api/services/tendiflow/organisations/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

interface UseOrganisationDeleteProps {
  organisation?: Organisation | null;
  handleMutateOrganisations: () => void;
}

interface UseOrganisationDelete {
  isSubmitting: boolean;
  handleDelete: () => Promise<void>;
}

/**
 * Hook to handle organisation database status form section
 * @param {UseOrganisationDeleteProps} props - form hook, organisation, and handleMutateOrganisations function
 * @returns {UseOrganisationDelete} hook - object containing functions and states for organisation costs form section
 */
export const useOrganisationDelete = ({
  organisation,
  handleMutateOrganisations,
}: UseOrganisationDeleteProps): UseOrganisationDelete => {
  const { getIdToken } = useUserCredentials();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    if (!organisation) {
      return;
    }

    setIsSubmitting(true);
    const token = await getIdToken();
    const service = new OrganisationService(token);
    const res = await service.delete({
      id: organisation.id,
    });
    if (res.success) {
      notify({
        message: "Organisation deleted successfully",
        type: "success",
      });
      handleMutateOrganisations();
    } else {
      notify({ message: res.message, type: "error" });
    }

    setIsSubmitting(false);
  };

  return { isSubmitting, handleDelete };
};
