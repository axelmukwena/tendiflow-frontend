import { FormEvent, KeyboardEvent } from "react";
import { FieldErrors, UseFormReturn } from "react-hook-form";

import { User } from "@/api/services/tendiflow/users/types";

import {
  EmailVerificationConfirmFormSchema,
  ProfileFormSchema,
} from "./schema";

export interface UseProfileFormProps {
  user?: User | null;
}

export interface ProfileFormDefaultValuesProps {
  user?: User | null;
}

export interface UseProfileForm {
  hook: UseFormReturn<ProfileFormSchema>;
  formErrorMessages: string[];
  resetForm: () => void;
  updateForm: (a?: User | null) => void;
}

export interface UseProfileUpdateForm {
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
}

export interface EmailVerificationConfirmFormSchemaSchemaUseFormProps {}

export interface EmailVerificationConfirmFormDefaultValuesProps {}

export interface UseEmailVerificationConfirmForm {
  hook: UseFormReturn<EmailVerificationConfirmFormSchema>;
  formErrorMessages: string[];
  errors: FieldErrors<EmailVerificationConfirmFormSchema>;
  resetForm: () => void;
  updateForm: () => void;
  handleOnSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  handleOnEnter: (e: KeyboardEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  handleResendCode: () => Promise<void>;
  isResending: boolean;
}

export interface LoadEmailVerificationConfirmCreateData {
  values: EmailVerificationConfirmFormSchema;
}
