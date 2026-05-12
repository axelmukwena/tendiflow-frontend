"use client";

import { useState } from "react";

import { MeetingService } from "@/api/services/tendiflow/meetings/service";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

interface UseRegenerateQrcodeProps {
  organisationId: string;
  meeting: Meeting | null;
  onSuccess?: (data: Meeting) => void;
}

interface UseRegenerateQrcode {
  isRegenerating: boolean;
  handleRegenerateQrcode: () => Promise<void>;
}

/**
 * Hook to handle regenerating a meeting's QR code
 * @param {UseRegenerateQrcodeProps} props - The organisation ID, meeting object, and an optional success callback
 * @returns {UseRegenerateQrcode} - An object containing the regenerating state and the handler function
 */
export const useRegenerateQrcode = ({
  organisationId,
  meeting,
  onSuccess,
}: UseRegenerateQrcodeProps): UseRegenerateQrcode => {
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const { getIdToken } = useUserCredentials();

  /**
   * Function to handle regenerating the QR code for a meeting
   * @returns {Promise<void>}
   */
  const handleRegenerateQrcode = async (): Promise<void> => {
    if (!meeting) {
      notify({
        type: "error",
        message: "Meeting not found.",
      });
      return;
    }

    setIsRegenerating(true);

    try {
      const token = await getIdToken();
      const meetingService = new MeetingService(token);

      const res = await meetingService.regenerateQrcode({
        organisation_id: organisationId,
        meeting_id: meeting.id,
      });

      if (res.success && res.data) {
        notify({
          message: "QR code regenerated successfully",
          type: "success",
        });
        if (onSuccess) {
          onSuccess(res.data);
        }
      } else {
        notify({ message: res.message, type: "error" });
      }
    } catch (error) {
      notify({
        type: "error",
        message: "Failed to regenerate QR code. Please try again.",
      });
      console.error("Regenerate QR code error:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    isRegenerating,
    handleRegenerateQrcode,
  };
};
