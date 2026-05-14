"use client";

import { useState } from "react";

import { AttendeeClientService } from "@/api/services/tendiflow/attendees/client.service";
import { Attendee, OtpChannel } from "@/api/services/tendiflow/attendees/types";
import { getErrorMessage } from "@/utilities/helpers/errors";
import { notify } from "@/utilities/helpers/toaster";

import { getGuestAttendeeCreateData } from "../data";
import { GuestCheckinFormSchema } from "../schema";
import { UseGuestCheckinAttendeeForm } from "../types";

const clientService = new AttendeeClientService();

interface UseGuestAttendeeCreateUpdateProps {
  attendeeForm: UseGuestCheckinAttendeeForm;
  organisationId: string;
  onSuccess?: (attendee: Attendee) => void;
  /**
   * `statuscode` is the HTTP status from the backend (forwarded through
   * the Next.js proxy). Fires only for *unexpected* errors —
   * handleVerifyOtp returns 400/410/429 inline so the caller can render
   * them in the OTP screen.
   */
  onError?: (error: string, statuscode?: number) => void;
}

export interface RequestOtpResult {
  success: boolean;
  statuscode?: number;
  expiresAt?: string;
  expiresInMinutes?: number;
  channel?: OtpChannel;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  statuscode?: number;
  attendee?: Attendee;
  error?: string;
}

interface UseGuestAttendeeCreateUpdate {
  isSubmitting: boolean;
  /**
   * Two-step guest check-in. The form is submitted to the backend, which
   * validates and emails a 6-digit OTP. Nothing is written to the
   * attendees collection until handleVerifyOtp succeeds.
   */
  handleRequestOtp: (values: GuestCheckinFormSchema) => Promise<RequestOtpResult>;
  handleVerifyOtp: (
    values: GuestCheckinFormSchema,
    code: string,
  ) => Promise<VerifyOtpResult>;
}

export const useGuestAttendeeCreateUpdate = ({
  organisationId,
  onSuccess,
  onError,
}: UseGuestAttendeeCreateUpdateProps): UseGuestAttendeeCreateUpdate => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Step 1 of the OTP flow. Submits the full form to /request-otp; the
   * backend validates and (on success) sends a 6-digit code via the chosen
   * channel (email or SMS).
   *
   * Toasts only on unexpected errors. 409 (already checked in) and 429
   * (rate limited) are surfaced to the caller via statuscode so the flow
   * view can route appropriately. 429 also shows a friendly toast.
   */
  const handleRequestOtp = async (
    values: GuestCheckinFormSchema,
  ): Promise<RequestOtpResult> => {
    setIsSubmitting(true);
    try {
      const attendee = getGuestAttendeeCreateData({ values });
      const channel: OtpChannel = values.channel ?? "email";
      const response = await clientService.requestGuestCheckinOtp(
        organisationId,
        { channel, attendee },
      );
      if (response.success && response.data) {
        return {
          success: true,
          statuscode: response.statuscode,
          expiresAt: response.data.expires_at,
          expiresInMinutes: response.data.expires_in_minutes,
          channel: response.data.channel,
        };
      }
      const message =
        response.message || "Could not send the verification code.";
      if (response.statuscode === 429) {
        // Extract retry_after_seconds from the backend message:
        // "Too many OTP requests. Retry in 3600 seconds."
        let toastMessage =
          "Too many requests. Please wait before requesting another code.";
        const match = message.match(/Retry in (\d+) seconds/);
        if (match) {
          const seconds = parseInt(match[1], 10);
          const minutes = Math.max(1, Math.ceil(seconds / 60));
          toastMessage = `You've requested too many codes. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
        }
        notify({
          type: "error",
          message: toastMessage,
        });
        return {
          success: false,
          statuscode: response.statuscode,
          error: message,
        };
      }
      if (response.statuscode !== 409) {
        notify({ message, type: "error" });
      }
      if (onError) {
        onError(message, response.statuscode);
      }
      return {
        success: false,
        statuscode: response.statuscode,
        error: message,
      };
    } catch (error) {
      const message =
        getErrorMessage(error) || "An unexpected error occurred.";
      notify({ message, type: "error" });
      if (onError) {
        onError(message);
      }
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Step 2 of the OTP flow. Sends the typed code plus the same form
   * payload. On success the backend writes the attendee record and sets
   * the tendiflow_checkin_session cookie (forwarded by the proxy).
   *
   * Does not toast on 400/410/429 — those are expected and the OTP
   * screen displays them inline. 409 is surfaced via statuscode for
   * already-checked-in routing.
   */
  const handleVerifyOtp = async (
    values: GuestCheckinFormSchema,
    code: string,
  ): Promise<VerifyOtpResult> => {
    setIsSubmitting(true);
    try {
      const data = getGuestAttendeeCreateData({ values });
      const response = await clientService.verifyGuestCheckinOtp(
        organisationId,
        { code, channel: values.channel ?? "email", attendee: data },
      );
      if (response.success && response.data) {
        notify({
          message: "Check-in successful! Welcome to the meeting.",
          type: "success",
        });
        if (onSuccess) {
          onSuccess(response.data);
        }
        return {
          success: true,
          statuscode: response.statuscode,
          attendee: response.data,
        };
      }
      const message =
        response.message || "Could not verify the code. Please try again.";
      const inlineCodes = new Set([400, 410, 429]);
      if (
        response.statuscode === undefined ||
        !inlineCodes.has(response.statuscode)
      ) {
        notify({ message, type: "error" });
      }
      if (onError) {
        onError(message, response.statuscode);
      }
      return {
        success: false,
        statuscode: response.statuscode,
        error: message,
      };
    } catch (error) {
      const message =
        getErrorMessage(error) || "An unexpected error occurred.";
      notify({ message, type: "error" });
      if (onError) {
        onError(message);
      }
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleRequestOtp,
    handleVerifyOtp,
  };
};
