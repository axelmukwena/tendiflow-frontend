import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Attendee } from "@/api/services/weaver/attendees/types";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getFormErrorMessages } from "@/forms/general";

import { attendeeFormDefaultValues } from "../defaults";
import { ATTENDEE_FORM_SCHEMA, AttendeeFormSchema } from "../schema";
import { UseAttendeeForm, UseAttendeeFormProps } from "../types";

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
