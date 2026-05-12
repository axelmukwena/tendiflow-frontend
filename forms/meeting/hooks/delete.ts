"use client";

import { useState } from "react";

import { MeetingService } from "@/api/services/tendiflow/meetings/service";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

interface UseMeetingDeleteProps {
  meeting?: Meeting | null;
  handleMutateMeetings: () => void;
}

interface UseMeetingDelete {
  isSubmitting: boolean;
  handleDelete: () => Promise<void>;
}

/**
 * Hook to handle meeting database status form section
 * @param {UseMeetingDeleteProps} props - form hook, meeting, and handleMutateMeetings function
 * @returns {UseMeetingDelete} hook - object containing functions and states for meeting costs form section
 */
export const useMeetingDelete = ({
  meeting,
  handleMutateMeetings,
}: UseMeetingDeleteProps): UseMeetingDelete => {
  const { getIdToken } = useUserCredentials();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    if (!meeting) {
      return;
    }

    setIsSubmitting(true);
    const token = await getIdToken();
    const service = new MeetingService(token);
    const res = await service.delete({
      organisation_id: meeting.organisation_id,
      id: meeting.id,
    });
    if (res.success) {
      notify({
        message: "Meeting deleted successfully",
        type: "success",
      });
      handleMutateMeetings();
    } else {
      notify({ message: res.message, type: "error" });
    }

    setIsSubmitting(false);
  };

  return { isSubmitting, handleDelete };
};
