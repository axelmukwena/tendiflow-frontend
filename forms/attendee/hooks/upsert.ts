"use client";

import { FormEvent, useState } from "react";

import { AttendeeService } from "@/api/services/tendiflow/attendees/service";
import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

import { getAttendeeCreateData, getAttendeeUpdateData } from "../data";
import { AttendeeFormSchema } from "../schema";
import { UseAttendeeForm } from "../types";

interface UseAttendeeCreateUpdateProps {
  attendeeForm: UseAttendeeForm;
  attendee?: Attendee | null;
  handleMutateAttendees: () => void;
  setCloseDialog?: () => void;
}

interface UseAttendeeCreateUpdate {
  isSubmitting: boolean;
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Combined hook to handle both attendee creation and updates
 * @param {UseAttendeeCreateUpdateProps} props - form hook, attendee (optional), and callback functions
 * @returns {UseAttendeeCreateUpdate} hook - object containing functions and states for attendee form submission
 */
export const useAttendeeCreateUpdate = ({
  attendeeForm,
  attendee,
  handleMutateAttendees,
  setCloseDialog,
}: UseAttendeeCreateUpdateProps): UseAttendeeCreateUpdate => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { getIdToken } = useUserCredentials();

  const {
    organisationId,
    hook: {
      handleSubmit,
      formState: { isValid },
    },
    updateForm,
  } = attendeeForm;

  const isEditMode = Boolean(attendee);

  /**
   * Function to handle creating a new attendee
   * @param {AttendeeFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleCreateAttendee = async (
    values: AttendeeFormSchema,
  ): Promise<void> => {
    const token = await getIdToken();
    const attendeeService = new AttendeeService(token);

    const data = getAttendeeCreateData({ values });
    const res = await attendeeService.register({
      organisation_id: organisationId,
      data,
    });

    if (res.success && res.data) {
      notify({
        message: "Attendee created successfully",
        type: "success",
      });
      handleMutateAttendees();
      if (setCloseDialog) {
        setCloseDialog();
      }
    } else {
      notify({ message: res.message, type: "error" });
    }
  };

  /**
   * Function to handle updating an existing attendee
   * @param {AttendeeFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleUpdateAttendee = async (
    values: AttendeeFormSchema,
  ): Promise<void> => {
    if (!attendee) {
      notify({
        type: "error",
        message: "Attendee not found.",
      });
      return;
    }

    const token = await getIdToken();
    const attendeeService = new AttendeeService(token);

    const data = getAttendeeUpdateData({ values });
    const res = await attendeeService.update({
      organisation_id: organisationId,
      id: attendee.id,
      data,
    });

    if (res.success && res.data) {
      notify({
        message: "Attendee updated successfully",
        type: "success",
      });
      updateForm(res.data);
      handleMutateAttendees();
      if (setCloseDialog) {
        setCloseDialog();
      }
    } else {
      notify({ message: res.message, type: "error" });
    }
  };

  /**
   * Main submit handler that routes to create or update based on mode
   * @param {AttendeeFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleSubmitAttendee = async (
    values: AttendeeFormSchema,
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
        await handleUpdateAttendee(values);
      } else {
        await handleCreateAttendee(values);
      }
    } catch (error) {
      notify({
        type: "error",
        message: `Failed to ${isEditMode ? "update" : "create"} attendee. Please try again.`,
      });
      console.error(
        `Attendee ${isEditMode ? "update" : "create"} error:`,
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
    await handleSubmit(handleSubmitAttendee)();
  };

  return {
    isSubmitting,
    handleOnSubmit,
  };
};
