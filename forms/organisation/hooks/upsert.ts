"use client";

import { FormEvent, useState } from "react";

import { OrganisationService } from "@/api/services/tendiflow/organisations/service";
import { Organisation } from "@/api/services/tendiflow/organisations/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

import { getOrganisationCreateData, getOrganisationUpdateData } from "../data";
import { OrganisationFormSchema } from "../schema";
import { UseOrganisationForm } from "../types";

interface UseOrganisationCreateUpdateProps {
  organisationForm: UseOrganisationForm;
  organisation?: Organisation | null;
  handleMutateOrganisations: () => void;
  setCloseDialog?: () => void;
}

interface UseOrganisationCreateUpdate {
  isSubmitting: boolean;
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Combined hook to handle both organisation creation and updates
 * @param {UseOrganisationCreateUpdateProps} props - form hook, organisation (optional), and callback functions
 * @returns {UseOrganisationCreateUpdate} hook - object containing functions and states for organisation form submission
 */
export const useOrganisationCreateUpdate = ({
  organisationForm,
  organisation,
  handleMutateOrganisations,
  setCloseDialog,
}: UseOrganisationCreateUpdateProps): UseOrganisationCreateUpdate => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { getIdToken } = useUserCredentials();

  const {
    hook: {
      handleSubmit,
      formState: { isValid },
    },
    updateForm,
  } = organisationForm;

  const isEditMode = Boolean(organisation);

  /**
   * Function to handle creating a new organisation
   * @param {OrganisationFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleCreateOrganisation = async (
    values: OrganisationFormSchema,
  ): Promise<void> => {
    const token = await getIdToken();
    const organisationService = new OrganisationService(token);

    const data = getOrganisationCreateData({ values });
    const res = await organisationService.create({ data });

    if (res.success && res.data) {
      notify({
        message: "Organisation created successfully",
        type: "success",
      });
      handleMutateOrganisations();
      if (setCloseDialog) {
        setCloseDialog();
      }
      window.location.reload();
    } else {
      notify({ message: res.message, type: "error" });
    }
  };

  /**
   * Function to handle updating an existing organisation
   * @param {OrganisationFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleUpdateOrganisation = async (
    values: OrganisationFormSchema,
  ): Promise<void> => {
    if (!organisation) {
      notify({
        type: "error",
        message: "Organisation not found.",
      });
      return;
    }

    const token = await getIdToken();
    const organisationService = new OrganisationService(token);

    const data = getOrganisationUpdateData({ values });
    const res = await organisationService.update({ id: organisation.id, data });

    if (res.success && res.data) {
      notify({
        message: "Organisation updated successfully",
        type: "success",
      });
      updateForm(res.data);
      handleMutateOrganisations();
      if (setCloseDialog) {
        setCloseDialog();
      }
    } else {
      notify({ message: res.message, type: "error" });
    }
  };

  /**
   * Main submit handler that routes to create or update based on mode
   * @param {OrganisationFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleSubmitOrganisation = async (
    values: OrganisationFormSchema,
  ): Promise<void> => {
    if (!isValid) {
      notify({
        type: "error",
        message:
          "One or more form fields are invalid. Please check all fields and try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await handleUpdateOrganisation(values);
      } else {
        await handleCreateOrganisation(values);
      }
    } catch (error) {
      notify({
        type: "error",
        message: `Failed to ${isEditMode ? "update" : "create"} organisation. Please try again.`,
      });
      console.error(
        `Organisation ${isEditMode ? "update" : "create"} error:`,
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.stopPropagation();
    e.preventDefault();
    await handleSubmit(handleSubmitOrganisation)();
  };

  return {
    isSubmitting,
    handleOnSubmit,
  };
};
