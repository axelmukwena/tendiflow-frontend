import {
  OrganisationCreate,
  OrganisationUpdate,
} from "@/api/services/tendiflow/organisations/types";

import {
  LoadOrganisationCreateData,
  LoadOrganisationUpdateData,
} from "./types";

/**
 * Get the data to create an organisation
 * @param {LoadOrganisationCreateData} data - The form data to create an organisation
 * @returns {OrganisationCreate} - The data formatted for organisation creation API
 */
export const getOrganisationCreateData = ({
  values,
}: LoadOrganisationCreateData): OrganisationCreate => {
  const data: OrganisationCreate = {
    name: values.name,
    description: values.description || null,
    contact_email: values.contact_email || null,
    contact_phone_number: values.contact_phone_number || null,
    website_url: values.website_url || null,
    industry: values.industry,
    address: values.address || null,
    settings: {
      require_location_for_checkin:
        values.settings.require_location_for_checkin,
      allow_guest_checkin: values.settings.allow_guest_checkin,
      default_meeting_duration: values.settings.default_meeting_duration,
      timezone: values.settings.timezone,
      date_format: values.settings.date_format,
      time_format: values.settings.time_format,
      allow_meeting_edit_after_start:
        values.settings.allow_meeting_edit_after_start,
      allow_meeting_delete_after_start:
        values.settings.allow_meeting_delete_after_start,
    },
  };
  return data;
};

/**
 * Get the data to update an organisation
 * @param {LoadOrganisationUpdateData} data - The form data to update an organisation
 * @returns {OrganisationUpdate} - The data formatted for organisation update API
 */
export const getOrganisationUpdateData = ({
  values,
}: LoadOrganisationUpdateData): OrganisationUpdate => {
  const data: OrganisationUpdate = {
    name: values.name,
    description: values.description || null,
    contact_email: values.contact_email || null,
    contact_phone_number: values.contact_phone_number || null,
    website_url: values.website_url || null,
    industry: values.industry,
    address: values.address || null,
    settings: {
      require_location_for_checkin:
        values.settings.require_location_for_checkin,
      allow_guest_checkin: values.settings.allow_guest_checkin,
      default_meeting_duration: values.settings.default_meeting_duration,
      timezone: values.settings.timezone,
      date_format: values.settings.date_format,
      time_format: values.settings.time_format,
      allow_meeting_edit_after_start:
        values.settings.allow_meeting_edit_after_start,
      allow_meeting_delete_after_start:
        values.settings.allow_meeting_delete_after_start,
    },
  };
  return data;
};
