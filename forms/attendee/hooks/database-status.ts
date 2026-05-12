"use client";

import { useState } from "react";

import { AttendeeService } from "@/api/services/tendiflow/attendees/service";
import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { DatabaseStatus } from "@/api/services/tendiflow/types/general";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

interface UseAttendeeDatabaseStatusProps {
  attendee?: Attendee | null;
  handleMutateAttendees: () => void;
}

interface UseAttendeeDatabaseStatus {
  isSubmitting: boolean;
  handleUpdateDatabaseStatus: (status: DatabaseStatus) => Promise<void>;
}

/**
 * Hook to handle attendee database status form section
 * @param {UseAttendeeDatabaseStatusProps} props - form hook, attendee, and handleMutateAttendees function
 * @returns {UseAttendeeDatabaseStatus} hook - object containing functions and states for attendee costs form section
 */
export const useAttendeeDatabaseStatus = ({
  attendee,
  handleMutateAttendees,
}: UseAttendeeDatabaseStatusProps): UseAttendeeDatabaseStatus => {
  const { getIdToken } = useUserCredentials();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUpdateDatabaseStatus = async (
    status: DatabaseStatus,
  ): Promise<void> => {
    if (!attendee) {
      return;
    }

    setIsSubmitting(true);
    const token = await getIdToken();
    const service = new AttendeeService(token);
    const res = await service.updateDatabaseStatus({
      organisation_id: attendee.organisation_id,
      id: attendee.id,
      data: { database_status: status },
    });
    if (res.success) {
      notify({
        message: "Attendee Database Status updated successfully",
        type: "success",
      });
      handleMutateAttendees();
    } else {
      notify({ message: res.message, type: "error" });
    }

    setIsSubmitting(false);
  };

  return { isSubmitting, handleUpdateDatabaseStatus };
};
