import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Organisation } from "@/api/services/tendiflow/organisations/types";
import { getFormErrorMessages } from "@/forms/general";

import { organisationFormDefaultValues } from "../defaults";
import { ORGANISATION_FORM_SCHEMA, OrganisationFormSchema } from "../schema";
import { UseOrganisationForm, UseOrganisationFormProps } from "../types";

/**
 * Hook to handle the organisation form
 * @returns {UseOrganisationForm} - the organisation form state
 */
export const useOrganisationForm = ({
  organisation,
}: UseOrganisationFormProps): UseOrganisationForm => {
  const hook = useForm<OrganisationFormSchema>({
    resolver: zodResolver(ORGANISATION_FORM_SCHEMA),
    mode: "onChange",
    defaultValues: organisationFormDefaultValues({
      organisation,
    }),
  });

  const formErrorMessages = getFormErrorMessages(hook.formState.errors);

  const resetForm = (): void => {
    hook.reset(
      organisationFormDefaultValues({
        organisation,
      }),
    );
  };

  const updateForm = (a?: Organisation | null): void => {
    if (!a) {
      return;
    }
    hook.reset(
      organisationFormDefaultValues({
        organisation: a,
      }),
    );
  };

  return { hook, formErrorMessages, resetForm, updateForm };
};
