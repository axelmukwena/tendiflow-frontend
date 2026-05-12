import { LoginRequestClient } from "@/api/services/tendiflow/oauth/types";

import { LoadLoginCreateData } from "./types";

/**
 * Get the data to create a login
 * @param {LoadAssetCreateData} data - The data to create a login
 * @returns {LoginRequestClient} - The data to create a login
 */
export const getLoginCreateData = ({
  values,
}: LoadLoginCreateData): LoginRequestClient => {
  const data: LoginRequestClient = {
    email: values.email,
    password: values.password,
  };
  return data;
};
