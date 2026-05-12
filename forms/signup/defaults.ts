import { DefaultValues } from "react-hook-form";

import { Language } from "@/api/services/tendiflow/types/general";

import { SignupFormSchema } from "./schema";

/**
 * Get default values for oauth signup form
 * @returns {DefaultValues<OauthSignupSchema>} - default values for oauth signup form
 */
export const signupFormDefaultValues = (): DefaultValues<SignupFormSchema> => ({
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  phone_number: "",
  avatar_url: "",
  organisation_name: "",
  occupation: "",
  language: Language.ENGLISH,
});
