import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getFormErrorMessages } from "@/forms/general";

import {
  attendeeFormDefaultValues,
  guestCheckinFormDefaultValues,
} from "../defaults";
import {
  ATTENDEE_FORM_SCHEMA,
  AttendeeFormSchema,
  GUEST_CHECKIN_FORM_SCHEMA,
  GuestCheckinFormSchema,
} from "../schema";
import {
  UseAttendeeForm,
  UseAttendeeFormProps,
  UseGuestCheckinAttendeeForm,
} from "../types";

/**
 * Hook to handle the attendee form
 * @returns {UseAttendeeForm} - the attendee form state
 */
export const useAttendeeForm = ({
  attendee,
  meetingId,
}: UseAttendeeFormProps): UseAttendeeForm => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const hook = useForm<AttendeeFormSchema>({
    resolver: zodResolver(ATTENDEE_FORM_SCHEMA),
    mode: "onChange",
    defaultValues: attendeeFormDefaultValues({
      meetingId,
      attendee,
    }),
  });

  const formErrorMessages = getFormErrorMessages(hook.formState.errors);

  const resetForm = (): void => {
    hook.reset(
      attendeeFormDefaultValues({
        meetingId,
        attendee,
      }),
    );
  };

  const updateForm = (a?: Attendee | null): void => {
    if (!a) {
      return;
    }
    hook.reset(
      attendeeFormDefaultValues({
        meetingId,
        attendee: a,
      }),
    );
  };

  return {
    organisationId: currentOrganisation?.id || "",
    hook,
    formErrorMessages,
    resetForm,
    updateForm,
  };
};

/**
 * Hook for the public guest check-in form (create-only, no edit mode).
 * Uses GUEST_CHECKIN_FORM_SCHEMA which requires phone_number (E.164) and
 * includes the OTP channel selector.
 */
export const useGuestCheckinAttendeeForm = ({
  meetingId,
}: {
  meetingId: string;
}): UseGuestCheckinAttendeeForm => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const hook = useForm<GuestCheckinFormSchema>({
    resolver: zodResolver(GUEST_CHECKIN_FORM_SCHEMA),
    mode: "onChange",
    defaultValues: guestCheckinFormDefaultValues({ meetingId }),
  });

  const formErrorMessages = getFormErrorMessages(hook.formState.errors);

  const resetForm = (): void => {
    hook.reset(guestCheckinFormDefaultValues({ meetingId }));
  };

  const updateForm = (a?: Attendee | null): void => {
    if (!a) {
      return;
    }
    hook.reset({
      ...guestCheckinFormDefaultValues({ meetingId }),
      email: a.email || "",
      first_name: a.first_name || "",
      last_name: a.last_name || "",
      phone_number: a.phone_number || "",
    });
  };

  return {
    organisationId: currentOrganisation?.id || "",
    hook,
    formErrorMessages,
    resetForm,
    updateForm,
  };
};
