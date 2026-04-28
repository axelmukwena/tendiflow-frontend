"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useState } from "react";
import { useForm } from "react-hook-form";

import { requestEmailVerification } from "@/api/services/weaver/profile/fetchers";
import { ProfileNoTokenService } from "@/api/services/weaver/profile/notoken.service";
import { getFormErrorMessages } from "@/forms/general";
import { usePreviousPathname } from "@/hooks/utilities/previous-pathname";
import { useCurrentUserContext } from "@/contexts/current-user";
import { ClientPathname } from "@/types/paths";
import { notify } from "@/utilities/helpers/toaster";

import { getSignupCreateData } from "../data";
import { emailVerificationConfirmDefaultValues } from "../defaults";
import {
  EMAIL_VERIFICATION_CONFIRM_FORM_SCHEMA,
  EmailVerificationConfirmFormSchema,
} from "../schema";
import { UseEmailVerificationConfirmForm } from "../types";

/**
 * Hook to handle the email verification confirm form
 * @returns {UseEmailVerificationConfirmForm} - the email verification confirm form state
 */
export const useEmailVerificationConfirmForm =
  (): UseEmailVerificationConfirmForm => {
    const { currentUser, mutateCurrentUser } = useCurrentUserContext();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isResending, setIsResending] = useState<boolean>(false);
    const router = useRouter();
    const { previousPathname } = usePreviousPathname();

    const hook = useForm<EmailVerificationConfirmFormSchema>({
      resolver: zodResolver(EMAIL_VERIFICATION_CONFIRM_FORM_SCHEMA),
      mode: "onChange",
      defaultValues: emailVerificationConfirmDefaultValues({
        email: currentUser?.email || "",
      }),
    });
    const {
      handleSubmit,
      formState: { isValid, errors },
      reset,
    } = hook;

    const formErrorMessages = getFormErrorMessages(errors);

    const resetForm = (): void => {
      reset(
        emailVerificationConfirmDefaultValues({
          email: currentUser?.email || "",
        }),
      );
    };

    const updateForm = (): void => {
      reset(
        emailVerificationConfirmDefaultValues({
          email: currentUser?.email || "",
        }),
      );
    };

    /**
     * Function to handle signup
     * @param {EmailVerificationConfirmFormSchema} values - form values
     * @returns {Promise<void>} - promise that resolves when the signup is created
     */
    const handleEmailVerificationConfirm = async (
      values: EmailVerificationConfirmFormSchema,
    ): Promise<void> => {
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
      const profileService = new ProfileNoTokenService();
      const res = await profileService.confirmEmailVerification({
        data,
      });

      if (res.success) {
        notify({ message: res.message, type: "success" });
        mutateCurrentUser();
        router.push(previousPathname || ClientPathname.HOME);
      } else {
        notify({ message: res.message, type: "error" });
      }

      setIsSubmitting(false);
    };

    const handleResendCode = async (): Promise<void> => {
      setIsResending(true);
      resetForm();

      if (!currentUser) {
        notify({
          message: "No user found. Please log in again.",
          type: "error",
        });
        return;
      }

      try {
        const res = await requestEmailVerification({
          data: { email: currentUser.email },
        });

        if (res.success) {
          notify({ message: res.message, type: "success" });
        } else {
          notify({ message: res.message, type: "error" });
        }
      } catch {
        notify({
          message: "Failed to resend code. Please try again.",
          type: "error",
        });
      } finally {
        setIsResending(false);
      }
    };

    const handleOnSubmit = async (
      e: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
      e.stopPropagation();
      e.preventDefault();
      await handleSubmit(handleEmailVerificationConfirm)();
    };

    const handleOnEnter = (e: KeyboardEvent<HTMLFormElement>): void => {
      if (e.key === "Enter") {
        handleOnSubmit(e);
      }
    };

    return {
      hook,
      formErrorMessages,
      resetForm,
      updateForm,
      handleOnSubmit,
      handleOnEnter,
      isSubmitting,
      handleResendCode,
      isResending,
      errors,
    };
  };
