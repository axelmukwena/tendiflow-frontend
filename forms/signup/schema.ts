import { z } from "zod";

import { Language } from "@/api/services/tendiflow/types/general";

import { PASSWORD_SCHEMA } from "../password";
import { PHONE_NUMBER_OPTIONAL_SCHEMA } from "../phonenumber";
import { URL_OPTIONAL_FORM_SCHEMA } from "../url";

export const SIGNUP_FORM_SCHEMA = z.object({
  email: z.email({ error: "Invalid email format" }),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  password: PASSWORD_SCHEMA,
  phone_number: PHONE_NUMBER_OPTIONAL_SCHEMA,
  avatar_url: URL_OPTIONAL_FORM_SCHEMA,
  organisation_name: z.string().optional(),
  division: z.string().optional(),
  occupation: z.string().optional(),
  language: z.enum(Language).optional(),
});

export type SignupFormSchema = z.infer<typeof SIGNUP_FORM_SCHEMA>;
