"use client";

import { useState } from "react";

import { MeetingService } from "@/api/services/tendiflow/meetings/service";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { DatabaseStatus } from "@/api/services/tendiflow/types/general";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

interface UseMeetingDatabaseStatusProps {
  meeting?: Meeting | null;
  handleMutateMeetings: () => void;
}

interface UseMeetingDatabaseStatus {
  isSubmitting: boolean;
  handleUpdateDatabaseStatus: (status: DatabaseStatus) => Promise<void>;
}

/**
 * Hook to handle meeting database status form section
 * @param {UseMeetingDatabaseStatusProps} props - form hook, meeting, and handleMutateMeetings function
 * @returns {UseMeetingDatabaseStatus} hook - object containing functions and states for meeting costs form section
 */
export const useMeetingDatabaseStatus = ({
  meeting,
  handleMutateMeetings,
}: UseMeetingDatabaseStatusProps): UseMeetingDatabaseStatus => {
  const { getIdToken } = useUserCredentials();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUpdateDatabaseStatus = async (
    status: DatabaseStatus,
  ): Promise<void> => {
    if (!meeting) {
      return;
    }

    setIsSubmitting(true);
    const token = await getIdToken();
    const service = new MeetingService(token);
    const res = await service.updateDatabaseStatus({
      organisation_id: meeting.organisation_id,
      id: meeting.id,
      data: { database_status: status },
    });
    if (res.success) {
      notify({
        message: "Meeting Database Status updated successfully",
        type: "success",
      });
      handleMutateMeetings();
    } else {
      notify({ message: res.message, type: "error" });
    }

    setIsSubmitting(false);
  };

  return { isSubmitting, handleUpdateDatabaseStatus };
};
