import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Meeting } from "@/api/services/weaver/meetings/types";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { getFormErrorMessages } from "@/forms/general";

import { meetingFormDefaultValues } from "../defaults";
import { MEETING_FORM_SCHEMA, MeetingFormSchema } from "../schema";
import { UseMeetingForm, UseMeetingFormProps } from "../types";

/**
 * Hook to handle the meeting form
 * @returns {UseMeetingForm} - the meeting form state
 */
export const useMeetingForm = ({
  meeting,
}: UseMeetingFormProps): UseMeetingForm => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const hook = useForm<MeetingFormSchema>({
    // @ts-expect-error - zodResolver type mismatch with MeetingFormSchema
    resolver: zodResolver(MEETING_FORM_SCHEMA),
    mode: "onChange",
    defaultValues: meetingFormDefaultValues({
      meeting,
    }),
  });

  const formErrorMessages = getFormErrorMessages(hook.formState.errors);

  const resetForm = (): void => {
    hook.reset(
      meetingFormDefaultValues({
        meeting,
      }),
    );
  };

  const updateForm = (a?: Meeting | null): void => {
    if (!a) {
      return;
    }
    hook.reset(
      meetingFormDefaultValues({
        meeting: a,
      }),
    );
  };

  return {
    organisationId: currentOrganisation?.id || "",
    // @ts-expect-error - zodResolver type mismatch with MeetingFormSchema
    hook,
    formErrorMessages,
    resetForm,
    updateForm,
  };
};
