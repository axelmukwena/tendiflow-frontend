// hooks/meetings/export.ts

import { useState } from "react";

import { getAttendeesAllFetcher } from "@/api/services/tendiflow/attendees/fetchers";
import {
  AttendeeQuery,
  AttendeeSortBy,
} from "@/api/services/tendiflow/attendees/types";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { DatabaseStatus, OrderBy } from "@/api/services/tendiflow/types/general";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import {
  exportMeetingToExcel,
  isExportSupported,
} from "@/utilities/helpers/excel-export";
import { generateMeetingExportFilename } from "@/utilities/helpers/filename";
import { notify } from "@/utilities/helpers/toaster";

import { useUserCredentials } from "../profile/credentials";
import { useMeetingById } from "./id";

interface UseExportMeetingProps {
  meetingId: string;
}

interface UseExportMeetingReturn {
  isExporting: boolean;
  isExportSupported: boolean;
  canExport: boolean;
  exportMeeting: () => Promise<void>;
  meeting: Meeting | null;
  attendeesCount: number;
  error: string | null;
}

/**
 * Hook to handle meeting and attendees export to Excel
 */
export const useExportMeeting = ({
  meetingId,
}: UseExportMeetingProps): UseExportMeetingReturn => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const [isExporting, setIsExporting] = useState(false);
  const { getIdToken } = useUserCredentials();
  const [attendeesCount, setAttendeesCount] = useState(0);

  // Fetch meeting data
  const {
    meeting,
    isLoading: meetingLoading,
    error: meetingError,
  } = useMeetingById({ meetingId });

  const exportSupported = isExportSupported();
  const canExport = !!(meeting && !meetingLoading);
  const error = meetingError;

  /**
   * Export meeting and attendees data to Excel
   */
  const exportMeeting = async (): Promise<void> => {
    if (!meeting) {
      notify({
        message: "Meeting data not available for export",
        type: "error",
      });
      return;
    }

    if (!exportSupported) {
      notify({
        message: "Excel export is not supported in your browser",
        type: "error",
      });
      return;
    }

    try {
      setIsExporting(true);
      const query: AttendeeQuery = {
        meeting_ids: [meeting.id],
        database_statuses: [DatabaseStatus.ACTIVE],
        sort_by: AttendeeSortBy.CREATED_AT,
        order_by: OrderBy.ASC,
      };

      const response = await getAttendeesAllFetcher({
        organisation_id: currentOrganisation?.id,
        getIdToken,
        query,
        params: {},
      });

      if (!response || !response.success || !response.data) {
        notify({
          message: "Failed to fetch attendees for export",
          type: "error",
        });
        return;
      }

      const attendees = response.data;
      setAttendeesCount(attendees.length);

      // Generate filename
      const filename = generateMeetingExportFilename(
        meeting.title,
        meeting.start_datetime,
        meeting.id,
      );

      // Export to Excel
      await exportMeetingToExcel(
        {
          meeting,
          attendees,
        },
        filename,
      );

      notify({
        message: `Successfully exported meeting "${meeting.title}" with ${attendees.length} attendees`,
        type: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      notify({
        message:
          error instanceof Error
            ? error.message
            : "Failed to export meeting data",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    isExportSupported: exportSupported,
    canExport,
    exportMeeting,
    meeting: meeting || null,
    attendeesCount,
    error,
  };
};
