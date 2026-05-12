"use client";

import { useState } from "react";

import { Attendee } from "@/api/services/weaver/attendees/types";
import { useGuestAttendee } from "@/hooks/attendees/guest";
import { getErrorMessage } from "@/utilities/helpers/errors";
import { notify } from "@/utilities/helpers/toaster";

import {
  getGuestAttendeeCreateData,
  getGuestAttendeeUpdateData,
} from "../data";
import { AttendeeFormSchema } from "../schema";
import { UseAttendeeForm } from "../types";

interface UseGuestAttendeeCreateUpdateProps {
  attendeeForm: UseAttendeeForm;
  organisationId: string;
  attendee?: Attendee | null;
  onSuccess?: (attendee: Attendee) => void;
  /**
   * `statuscode` is the HTTP status from the backend (forwarded through
   * the Next.js proxy). The caller can use it to disambiguate e.g.
   * 409 "already checked in" from a generic error.
   */
  onError?: (error: string, statuscode?: number) => void;
}

interface UseGuestAttendeeCreateUpdate {
  isSubmitting: boolean;
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleCreateGuest: (values: AttendeeFormSchema) => Promise<boolean>;
  handleUpdateGuest: (values: AttendeeFormSchema) => Promise<boolean>;
}

/**
 * Hook to handle guest attendee creation and updates
 * @param {UseGuestAttendeeCreateUpdateProps} props - form hook, organisation ID, and callback functions
 * @returns {UseGuestAttendeeCreateUpdate} hook - object containing functions and states for guest attendee operations
 */
export const useGuestAttendeeCreateUpdate = ({
  attendeeForm,
  organisationId,
  attendee,
  onSuccess,
  onError,
}: UseGuestAttendeeCreateUpdateProps): UseGuestAttendeeCreateUpdate => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    hook: {
      handleSubmit,
      formState: { isValid },
    },
    updateForm,
  } = attendeeForm;

  const { checkin, updateByFingerprint } = useGuestAttendee();

  const isEditMode = Boolean(attendee);

  /**
   * Function to handle creating a new guest attendee
   * @param {AttendeeFormSchema} values - form values
   * @returns {Promise<boolean>} - success status
   */
  const handleCreateGuest = async (
    values: AttendeeFormSchema,
  ): Promise<boolean> => {
    try {
      const data = getGuestAttendeeCreateData({ values });
      const checkingReponse = await checkin(organisationId, data);

      if (checkingReponse.success) {
        notify({
          message: "Check-in successful! Welcome to the meeting.",
          type: "success",
        });

        // Note: We don't have the returned attendee data from the boolean response
        // If you need the attendee data, you might want to modify the hook to return it
        if (onSuccess) {
          // You might want to fetch the attendee data here or modify the API response
          onSuccess({} as Attendee); // Placeholder - adjust based on your needs
        }

        return true;
      } else {
        const message =
          checkingReponse.error || "Check-in failed. Please try again.";
        notify({ message, type: "error" });
        if (onError) {
          onError(message, checkingReponse.statuscode);
        }
        return false;
      }
    } catch (error) {
      const message = getErrorMessage(error) || "An unexpected error occurred.";
      notify({ message, type: "error" });
      if (onError) {
        onError(message);
      }
      return false;
    }
  };

  /**
   * Function to handle updating an existing guest attendee
   * @param {AttendeeFormSchema} values - form values
   * @returns {Promise<boolean>} - success status
   */
  const handleUpdateGuest = async (
    values: AttendeeFormSchema,
  ): Promise<boolean> => {
    if (!attendee?.checkin?.device_fingerprint) {
      const errorMessage = "Cannot update: Device fingerprint not found.";
      notify({ type: "error", message: errorMessage });
      if (onError) {
        onError(errorMessage);
      }
      return false;
    }

    try {
      const data = getGuestAttendeeUpdateData({ values });
      const fingerprintResponse = await updateByFingerprint(
        organisationId,
        attendee.meeting_id,
        attendee.checkin.device_fingerprint,
        data,
      );

      if (fingerprintResponse.success) {
        notify({
          message: "Guest information updated successfully.",
          type: "success",
        });

        // Update form with new values
        updateForm(attendee);

        if (onSuccess) {
          onSuccess(attendee);
        }

        return true;
      } else {
        const message =
          fingerprintResponse.error || "Update failed. Please try again.";
        notify({ message, type: "error" });
        if (onError) {
          onError(message);
        }
        return false;
      }
    } catch (error) {
      const message = getErrorMessage(error) || "An unexpected error occurred.";
      notify({ message, type: "error" });
      if (onError) {
        onError(message);
      }
      return false;
    }
  };

  /**
   * Main submit handler that routes to create or update based on mode
   * @param {AttendeeFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleSubmitGuest = async (
    values: AttendeeFormSchema,
  ): Promise<void> => {
    if (!isValid) {
      const errorMessage = "Please check all required fields and try again.";
      notify({
        type: "error",
        message: errorMessage,
      });
      if (onError) {
        onError(errorMessage);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await handleUpdateGuest(values);
      } else {
        await handleCreateGuest(values);
      }
    } catch (error) {
      const message =
        getErrorMessage(error) || "An error occurred during submission.";
      notify({
        type: "error",
        message,
      });
      if (onError) {
        onError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.stopPropagation();
    e.preventDefault();
    await handleSubmit(handleSubmitGuest)();
  };

  return {
    isSubmitting,
    handleOnSubmit,
    handleCreateGuest,
    handleUpdateGuest,
  };
};
