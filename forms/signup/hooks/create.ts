"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { Control } from "react-hook-form";

import {
  loginWithEmailPassword,
  signup,
} from "@/api/services/tendiflow/oauth/fetchers";
import { LoginRequestClient } from "@/api/services/tendiflow/oauth/types";
import { requestEmailVerification } from "@/api/services/tendiflow/profile/fetchers";
import { ClientPathname } from "@/types/paths";
import { notify } from "@/utilities/helpers/toaster";

import { getSignupCreateData } from "../data";
import { SignupFormSchema } from "../schema";
import { UseSignupForm } from "../types";

interface UseSignupCreateProps {
  formHook: UseSignupForm;
}

interface UseSignupCreate {
  control: Control<SignupFormSchema>;
  isSubmitting: boolean;
  formErrorMessages: string[];
  handleOnSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleOnEnter: (e: KeyboardEvent<HTMLFormElement>) => void;
}

/**
 * Hook to handle signup create form section
 * @param {UseSignupCreateProps} props - form hook, signup, and handleMutateSignups function
 * @returns {UseSignupCreate} hook - object containing functions and states for signup create form section
 */
export const useSignupCreate = ({
  formHook,
}: UseSignupCreateProps): UseSignupCreate => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    hook: {
      control,
      handleSubmit,
      formState: { isValid },
    },
    formErrorMessages,
  } = formHook;

  /**
   * Function to handle signup
   * @param {SignupFormSchema} values - form values
   * @returns {Promise<void>} - promise that resolves when the signup is created
   */
  const handleSignup = async (values: SignupFormSchema): Promise<void> => {
    if (!isValid) {
      notify({
        type: "error",
        message:
          "One or more form fields are invalid. Please check all fields and try again.",
      });
      return;
    }

    setIsSubmitting(true);
    const data = getSignupCreateData({ values });
    const res = await signup({ data });
    if (res.success) {
      const signinBody: LoginRequestClient = {
        email: data.email,
        password: data.password,
      };
      const { data: oauthToken } = await loginWithEmailPassword({
        data: signinBody,
      });
      if (oauthToken) {
        await requestEmailVerification({
          data: { email: signinBody.email },
        });
      }
      window.location.href = `${window.location.origin}${ClientPathname.ACCOUNT_SETTINGS_VERIFY_EMAIL}`;
    } else {
      notify({ message: res.message, type: "error" });
    }

    setIsSubmitting(false);
  };

  const handleOnSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.stopPropagation();
    e.preventDefault();
    await handleSubmit(handleSignup)();
  };

  const handleOnEnter = (e: KeyboardEvent<HTMLFormElement>): void => {
    if (e.key === "Enter") {
      handleOnSubmit(e);
    }
  };

  return {
    control,
    isSubmitting,
    handleOnSubmit,
    handleOnEnter,
    formErrorMessages,
  };
};
