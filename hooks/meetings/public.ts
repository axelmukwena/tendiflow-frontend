"use client";

import useSWR, { useSWRConfig } from "swr";

import { MeetingClientService } from "@/api/services/tendiflow/meetings/client.service";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { getErrorMessage } from "@/utilities/helpers/errors";

const service = new MeetingClientService();

interface UsePublicMeetingProps {
  organisationId?: string | null;
  meetingId?: string | null;
}

export interface UsePublicMeetingReturn {
  meeting: Meeting | null;
  isLoading: boolean;
  error: string | null;
  mutateMeeting: () => void;
}

/**
 * Generate SWR key for public meeting
 */
const getPublicMeetingSwrKey = (
  organisationId?: string | null,
  meetingId?: string | null,
): string | null => {
  if (!organisationId || !meetingId) return null;
  return `public-meeting-${organisationId}-${meetingId}`;
};

/**
 * Hook to get a public meeting by ID using SWR
 * @param {UsePublicMeetingProps} props - The organisation and meeting IDs
 * @returns {UsePublicMeetingReturn} The meeting data and utilities
 */
export const usePublicMeeting = ({
  organisationId,
  meetingId,
}: UsePublicMeetingProps): UsePublicMeetingReturn => {
  const { mutate } = useSWRConfig();

  // Fetcher function for SWR
  const fetcher = async (): Promise<Meeting | null> => {
    if (!organisationId || !meetingId) return null;

    const response = await service.getPublicMeeting({
      organisation_id: organisationId,
      meeting_id: meetingId,
    });

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || "Failed to fetch public meeting");
    }
  };

  // SWR key - only create if we have both required parameters
  const swrKey = getPublicMeetingSwrKey(organisationId, meetingId);

  const { data, error, isLoading } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
    // Cache for 5 minutes since public meetings don't change frequently
    dedupingInterval: 5 * 60 * 1000,
  });

  const mutateMeeting = (): void => {
    if (swrKey) {
      mutate(swrKey);
    }
  };

  return {
    meeting: data || null,
    isLoading,
    error: getErrorMessage(error),
    mutateMeeting,
  };
};
