"use client";

import { useState } from "react";

import { AttendeeService } from "@/api/services/tendiflow/attendees/service";
import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

interface UseAttendeeDeleteProps {
  attendee?: Attendee | null;
  handleMutateAttendees: () => void;
}

interface UseAttendeeDelete {
  isSubmitting: boolean;
  handleDelete: () => Promise<void>;
}

/**
 * Hook to handle attendee database status form section
 * @param {UseAttendeeDeleteProps} props - form hook, attendee, and handleMutateAttendees function
 * @returns {UseAttendeeDelete} hook - object containing functions and states for attendee costs form section
 */
export const useAttendeeDelete = ({
  attendee,
  handleMutateAttendees,
}: UseAttendeeDeleteProps): UseAttendeeDelete => {
  const { getIdToken } = useUserCredentials();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    if (!attendee) {
      return;
    }

    setIsSubmitting(true);
    const token = await getIdToken();
    const service = new AttendeeService(token);
    const res = await service.delete({
      organisation_id: attendee.organisation_id,
      id: attendee.id,
    });
    if (res.success) {
      notify({
        message: "Attendee deleted successfully",
        type: "success",
      });
      handleMutateAttendees();
    } else {
      notify({ message: res.message, type: "error" });
    }

    setIsSubmitting(false);
  };

  return { isSubmitting, handleDelete };
};
