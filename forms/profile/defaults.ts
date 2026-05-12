import { DefaultValues } from "react-hook-form";

import { Language } from "@/api/services/tendiflow/types/general";

import {
  EmailVerificationConfirmFormSchema,
  ProfileFormSchema,
} from "./schema";
import { ProfileFormDefaultValuesProps } from "./types";
interface EmailVerificationConfirmDefaultValuesProps {
  email: string;
}

/**
 * Get default values for email verification confirm form
 * @returns {DefaultValues<OauthSignupSchema>} - default values
 */
export const emailVerificationConfirmDefaultValues = ({
  email,
}: EmailVerificationConfirmDefaultValuesProps): DefaultValues<EmailVerificationConfirmFormSchema> =>
  ({
    email,
    code: "",
  }) as DefaultValues<EmailVerificationConfirmFormSchema>;

export const profileDefaultValues = ({
  user,
}: ProfileFormDefaultValuesProps): DefaultValues<ProfileFormSchema> => ({
  first_name: user?.first_name || "",
  last_name: user?.last_name || "",
  phone_number: user?.phone_number || null,
  organisation_name: user?.organisation_name || null,
  division: user?.division || null,
  occupation: user?.occupation || null,
  language: user?.language || Language.ENGLISH,
  avatar_url: user?.avatar_url || undefined,
});
