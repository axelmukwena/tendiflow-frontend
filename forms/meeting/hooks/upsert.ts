"use client";

import { FormEvent, useState } from "react";

import { MeetingService } from "@/api/services/tendiflow/meetings/service";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

import { getMeetingCreateData, getMeetingUpdateData } from "../data";
import { MeetingFormSchema } from "../schema";
import { UseMeetingForm } from "../types";

interface UseMeetingCreateUpdateProps {
  meetingForm: UseMeetingForm;
  meeting?: Meeting | null;
  handleMutateMeetings: () => void;
  setCloseDialog?: () => void;
}

interface UseMeetingCreateUpdate {
  isSubmitting: boolean;
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Combined hook to handle both meeting creation and updates
 * @param {UseMeetingCreateUpdateProps} props - form hook, meeting (optional), and callback functions
 * @returns {UseMeetingCreateUpdate} hook - object containing functions and states for meeting form submission
 */
export const useMeetingCreateUpdate = ({
  meetingForm,
  meeting,
  handleMutateMeetings,
  setCloseDialog,
}: UseMeetingCreateUpdateProps): UseMeetingCreateUpdate => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { getIdToken } = useUserCredentials();

  const {
    organisationId,
    hook: {
      handleSubmit,
      formState: { isValid },
    },
    updateForm,
  } = meetingForm;

  const isEditMode = Boolean(meeting);

  /**
   * Function to handle creating a new meeting
   * @param {MeetingFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleCreateMeeting = async (
    values: MeetingFormSchema,
  ): Promise<void> => {
    const token = await getIdToken();
    const meetingService = new MeetingService(token);

    const data = getMeetingCreateData({ values });
    const res = await meetingService.create({
      organisation_id: organisationId,
      data,
    });

    if (res.success && res.data) {
      notify({
        message: "Meeting created successfully",
        type: "success",
      });
      handleMutateMeetings();
      if (setCloseDialog) {
        setCloseDialog();
      }
    } else {
      notify({ message: res.message, type: "error" });
    }
  };

  /**
   * Function to handle updating an existing meeting
   * @param {MeetingFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleUpdateMeeting = async (
    values: MeetingFormSchema,
  ): Promise<void> => {
    if (!meeting) {
      notify({
        type: "error",
        message: "Meeting not found.",
      });
      return;
    }

    const token = await getIdToken();
    const meetingService = new MeetingService(token);

    const data = getMeetingUpdateData({ values });
    const res = await meetingService.update({
      organisation_id: organisationId,
      id: meeting.id,
      data,
    });

    if (res.success && res.data) {
      notify({
        message: "Meeting updated successfully",
        type: "success",
      });
      updateForm(res.data);
      handleMutateMeetings();
      if (setCloseDialog) {
        setCloseDialog();
      }
    } else {
      notify({ message: res.message, type: "error" });
    }
  };

  /**
   * Main submit handler that routes to create or update based on mode
   * @param {MeetingFormSchema} values - form values
   * @returns {Promise<void>}
   */
  const handleSubmitMeeting = async (
    values: MeetingFormSchema,
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
        await handleUpdateMeeting(values);
      } else {
        await handleCreateMeeting(values);
      }
    } catch (error) {
      notify({
        type: "error",
        message: `Failed to ${isEditMode ? "update" : "create"} meeting. Please try again.`,
      });
      console.error(
        `Meeting ${isEditMode ? "update" : "create"} error:`,
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
    await handleSubmit(handleSubmitMeeting)();
  };

  return {
    isSubmitting,
    handleOnSubmit,
  };
};
