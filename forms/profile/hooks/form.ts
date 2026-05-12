import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { User } from "@/api/services/tendiflow/users/types";
import { getFormErrorMessages } from "@/forms/general";

import { profileDefaultValues } from "../defaults";
import { PROFILE_FORM_SCHEMA, ProfileFormSchema } from "../schema";
import { UseProfileForm, UseProfileFormProps } from "../types";

/**
 * Hook to handle the organisation form
 * @returns {UseProfileForm} - the organisation form state
 */
export const useProfileForm = ({
  user,
}: UseProfileFormProps): UseProfileForm => {
  const hook = useForm<ProfileFormSchema>({
    resolver: zodResolver(PROFILE_FORM_SCHEMA),
    mode: "onChange",
    defaultValues: profileDefaultValues({ user }),
  });

  const formErrorMessages = getFormErrorMessages(hook.formState.errors);

  const resetForm = (): void => {
    hook.reset(profileDefaultValues({ user }));
  };

  const updateForm = (a?: User | null): void => {
    if (!a) {
      return;
    }
    hook.reset(profileDefaultValues({ user: a }));
  };

  return { hook, formErrorMessages, resetForm, updateForm };
};
