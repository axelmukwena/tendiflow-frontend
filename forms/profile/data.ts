import { EmailVerificationConfirm } from "@/api/services/tendiflow/profile/types";
import { UserUpdate } from "@/api/services/tendiflow/users/types";

import { ProfileFormSchema } from "./schema";
import { LoadEmailVerificationConfirmCreateData } from "./types";

/**
 * Get the data to create an email verification confirmation request
 * @param {LoadEmailVerificationConfirmCreateData} data - The data
 * @returns {SignupRequestClient} - The data
 */
export const getSignupCreateData = ({
  values,
}: LoadEmailVerificationConfirmCreateData): EmailVerificationConfirm => {
  const data: EmailVerificationConfirm = {
    email: values.email,
    code: values.code,
  };
  return data;
};

interface GetProfileUpdateDataProps {
  values: ProfileFormSchema;
}

export const getProfileUpdateData = ({
  values,
}: GetProfileUpdateDataProps): UserUpdate => {
  return {
    first_name: values.first_name,
    last_name: values.last_name,
    phone_number: values.phone_number,
    organisation_name: values.organisation_name || null,
    division: values.division || null,
    occupation: values.occupation || null,
    language: values.language || null,
    avatar_url: values.avatar_url || null,
  };
};
