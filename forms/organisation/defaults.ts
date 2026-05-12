import { DefaultValues } from "react-hook-form";

import {
  OrganisationIndustry,
  OrganisationSettingsDateFormat,
  OrganisationSettingsTimeFormat,
} from "@/api/services/tendiflow/organisations/types";

import { OrganisationFormSchema } from "./schema";
import { OrganisationFormDefaultValuesProps } from "./types";

/**
 * Get default values for oauth organisation form
 * @returns {DefaultValues<OauthOrganisationSchema>} - default values for oauth organisation form
 */
export const organisationFormDefaultValues = ({
  organisation,
}: OrganisationFormDefaultValuesProps): DefaultValues<OrganisationFormSchema> => ({
  name: organisation?.name || "",
  description: organisation?.description || "",
  contact_email: organisation?.contact_email || "",
  contact_phone_number: organisation?.contact_phone_number || null,
  website_url: organisation?.website_url || "",
  industry: organisation?.industry || OrganisationIndustry.OTHER,
  address: organisation?.address || {
    street: "",
    city: "",
    state: "",
    country_code: "",
    postal_code: "",
  },
  settings: organisation?.settings || {
    require_location_for_checkin: true,
    allow_guest_checkin: true,
    default_meeting_duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    date_format: OrganisationSettingsDateFormat.DD_MM_YYYY,
    time_format: OrganisationSettingsTimeFormat.TWENTY_FOUR_HOUR,
    allow_meeting_edit_after_start: true,
    allow_meeting_delete_after_start: false,
  },
});
