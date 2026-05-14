"use client";

import { FC, useEffect, useState } from "react";

import { AttendeeClientService } from "@/api/services/tendiflow/attendees/client.service";
import {
  AttendanceStatus,
  Attendee,
  AttendeeCheckinDevice,
  AttendeeCheckinLocation,
  OtpChannel,
} from "@/api/services/tendiflow/attendees/types";
import {
  CheckinValidationResult,
  validateCheckin,
  validateCheckinLocation,
  validateCheckinTiming,
} from "@/forms/attendee/helpers";
import { useGuestCheckinAttendeeForm } from "@/forms/attendee/hooks/form";
import { useGuestAttendeeCreateUpdate } from "@/forms/attendee/hooks/guest";
import { GuestCheckinFormSchema } from "@/forms/attendee/schema";
import { usePublicMeeting } from "@/hooks/meetings/public";
import { generateUUID } from "@/utilities/helpers/id";
import {
  collectCheckInMetadata,
  getGeolocationPermissionState,
} from "@/utilities/helpers/location";

import { AlreadyCheckedInScreen } from "./screens/already-checked-in";
import { AwaitingOtpScreen } from "./screens/awaiting-otp";
import { CancelledScreen } from "./screens/cancelled";
import { ErrorScreen } from "./screens/error";
import { FeedbackFormScreen } from "./screens/feedback-form";
import { FeedbackSubmittedScreen } from "./screens/feedback-submitted";
import { FormScreen } from "./screens/form";
import { LoadingScreen } from "./screens/loading";
import { LocationErrorScreen } from "./screens/location-error";
import { PermissionsScreen } from "./screens/permissions";
import { PreviewScreen } from "./screens/preview";
import { SuccessScreen } from "./screens/success";
import { TimingErrorScreen } from "./screens/timing-error";

const clientService = new AttendeeClientService();

interface MeetingCheckInFlowViewProps {
  organisationId: string;
  meetingId: string;
}

type FlowStep =
  | "loading"
  | "permissions"
  | "form"
  | "preview"
  | "awaiting_otp"
  | "success"
  | "error"
  | "already_checked_in"
  | "feedback_form"
  | "feedback_submitted"
  | "cancelled"
  | "timing_error"
  | "location_error";

interface CheckInMetadata {
  sessionId: string;
  locationInfo: AttendeeCheckinLocation;
  deviceInfo: AttendeeCheckinDevice;
}

export const MeetingCheckInFlowView: FC<MeetingCheckInFlowViewProps> = ({
  organisationId,
  meetingId,
}) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("loading");
  const [flowInitialized, setFlowInitialized] = useState(false);
  const [metadata, setMetadata] = useState<CheckInMetadata | null>(null);
  const [validationResult, setValidationResult] =
    useState<CheckinValidationResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [otpEmailSentTo, setOtpEmailSentTo] = useState<string | null>(null);
  const [otpChannel, setOtpChannel] = useState<OtpChannel>("email");
  const [otpPhoneSentTo, setOtpPhoneSentTo] = useState<string | null>(null);
  // sessionAttendee is the hydrated attendee record (from either the
  // session-probe at mount, or the freshly-issued one from verify-otp).
  // We hold onto it so feedback/cancel actions know which record they
  // operate against and can pre-fill the feedback form.
  const [sessionAttendee, setSessionAttendee] = useState<Attendee | null>(
    null,
  );
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const {
    meeting,
    isLoading: meetingLoading,
    error: meetingError,
  } = usePublicMeeting({
    organisationId,
    meetingId,
  });

  // Identity is the verified email (via the OTP flow). We deliberately do
  // not pre-fill from any browser-derived signal: FingerprintJS open-source
  // collides on iOS Safari (ITP starves entropy), and any lookup before
  // the email is verified can leak one user's record to another.
  const attendeeForm = useGuestCheckinAttendeeForm({ meetingId });

  const { isSubmitting, handleRequestOtp, handleVerifyOtp } =
    useGuestAttendeeCreateUpdate({
      attendeeForm,
      organisationId,
      onSuccess: (attendee) => {
        // Capture the freshly-issued attendee so the Success screen
        // (and a later return to Already Checked In) can drive feedback
        // / cancel actions against the right record without another
        // round trip.
        setSessionAttendee(attendee);
        setCurrentStep("success");
      },
      // onError fires for *unexpected* errors only — handleVerifyOtp
      // returns 400/410/429 inline (handled in the OTP screen), and 409
      // (already checked in) we route ourselves below.
      onError: () => undefined,
    });

  useEffect(() => {
    async function initializeFlow(): Promise<void> {
      if (!meeting) return;

      try {
        setCurrentStep("loading");

        const timingValidation = validateCheckinTiming(meeting);
        if (!timingValidation.canCheckin) {
          setValidationResult({
            isValid: false,
            errors: timingValidation.message ? [timingValidation.message] : [],
            warnings: [],
          });
          setCurrentStep("timing_error");
          return;
        }

        // Hydrate from the tendiflow_checkin_session cookie if present.
        // The OTP flow issues this cookie scoped to (attendee, meeting),
        // so a returning user lands directly on "already checked in"
        // instead of having to re-fill the form just to discover they're
        // already in. Empty / expired / scope-mismatched → null, and we
        // fall through to the normal flow.
        const sessionResponse = await clientService.getCheckinSessionAttendee(
          organisationId,
          meetingId,
        );
        const hydrated = sessionResponse.success ? sessionResponse.data : null;
        if (
          hydrated &&
          hydrated.checkin &&
          hydrated.attendance_status !== AttendanceStatus.CANCELLED
        ) {
          setSessionAttendee(hydrated);
          if (hydrated.feedback?.rating) {
            setFeedbackRating(hydrated.feedback.rating);
          }
          if (hydrated.feedback?.comment) {
            setFeedbackComment(hydrated.feedback.comment);
          }
          setCurrentStep("already_checked_in");
          return;
        }

        // Skip GPS up-front: iOS Safari typically refuses to show the
        // permission prompt outside a user gesture, so calling it here
        // would just stall for ~12s and return empty coords. We hand
        // off to the permissions step below, where the prompt fires
        // from the user's tap and actually works.
        const checkInMetadata = await collectCheckInMetadata({
          requestLocation: false,
        });

        const sessionId = generateUUID();
        const fullMetadata: CheckInMetadata = {
          sessionId,
          locationInfo: checkInMetadata.locationInfo,
          deviceInfo: checkInMetadata.deviceInfo,
        };
        setMetadata(fullMetadata);

        // Populate the form's `checkin` field as a single whole-object
        // setValue. Form defaults set `checkin: null` for fresh guests, so
        // we never rely on react-hook-form materialising a parent object
        // from nested-path setValues — instead we always write the full
        // shape. `checkin_datetime` is refreshed again in
        // handleConfirmCheckIn so the timestamp reflects the actual tap.
        attendeeForm.hook.setValue("checkin", {
          session_id: fullMetadata.sessionId,
          checkin_datetime: new Date().toISOString(),
          checkin_location: fullMetadata.locationInfo,
          checkin_device: fullMetadata.deviceInfo,
        });

        // Location handling for meetings that require it. Fast path:
        // if the browser already has permission cached for this origin,
        // call getCurrentPosition silently (no gesture needed) so repeat
        // users don't see the permissions screen they've already passed.
        // Otherwise, hand off to the permissions step where the prompt
        // fires from a real tap — necessary because iOS Safari refuses
        // to show the dialog outside a user gesture.
        if (meeting.settings.require_location_verification) {
          const permissionState = await getGeolocationPermissionState();
          if (permissionState !== "granted") {
            setCurrentStep("permissions");
            return;
          }
          const geoMetadata = await collectCheckInMetadata({
            requestLocation: true,
          });
          if (!geoMetadata.locationInfo.latitude) {
            // Permission cache says granted but the call returned no
            // fix (revoked between query and call, hardware error,
            // etc.). Fall back to the permissions screen.
            setCurrentStep("permissions");
            return;
          }
          const locationValidation = validateCheckinLocation(
            meeting,
            geoMetadata.locationInfo,
          );
          if (!locationValidation.isWithinRadius) {
            setValidationResult({
              isValid: false,
              errors: locationValidation.message
                ? [locationValidation.message]
                : [],
              warnings: [],
            });
            setCurrentStep("location_error");
            return;
          }
          fullMetadata.locationInfo = geoMetadata.locationInfo;
          setMetadata({ ...fullMetadata });
          attendeeForm.hook.setValue("checkin", {
            session_id: fullMetadata.sessionId,
            checkin_datetime: new Date().toISOString(),
            checkin_location: fullMetadata.locationInfo,
            checkin_device: fullMetadata.deviceInfo,
          });
        }

        setCurrentStep("form");
      } catch (error) {
        console.error("Error initializing check-in flow:", error);
        setValidationResult({
          isValid: false,
          errors: ["Failed to initialize check-in. Please try again."],
          warnings: [],
        });
        setCurrentStep("error");
      }
    }

    if (meeting && !meetingLoading && !flowInitialized) {
      setFlowInitialized(true);
      initializeFlow();
    }
  }, [
    meeting,
    meetingLoading,
    organisationId,
    meetingId,
    flowInitialized,
    attendeeForm,
  ]);

  const handlePermissionsRequest = async (): Promise<void> => {
    try {
      setCurrentStep("loading");
      const checkInMetadata = await collectCheckInMetadata();
      if (!metadata) return;

      const updatedMetadata = {
        ...metadata,
        locationInfo: checkInMetadata.locationInfo,
        deviceInfo: checkInMetadata.deviceInfo,
      };
      setMetadata(updatedMetadata);

      if (!checkInMetadata.locationInfo?.latitude) {
        setValidationResult({
          isValid: false,
          errors: [
            "Location access is required but could not be obtained. Please enable location services and try again.",
          ],
          warnings: [],
        });
        setCurrentStep("error");
        return;
      }

      if (meeting && meeting.settings.require_location_verification) {
        const locationValidation = validateCheckinLocation(
          meeting,
          checkInMetadata.locationInfo,
        );
        if (!locationValidation.isWithinRadius) {
          setValidationResult({
            isValid: false,
            errors: locationValidation.message
              ? [locationValidation.message]
              : [],
            warnings: [],
          });
          setCurrentStep("location_error");
          return;
        }
      }

      // Write the full checkin shape rather than relying on nested
      // setValue creating a parent object from the form's null default.
      attendeeForm.hook.setValue("checkin", {
        session_id: updatedMetadata.sessionId,
        checkin_datetime: new Date().toISOString(),
        checkin_location: updatedMetadata.locationInfo,
        checkin_device: updatedMetadata.deviceInfo,
      });
      setCurrentStep("form");
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setValidationResult({
        isValid: false,
        errors: ["Failed to access location. Please try again."],
        warnings: [],
      });
      setCurrentStep("error");
    }
  };

  const handleFormToPreview = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!meeting || !metadata) return;

    const formValues = attendeeForm.hook.getValues();
    const validation = validateCheckin(
      meeting,
      formValues.email,
      formValues.first_name,
      formValues.last_name,
      metadata.locationInfo,
    );
    setValidationResult(validation);
    if (validation.isValid) {
      setCurrentStep("preview");
    }
  };

  /**
   * Build the submit-ready form values, refreshing checkin_datetime to
   * the *current* moment so the backend's on-time/late determination
   * reflects the actual confirm/verify tap rather than the much-earlier
   * flow-init time.
   */
  const buildSubmitValues = (): GuestCheckinFormSchema => {
    const formValues = attendeeForm.hook.getValues();
    return {
      ...formValues,
      checkin: formValues.checkin
        ? {
            ...formValues.checkin,
            checkin_datetime: new Date().toISOString(),
          }
        : formValues.checkin,
    };
  };

  // Step 1 of OTP flow: from the preview screen, request a 6-digit code.
  const handleConfirmCheckIn = async (): Promise<void> => {
    if (!meeting || !metadata) return;

    const formValues = attendeeForm.hook.getValues();
    const validation = validateCheckin(
      meeting,
      formValues.email,
      formValues.first_name,
      formValues.last_name,
      metadata.locationInfo,
    );
    if (!validation.isValid) {
      setValidationResult(validation);
      setCurrentStep("form");
      return;
    }

    const submitValues = buildSubmitValues();
    const result = await handleRequestOtp(submitValues);
    if (result.success) {
      setOtpCode("");
      setOtpError(null);
      setOtpExpiresAt(result.expiresAt ?? null);
      setOtpEmailSentTo(submitValues.email);
      setOtpChannel(result.channel ?? "email");
      setOtpPhoneSentTo(submitValues.phone_number ?? null);
      setCurrentStep("awaiting_otp");
      return;
    }
    // 409 = backend says this email is already checked in. Route to the
    // dedicated screen rather than a generic error.
    if (result.statuscode === 409) {
      setCurrentStep("already_checked_in");
      return;
    }
    setValidationResult({
      isValid: false,
      errors: [result.error ?? "Failed to send verification code."],
      warnings: [],
    });
    setCurrentStep("error");
  };

  // Step 2 of OTP flow: submit the typed 6-digit code.
  const handleSubmitOtp = async (): Promise<void> => {
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setOtpError("Enter the 6-digit code we sent you.");
      return;
    }
    setOtpError(null);
    const result = await handleVerifyOtp(buildSubmitValues(), otpCode);
    if (result.success) {
      // Transition handled by onSuccess in the hook (→ "success").
      return;
    }
    if (result.statuscode === 400) {
      setOtpError(result.error || "That code didn't match. Try again.");
      return;
    }
    if (result.statuscode === 410) {
      setOtpError("Your code expired. Tap “Send a new code” to get a fresh one.");
      return;
    }
    if (result.statuscode === 429) {
      setOtpError("Too many wrong attempts. Tap “Send a new code” to try again.");
      return;
    }
    if (result.statuscode === 409) {
      setCurrentStep("already_checked_in");
      return;
    }
    setValidationResult({
      isValid: false,
      errors: [result.error ?? "Failed to verify the code."],
      warnings: [],
    });
    setCurrentStep("error");
  };

  const handleResendOtp = async (): Promise<void> => {
    const submitValues = buildSubmitValues();
    setOtpError(null);
    setOtpCode("");
    const result = await handleRequestOtp(submitValues);
    if (result.success) {
      setOtpExpiresAt(result.expiresAt ?? null);
      setOtpEmailSentTo(submitValues.email);
      setOtpChannel(result.channel ?? "email");
      setOtpPhoneSentTo(submitValues.phone_number ?? null);
      return;
    }
    if (result.statuscode === 409) {
      setCurrentStep("already_checked_in");
      return;
    }
    setOtpError(result.error ?? "Could not resend the code.");
  };

  const handleStartFeedback = (): void => {
    // Pre-fill from prior submission if there is one; submit overwrites
    // server-side (backend's submit_feedback doesn't reject duplicates).
    setFeedbackRating(sessionAttendee?.feedback?.rating ?? 0);
    setFeedbackComment(sessionAttendee?.feedback?.comment ?? "");
    setFeedbackError(null);
    setCurrentStep("feedback_form");
  };

  const handleSubmitFeedback = async (): Promise<void> => {
    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
      setFeedbackError("Please pick a rating from 1 to 5 stars.");
      return;
    }
    setFeedbackSubmitting(true);
    setFeedbackError(null);
    try {
      const response = await clientService.submitGuestCheckinFeedback(
        organisationId,
        meetingId,
        {
          feedback: {
            rating: feedbackRating,
            comment: feedbackComment.trim() || null,
            feedback_datetime: new Date().toISOString(),
          },
        },
      );
      if (response.success && response.data) {
        setSessionAttendee(response.data);
        setCurrentStep("feedback_submitted");
        return;
      }
      if (response.statuscode === 401) {
        setFeedbackError(
          "Your check-in session expired. Please refresh the page to verify again.",
        );
        return;
      }
      if (response.statuscode === 410) {
        setFeedbackError("The feedback window for this meeting has closed.");
        return;
      }
      setFeedbackError(
        response.message || "Couldn't submit feedback. Please try again.",
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleConfirmCancel = async (): Promise<void> => {
    setCancelSubmitting(true);
    setCancelError(null);
    try {
      const response = await clientService.cancelGuestCheckin(
        organisationId,
        meetingId,
      );
      if (response.success) {
        setSessionAttendee(null);
        setCancelConfirming(false);
        setCurrentStep("cancelled");
        return;
      }
      if (response.statuscode === 401) {
        setCancelError(
          "Your check-in session expired. Please refresh the page to verify again.",
        );
        return;
      }
      setCancelError(
        response.message || "Couldn't cancel your check-in. Please try again.",
      );
    } finally {
      setCancelSubmitting(false);
    }
  };

  // ---------- render dispatch ----------

  if (meetingLoading || currentStep === "loading") {
    return <LoadingScreen />;
  }

  if (meetingError || !meeting || currentStep === "error") {
    return (
      <ErrorScreen
        meetingError={meetingError}
        validationResult={validationResult}
      />
    );
  }

  if (currentStep === "timing_error") {
    return (
      <TimingErrorScreen
        meeting={meeting}
        validationResult={validationResult}
      />
    );
  }

  if (currentStep === "location_error") {
    return (
      <LocationErrorScreen
        meeting={meeting}
        validationResult={validationResult}
      />
    );
  }

  if (currentStep === "already_checked_in") {
    return (
      <AlreadyCheckedInScreen
        meeting={meeting}
        sessionAttendee={sessionAttendee}
        cancelConfirming={cancelConfirming}
        cancelSubmitting={cancelSubmitting}
        cancelError={cancelError}
        onStartFeedback={handleStartFeedback}
        onShowCancelConfirm={() => setCancelConfirming(true)}
        onDismissCancelConfirm={() => {
          setCancelConfirming(false);
          setCancelError(null);
        }}
        onConfirmCancel={() => void handleConfirmCancel()}
      />
    );
  }

  if (currentStep === "feedback_form") {
    return (
      <FeedbackFormScreen
        feedbackRating={feedbackRating}
        onRatingChange={(n) => {
          setFeedbackRating(n);
          if (feedbackError) setFeedbackError(null);
        }}
        feedbackComment={feedbackComment}
        onCommentChange={setFeedbackComment}
        feedbackError={feedbackError}
        feedbackSubmitting={feedbackSubmitting}
        onSubmit={() => void handleSubmitFeedback()}
        onCancel={() => {
          setFeedbackError(null);
          setCurrentStep(sessionAttendee ? "already_checked_in" : "success");
        }}
      />
    );
  }

  if (currentStep === "feedback_submitted") {
    return (
      <FeedbackSubmittedScreen
        onBackToCheckin={() => setCurrentStep("already_checked_in")}
      />
    );
  }

  if (currentStep === "cancelled") {
    return <CancelledScreen />;
  }

  if (currentStep === "permissions") {
    return (
      <PermissionsScreen
        meeting={meeting}
        onRequestPermissions={() => void handlePermissionsRequest()}
      />
    );
  }

  if (currentStep === "form") {
    return (
      <FormScreen
        meeting={meeting}
        meetingId={meetingId}
        attendeeForm={attendeeForm}
        validationResult={validationResult}
        isSubmitting={isSubmitting}
        onSubmit={handleFormToPreview}
      />
    );
  }

  if (currentStep === "preview") {
    return (
      <PreviewScreen
        meeting={meeting}
        attendeeForm={attendeeForm}
        metadata={metadata}
        isSubmitting={isSubmitting}
        onConfirm={() => void handleConfirmCheckIn()}
        onBack={() => setCurrentStep("form")}
      />
    );
  }

  if (currentStep === "awaiting_otp") {
    return (
      <AwaitingOtpScreen
        otpCode={otpCode}
        onCodeChange={(value) => {
          setOtpCode(value);
          if (otpError) setOtpError(null);
        }}
        otpError={otpError}
        otpExpiresAt={otpExpiresAt}
        otpEmailSentTo={otpEmailSentTo}
        otpChannel={otpChannel}
        otpPhoneSentTo={otpPhoneSentTo}
        isSubmitting={isSubmitting}
        onSubmit={() => void handleSubmitOtp()}
        onResend={() => void handleResendOtp()}
        onBack={() => {
          setOtpCode("");
          setOtpError(null);
          setCurrentStep("form");
        }}
      />
    );
  }

  if (currentStep === "success") {
    return (
      <SuccessScreen meeting={meeting} onLeaveFeedback={handleStartFeedback} />
    );
  }

  return null;
};
