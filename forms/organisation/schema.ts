import { z } from "zod";

import {
  OrganisationIndustry,
  OrganisationSettingsDateFormat,
  OrganisationSettingsTimeFormat,
} from "@/api/services/tendiflow/organisations/types";

import { PHONE_NUMBER_OPTIONAL_SCHEMA } from "../phonenumber";
import { URL_OPTIONAL_FORM_SCHEMA } from "../url";

export const ORGANISATION_ADDRESS_SCHEMA = z
  .object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country_code: z.string().min(1, "Country code is required"),
    postal_code: z.string().min(1, "Postal code is required"),
  })
  .nullable();

export const ORGANISATION_SETTINGS_SCHEMA = z.object({
  require_location_for_checkin: z.boolean(),
  allow_guest_checkin: z.boolean(),
  default_meeting_duration: z
    .number()
    .min(1, "Meeting duration must be at least 1 minute")
    .max(1440, "Meeting duration cannot exceed 24 hours"),
  timezone: z.string().min(1, "Timezone is required"),
  date_format: z.enum(OrganisationSettingsDateFormat),
  time_format: z.enum(OrganisationSettingsTimeFormat),
  allow_meeting_edit_after_start: z.boolean(),
  allow_meeting_delete_after_start: z.boolean(),
});

export const ORGANISATION_FORM_SCHEMA = z.object({
  name: z
    .string()
    .min(1, "Organisation name is required")
    .max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").nullable(),
  contact_email: z.email({ error: "Invalid email format" }).nullable(),
  contact_phone_number: PHONE_NUMBER_OPTIONAL_SCHEMA,
  website_url: URL_OPTIONAL_FORM_SCHEMA,
  industry: z.enum(OrganisationIndustry, {
    message: "Please select a valid industry",
  }),
  address: ORGANISATION_ADDRESS_SCHEMA,
  settings: ORGANISATION_SETTINGS_SCHEMA,
});

export type OrganisationFormSchema = z.infer<typeof ORGANISATION_FORM_SCHEMA>;
export type OrganisationAddressFormSchema = z.infer<
  typeof ORGANISATION_ADDRESS_SCHEMA
>;
export type OrganisationSettingsFormSchema = z.infer<
  typeof ORGANISATION_SETTINGS_SCHEMA
>;
