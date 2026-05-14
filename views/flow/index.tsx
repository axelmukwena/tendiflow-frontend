"use client";

import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Shield,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

import { AttendeeClientService } from "@/api/services/tendiflow/attendees/client.service";
import {
  AttendanceStatus,
  Attendee,
  AttendeeCheckinDevice,
  AttendeeCheckinLocation,
} from "@/api/services/tendiflow/attendees/types";
import { Spinner } from "@/components/loaders/spinner";
import { LogoVertical } from "@/components/logos/vertical";
import {
  CheckinValidationResult,
  validateCheckin,
  validateCheckinLocation,
  validateCheckinTiming,
} from "@/forms/attendee/helpers";
import { useAttendeeForm } from "@/forms/attendee/hooks/form";
import { useGuestAttendeeCreateUpdate } from "@/forms/attendee/hooks/guest";
import { AttendeeFormSchema } from "@/forms/attendee/schema";
import { usePublicMeeting } from "@/hooks/meetings/public";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";
import { generateUUID } from "@/utilities/helpers/id";
import {
  collectCheckInMetadata,
  getGeolocationPermissionState,
} from "@/utilities/helpers/location";

import { GuestAttendeeForm } from "./form";

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
  const attendeeForm = useAttendeeForm({ meetingId });

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

        // First, validate timing
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
        const sessionAttendee = sessionResponse.success
          ? sessionResponse.data
          : null;
        if (
          sessionAttendee &&
          sessionAttendee.checkin &&
          sessionAttendee.attendance_status !== AttendanceStatus.CANCELLED
        ) {
          setSessionAttendee(sessionAttendee);
          if (sessionAttendee.feedback?.rating) {
            setFeedbackRating(sessionAttendee.feedback.rating);
          }
          if (sessionAttendee.feedback?.comment) {
            setFeedbackComment(sessionAttendee.feedback.comment);
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

  // Handle permissions request
  const handlePermissionsRequest = async (): Promise<void> => {
    try {
      setCurrentStep("loading");

      const checkInMetadata = await collectCheckInMetadata();

      if (metadata) {
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

        // Validate location if required
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
      }
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

  // Handle form submission to preview
  const handleFormToPreview = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!meeting || !metadata) return;

    const formValues = attendeeForm.hook.getValues();

    // Comprehensive validation before proceeding to preview
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
    } else {
      // Don't change step, just show validation errors in the form
      // The GuestAttendeeForm component should display these errors
    }
  };

  /**
   * Build the submit-ready form values, refreshing checkin_datetime to
   * the *current* moment so the backend's on-time/late determination
   * reflects the actual confirm/verify tap rather than the much-earlier
   * flow-init time.
   */
  const buildSubmitValues = (): AttendeeFormSchema => {
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
    if (!submitValues) return;

    const result = await handleRequestOtp(submitValues);
    if (result.success) {
      setOtpCode("");
      setOtpError(null);
      setOtpExpiresAt(result.expiresAt ?? null);
      setOtpEmailSentTo(submitValues.email);
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
      setOtpError("Enter the 6-digit code from the email.");
      return;
    }
    const submitValues = buildSubmitValues();
    if (!submitValues) return;

    setOtpError(null);
    const result = await handleVerifyOtp(submitValues, otpCode);
    if (result.success) {
      // Transition handled by onSuccess in the hook (→ "success").
      return;
    }
    if (result.statuscode === 400) {
      setOtpError(
        result.error || "That code didn't match. Try again.",
      );
      return;
    }
    if (result.statuscode === 410) {
      setOtpError(
        "Your code expired. Tap “Send a new code” to get a fresh one.",
      );
      return;
    }
    if (result.statuscode === 429) {
      setOtpError(
        "Too many wrong attempts. Tap “Send a new code” to try again.",
      );
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
        setFeedbackError(
          "The feedback window for this meeting has closed.",
        );
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

  const handleResendOtp = async (): Promise<void> => {
    const submitValues = buildSubmitValues();
    if (!submitValues) return;
    setOtpError(null);
    setOtpCode("");
    const result = await handleRequestOtp(submitValues);
    if (result.success) {
      setOtpExpiresAt(result.expiresAt ?? null);
      setOtpEmailSentTo(submitValues.email);
      return;
    }
    if (result.statuscode === 409) {
      setCurrentStep("already_checked_in");
      return;
    }
    setOtpError(result.error ?? "Could not resend the code.");
  };

  // Loading state
  if (meetingLoading || currentStep === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-center max-w-sm">
          <Spinner size="4" />
          <h3 className="mt-4 text-base/7 font-medium text-gray-900">
            Loading meeting...
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            This can take up to 30 seconds the first time. If it&apos;s still
            loading after a minute, please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (meetingError || !meeting || currentStep === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle className="mx-auto size-12 text-red-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            {meetingError ? "Meeting Not Found" : "Check-in Error"}
          </h3>
          <div className="mt-1 text-sm/6 text-gray-500">
            {meetingError && <p>{meetingError}</p>}
            {validationResult?.errors?.map((error, index) => (
              <p key={index} className="mt-1">
                {error}
              </p>
            ))}
            {!meetingError && !validationResult?.errors?.length && (
              <p>Sorry, something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Timing error state
  if (currentStep === "timing_error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Clock className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            Check-in Not Available
          </h3>
          <div className="mt-1 text-sm/6 text-gray-500">
            {validationResult?.errors?.map((error, index) => (
              <p key={index} className="mt-1">
                {error}
              </p>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-gray-900">{meeting.title}</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                {getFormattedDateAndTime({ utc: meeting.start_datetime })} -{" "}
                {getFormattedDateAndTime({ utc: meeting.end_datetime })}
              </p>
              {meeting.address && <p className="mt-1">{meeting.address}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Location error state
  if (currentStep === "location_error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <MapPin className="mx-auto size-12 text-red-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            Location Verification Failed
          </h3>
          <div className="mt-1 text-sm/6 text-gray-500">
            {validationResult?.errors?.map((error, index) => (
              <p key={index} className="mt-1">
                {error}
              </p>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h4 className="font-medium text-gray-900">{meeting.title}</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                {getFormattedDateAndTime({ utc: meeting.start_datetime })} -{" "}
                {getFormattedDateAndTime({ utc: meeting.end_datetime })}
              </p>
              {meeting.address && <p className="mt-1">{meeting.address}</p>}
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Already checked in state
  if (currentStep === "already_checked_in") {
    const existingFeedback = sessionAttendee?.feedback;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="bg-yellow-50 px-4 py-5 sm:p-6 text-center">
              <AlertTriangle className="mx-auto size-12 text-yellow-500" />
              <h3 className="mt-2 text-base/7 font-medium text-gray-900">
                Already Checked In
              </h3>
              <p className="mt-1 text-sm/6 text-gray-500">
                You&apos;re checked in to this meeting from this browser.
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6 space-y-5">
              <div>
                <h2 className="text-xl/7 font-semibold text-gray-900">
                  {meeting.title}
                </h2>
                <div className="mt-2 text-sm/6 text-gray-500 space-y-2">
                  <div className="flex items-center">
                    <Calendar className="size-4 mr-2" />
                    {getFormattedDateAndTime({
                      utc: meeting.start_datetime,
                    })}{" "}
                    - {getFormattedDateAndTime({ utc: meeting.end_datetime })}
                  </div>
                  {meeting.address && (
                    <div className="flex items-center">
                      <Building2 className="size-4 mr-2" />
                      {meeting.address}
                    </div>
                  )}
                </div>
              </div>

              {existingFeedback?.rating && (
                <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Your feedback
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`size-4 ${
                          n <= (existingFeedback.rating ?? 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {existingFeedback.comment && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      &ldquo;{existingFeedback.comment}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleStartFeedback}
                  className="w-full flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <MessageSquare className="mr-1.5 size-4" />
                  {existingFeedback?.rating
                    ? "Update feedback"
                    : "Leave feedback"}
                </button>

                {cancelConfirming ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-3">
                    <p className="text-sm text-red-800">
                      Cancel your check-in? You&apos;ll need to verify your
                      email again to re-check in.
                    </p>
                    {cancelError && (
                      <p className="text-xs text-red-700" role="alert">
                        {cancelError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleConfirmCancel}
                        disabled={cancelSubmitting}
                        className="flex-1 inline-flex justify-center items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 disabled:bg-gray-400"
                      >
                        {cancelSubmitting ? "Cancelling..." : "Yes, cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCancelConfirming(false);
                          setCancelError(null);
                        }}
                        disabled={cancelSubmitting}
                        className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        Keep me in
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCancelConfirming(true)}
                    className="w-full inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="mr-1.5 size-4" />
                    Cancel my check-in
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Feedback form
  if (currentStep === "feedback_form") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="px-4 py-5 sm:p-6 text-center">
              <MessageSquare className="mx-auto size-12 text-blue-500" />
              <h3 className="mt-2 text-base/7 font-medium text-gray-900">
                Share your feedback
              </h3>
              <p className="mt-1 text-sm/6 text-gray-500">
                How did the meeting go? Your input goes to the organiser.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmitFeedback();
              }}
              className="px-4 py-5 sm:p-6 border-t border-gray-200 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setFeedbackRating(n);
                        if (feedbackError) setFeedbackError(null);
                      }}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-ring rounded"
                    >
                      <Star
                        className={`size-8 ${
                          n <= feedbackRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="feedback-comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Comment (optional)
                </label>
                <textarea
                  id="feedback-comment"
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="What stood out? Anything we could improve?"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {feedbackError && (
                <p className="text-sm text-red-600" role="alert">
                  {feedbackError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={feedbackSubmitting || feedbackRating < 1}
                  className="flex-1 inline-flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:bg-gray-400"
                >
                  {feedbackSubmitting ? "Submitting..." : "Submit feedback"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackError(null);
                    setCurrentStep(
                      sessionAttendee ? "already_checked_in" : "success",
                    );
                  }}
                  disabled={feedbackSubmitting}
                  className="inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Feedback submitted confirmation
  if (currentStep === "feedback_submitted") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="bg-green-50 px-4 py-5 sm:p-6 text-center">
              <CheckCircle className="mx-auto size-12 text-green-500" />
              <h3 className="mt-2 text-base/7 font-medium text-gray-900">
                Thanks for the feedback
              </h3>
              <p className="mt-1 text-sm/6 text-gray-500">
                We&apos;ve passed it along to the organiser.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <button
                type="button"
                onClick={() => setCurrentStep("already_checked_in")}
                className="w-full inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                Back to check-in
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Cancellation confirmation
  if (currentStep === "cancelled") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="bg-red-50 px-4 py-5 sm:p-6 text-center">
              <XCircle className="mx-auto size-12 text-red-500" />
              <h3 className="mt-2 text-base/7 font-medium text-gray-900">
                Check-in cancelled
              </h3>
              <p className="mt-1 text-sm/6 text-gray-500">
                Your check-in for this meeting has been cancelled. If you
                change your mind, you can re-check in.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full inline-flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                Re-check in
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Permissions request state
  if (currentStep === "permissions") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="px-4 py-5 sm:p-6 text-center">
              <Shield className="mx-auto size-12 text-blue-500" />
              <h3 className="mt-2 text-base/7 font-medium text-gray-900">
                Location Permission Required
              </h3>
              <p className="mt-1 text-sm/6 text-gray-500">
                To complete your check-in, we need access to your location. This
                helps verify your attendance at the meeting venue.
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
              <h2 className="text-lg/7 font-semibold text-gray-900">
                {meeting.title}
              </h2>
              <div className="mt-2 text-sm/6 text-gray-500 space-y-2">
                <div className="flex items-center">
                  <Calendar className="size-4 mr-2" />
                  {getFormattedDateAndTime({
                    utc: meeting.start_datetime,
                  })}{" "}
                  - {getFormattedDateAndTime({ utc: meeting.end_datetime })}
                </div>
                <div className="flex items-center">
                  <Building2 className="size-4 mr-2" />
                  {meeting.address}
                </div>
              </div>

              <button
                onClick={handlePermissionsRequest}
                className="mt-6 w-full flex justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <MapPin className="mr-1.5 size-4" />
                Enable Location & Continue
              </button>

              <p className="mt-3 text-xs text-gray-500 text-center">
                Your location data is only used for attendance verification and
                is not shared with third parties.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Form state
  if (currentStep === "form") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="flex flex-col justify-center py-4 max-w-lg w-full overflow-hidden">
            <div className="flex flex-col items-center gap-4 sm:mx-auto sm:w-full sm:max-w-lg">
              <LogoVertical wordWidth={110} showWord={false} />
              <h2 className="text-center text-2xl/7 font-bold text-gray-900">
                Meeting Check-in
              </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
              <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
                <div className="pb-5 mb-5 border-b border-gray-200">
                  <h3 className="text-lg/7 font-medium text-gray-900">
                    {meeting.title}
                  </h3>
                  <div className="mt-2 text-sm/6 text-gray-500 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="size-4 mr-2" />
                      {getFormattedDateAndTime({
                        utc: meeting.start_datetime,
                      })}{" "}
                      - {getFormattedDateAndTime({ utc: meeting.end_datetime })}
                    </div>
                    {meeting.address && (
                      <div className="flex items-center">
                        <Building2 className="size-4 mr-2" />
                        {meeting.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Show validation errors */}
                {validationResult && !validationResult.isValid && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Please correct the following errors:
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {validationResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show validation warnings */}
                {validationResult && validationResult.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Please note:
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <ul className="list-disc pl-5 space-y-1">
                            {validationResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <GuestAttendeeForm
                  meetingId={meetingId}
                  isSubmitting={isSubmitting}
                  handleOnSubmit={handleFormToPreview}
                  attendeeForm={attendeeForm}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Preview state
  if (currentStep === "preview") {
    const formValues = attendeeForm.hook.getValues();

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg/7 font-medium text-gray-900 mb-4">
                Confirm Check-in Details
              </h3>

              {/* Meeting Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                <div className="mt-2 text-sm/6 text-gray-500 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="size-4 mr-2" />
                    {getFormattedDateAndTime({
                      utc: meeting.start_datetime,
                    })}{" "}
                    - {getFormattedDateAndTime({ utc: meeting.end_datetime })}
                  </div>
                  <div className="flex items-center">
                    <Building2 className="size-4 mr-2" />
                    {meeting.address}
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Your Information
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {formValues.first_name} {formValues.last_name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {formValues.email}
                  </p>
                  {formValues.organisation_name && (
                    <p>
                      <span className="font-medium">Organisation:</span>{" "}
                      {formValues.organisation_name}
                    </p>
                  )}
                  {formValues.division && (
                    <p>
                      <span className="font-medium">Division:</span>{" "}
                      {formValues.division}
                    </p>
                  )}
                  {formValues.occupation && (
                    <p>
                      <span className="font-medium">Job Title:</span>{" "}
                      {formValues.occupation}
                    </p>
                  )}
                </div>
              </div>

              {/* Location & Device Info */}
              {metadata && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Check-in Verification
                  </h4>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-start">
                      <MapPin className="size-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Device:</span>{" "}
                          {metadata.deviceInfo?.browser} on{" "}
                          {metadata.deviceInfo?.os}
                        </p>
                        {metadata.locationInfo?.address && (
                          <p>
                            <span className="font-medium">Location:</span>{" "}
                            {metadata.locationInfo.address}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={isSubmitting}
                  className="flex w-full justify-center items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-gray-400"
                >
                  <Mail className="mr-1.5 size-4" />
                  {isSubmitting
                    ? "Sending verification code..."
                    : "Email me a verification code"}
                </button>

                <button
                  onClick={() => setCurrentStep("form")}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  ← Back to edit details
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Awaiting OTP state — single-input OTP per Apple HIG and to avoid the
  // iOS 26.x split-six-input autocomplete="one-time-code" bug. The browser
  // will still surface the code in the keyboard suggestion bar when the
  // email arrives.
  if (currentStep === "awaiting_otp") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="px-4 py-5 sm:p-6 text-center">
              <Mail className="mx-auto size-12 text-blue-500" />
              <h3 className="mt-2 text-base/7 font-medium text-gray-900">
                Check your email
              </h3>
              <p className="mt-1 text-sm/6 text-gray-500">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-gray-700">
                  {otpEmailSentTo || "your email"}
                </span>
                . Enter it below to complete check-in.
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmitOtp();
                }}
              >
                <label
                  htmlFor="otp-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification code
                </label>
                <input
                  id="otp-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    const digitsOnly = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    setOtpCode(digitsOnly);
                    if (otpError) setOtpError(null);
                  }}
                  autoFocus
                  aria-invalid={!!otpError}
                  aria-describedby={otpError ? "otp-error" : undefined}
                  className="block w-full rounded-md border border-gray-300 px-3 py-3 text-center text-2xl font-mono tracking-[0.5em] focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="000000"
                />
                {otpError && (
                  <p
                    id="otp-error"
                    role="alert"
                    className="mt-2 text-sm text-red-600"
                  >
                    {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length !== 6}
                  className="mt-6 w-full flex justify-center items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-gray-400"
                >
                  <CheckCircle className="mr-1.5 size-4" />
                  {isSubmitting ? "Verifying..." : "Verify & Check in"}
                </button>
              </form>

              <div className="mt-4 flex flex-col items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => void handleResendOtp()}
                  disabled={isSubmitting}
                  className="text-primary hover:text-primary/80 disabled:text-gray-400 underline-offset-2 hover:underline"
                >
                  Send a new code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode("");
                    setOtpError(null);
                    setCurrentStep("form");
                  }}
                  disabled={isSubmitting}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back to edit details
                </button>
              </div>

              {otpExpiresAt && (
                <p className="mt-4 text-xs text-gray-400 text-center">
                  Code expires at{" "}
                  {new Date(otpExpiresAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  .
                </p>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success state
  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
            <div className="bg-green-50 px-4 py-5 sm:p-6 text-center">
              <CheckCircle className="mx-auto size-12 text-green-500" />
              <h3 className="mt-2 text-base/7 font-medium text-gray-900">
                Check-in Successful!
              </h3>
              <p className="mt-1 text-sm/6 text-gray-500">
                You have been successfully checked in to the meeting.
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl/7 font-semibold text-gray-900">
                {meeting.title}
              </h2>
              <div className="mt-2 text-sm/6 text-gray-500 space-y-2">
                <div className="flex items-center">
                  <Clock className="size-4 mr-2" />
                  {getFormattedDateAndTime({
                    utc: meeting.start_datetime,
                  })}{" "}
                  - {getFormattedDateAndTime({ utc: meeting.end_datetime })}
                </div>
                <div className="flex items-center">
                  <Building2 className="size-4 mr-2" />
                  {meeting.address}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
                <p className="text-sm/6 text-gray-500">
                  Thank you for confirming your attendance. Have a great
                  meeting!
                </p>
                <button
                  type="button"
                  onClick={handleStartFeedback}
                  className="w-full inline-flex justify-center items-center rounded-md bg-background px-3 py-2 text-sm font-medium text-primary border border-input hover:bg-accent hover:text-accent-foreground"
                >
                  <MessageSquare className="mr-1.5 size-4" />
                  Leave feedback
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

// Footer component
const Footer: FC = () => (
  <footer className="bg-white border-t border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500">
          © 2025 Tendiflow. All rights reserved.
        </p>
        <p className="text-sm text-gray-500">
          Built with ❤️ by{" "}
          <Link
            className="underline"
            target="_blank"
            href="https://meyabase.com"
          >
            meyabase.com
          </Link>
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Help
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Privacy
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Terms
          </a>
        </div>
      </div>
    </div>
  </footer>
);
