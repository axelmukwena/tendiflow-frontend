import { SignupRequestClient } from "@/api/services/tendiflow/oauth/types";

import { LoadSignupCreateData } from "./types";

/**
 * Get the data to create a signup
 * @param {LoadAssetCreateData} data - The data to create a signup
 * @returns {SignupRequestClient} - The data to create a signup
 */
export const getSignupCreateData = ({
  values,
}: LoadSignupCreateData): SignupRequestClient => {
  const data: SignupRequestClient = {
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    password: values.password,
    phone_number: values.phone_number || null,
    avatar_url: values.avatar_url || null,
    organisation_name: values.organisation_name || null,
    division: values.division || null,
    occupation: values.occupation || null,
    language: values.language || null,
  };
  return data;
};
