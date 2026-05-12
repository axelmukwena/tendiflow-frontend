"use client";

import { FormEvent, useState } from "react";

import { ProfileService } from "@/api/services/tendiflow/profile/service";
import { User } from "@/api/services/tendiflow/users/types";
import { useUserCredentials } from "@/hooks/profile/credentials";
import { notify } from "@/utilities/helpers/toaster";

import { getProfileUpdateData } from "../data";
import { ProfileFormSchema } from "../schema";
import { UseProfileForm, UseProfileUpdateForm } from "../types";

interface UseProfileUpdateProps {
  profileForm: UseProfileForm;
  user?: User | null;
  handleMutateUsers: () => void;
  setCloseDialog?: () => void;
}

/**
 * Hook to handle the user profile update form.
 * @returns {UseProfileUpdateForm} - The user profile update form state and handlers.
 */
export const useProfileUpdateForm = ({
  profileForm,
  user,
  handleMutateUsers,
}: UseProfileUpdateProps): UseProfileUpdateForm => {
  const { getIdToken } = useUserCredentials();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    hook: {
      handleSubmit,
      formState: { isValid },
    },
    updateForm,
  } = profileForm;

  /**
   * Handles the API call to update the user's profile.
   * @param {ProfileFormSchema} values - The validated form values.
   */
  const handleUpdateProfile = async (
    values: ProfileFormSchema,
  ): Promise<void> => {
    if (!user) {
      notify({
        type: "error",
        message: "User not found. Please log in again.",
      });
      return;
    }

    if (!isValid) {
      notify({
        type: "error",
        message:
          "One or more form fields are invalid. Please check and try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getIdToken();
      const profileService = new ProfileService(token);
      const data = getProfileUpdateData({ values });

      const res = await profileService.updateProfile({
        user_id: user.id,
        data,
      });

      if (res.success && res.data) {
        notify({ message: res.message, type: "success" });
        // Refresh the global user state
        handleMutateUsers();
        // Update the form with the new data from the server
        updateForm(res.data);
      } else {
        notify({ message: res.message, type: "error" });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      notify({ message: "An unexpected error occurred.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Wrapper function to handle the form's onSubmit event.
   * @param {FormEvent<HTMLFormElement>} e - The form event.
   */
  const handleOnSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    await handleSubmit(handleUpdateProfile)();
  };

  return {
    handleOnSubmit,
    isSubmitting,
  };
};
