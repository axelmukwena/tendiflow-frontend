"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { Control } from "react-hook-form";

import { loginWithEmailPassword } from "@/api/services/tendiflow/oauth/fetchers";
import { ClientPathname } from "@/types/paths";
import { notify } from "@/utilities/helpers/toaster";

import { getLoginCreateData } from "../data";
import { LoginFormSchema } from "../schema";
import { UseLoginForm } from "../types";

interface UseLoginCreateProps {
  formHook: UseLoginForm;
}

interface UseLoginCreate {
  control: Control<LoginFormSchema>;
  isSubmitting: boolean;
  formErrorMessages: string[];
  handleOnSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleOnEnter: (e: KeyboardEvent<HTMLFormElement>) => void;
}

/**
 * Hook to handle login create form section
 * @param {UseLoginCreateProps} props - form hook, login, and handleMutateLogins function
 * @returns {UseLoginCreate} hook - object containing functions and states for login create form section
 */
export const useLoginCreate = ({
  formHook,
}: UseLoginCreateProps): UseLoginCreate => {
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
   * Function to handle login
   * @param {LoginFormSchema} values - form values
   * @returns {Promise<void>} - promise that resolves when the login is created
   */
  const handleLogin = async (values: LoginFormSchema): Promise<void> => {
    if (!isValid) {
      notify({
        type: "error",
        message:
          "One or more form fields are invalid. Please check all fields and try again.",
      });
      return;
    }

    setIsSubmitting(true);
    const data = getLoginCreateData({ values });
    const res = await loginWithEmailPassword({ data });
    if (res.success) {
      window.location.pathname = ClientPathname.HOME;
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
    await handleSubmit(handleLogin)();
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
