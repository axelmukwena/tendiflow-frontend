import { FC } from "react";

import {
  OrganisationIndustry,
  OrganisationSettingsDateFormat,
  OrganisationSettingsTimeFormat,
} from "@/api/services/tendiflow/organisations/types";
import { AddressDisplayRow } from "@/components/data-display/address";
import { BadgeDisplayRow } from "@/components/data-display/badge";
import { DataDisplayContainer } from "@/components/data-display/container";
import { DateDisplayRow } from "@/components/data-display/date";
import { EmailDisplayRow } from "@/components/data-display/email";
import { LinkDisplayRow } from "@/components/data-display/link";
import { PhonenumberDisplayRow } from "@/components/data-display/phonenumber";
import { TextDisplayRow } from "@/components/data-display/text";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { Variant } from "@/types/general";
import { mergeTailwind } from "@/utilities/helpers/tailwind";

interface OrganisationContentViewProps {
  className?: string;
}

export const OrganisationContentView: FC<OrganisationContentViewProps> = ({
  className = "",
}) => {
  const { currentOrganisation, isLoading, error } =
    useCurrentOrganisationContext();

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-6 text-center`}>
        <div className="text-red-600 text-sm">
          Error loading organisation: {error}
        </div>
      </div>
    );
  }

  if (!currentOrganisation) {
    return (
      <div className={`${className} p-6 text-center`}>
        <div className="text-gray-500 text-sm">No organisation selected</div>
      </div>
    );
  }

  const formatIndustry = (industry: OrganisationIndustry): string => {
    return industry.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDateFormat = (format: OrganisationSettingsDateFormat): string => {
    return format.replace(/_/g, "/");
  };

  const formatTimeFormat = (format: OrganisationSettingsTimeFormat): string => {
    return format === OrganisationSettingsTimeFormat.TWELVE_HOUR
      ? "12 Hour"
      : "24 Hour";
  };

  const getDatabaseStatusVariant = (status: string): Variant => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "archived":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className={mergeTailwind(className, "w-full")}>
      {/* Basic Information */}
      <DataDisplayContainer
        title="Organisation Details"
        description="Basic information about the organisation"
        className="mb-8"
      >
        <TextDisplayRow
          label="Organisation Name"
          caption="The official name of the organisation"
          value={currentOrganisation.name}
        />
        <BadgeDisplayRow
          label="Industry"
          caption="The primary industry sector"
          value={formatIndustry(currentOrganisation.industry)}
          variant="outline"
        />
        <TextDisplayRow
          label="Description"
          caption="Brief description of the organisation"
          value={currentOrganisation.description}
          multiline={true}
        />
        <LinkDisplayRow
          label="Website"
          caption="Official website URL"
          value={currentOrganisation.website_url}
          external={true}
        />
        <BadgeDisplayRow
          label="Status"
          caption="Current database status"
          value={currentOrganisation.database_status}
          variant={getDatabaseStatusVariant(
            currentOrganisation.database_status,
          )}
        />
        <EmailDisplayRow
          label="Contact Email Address"
          caption="Primary contact email"
          value={currentOrganisation.contact_email}
        />
        <PhonenumberDisplayRow
          label="Contact Phone Number"
          caption="Primary contact number"
          value={currentOrganisation.contact_phone_number}
        />
        <TextDisplayRow
          label="Organisation ID"
          caption="Unique identifier"
          value={currentOrganisation.id}
        />
      </DataDisplayContainer>

      {/* Address Information */}
      {currentOrganisation.address && (
        <DataDisplayContainer
          title="Address"
          description="Physical location of the organisation"
          className="mb-8"
        >
          <AddressDisplayRow
            label="Business Address"
            caption="Main office or headquarters location"
            address={{
              street: currentOrganisation.address.street,
              city: currentOrganisation.address.city,
              state: currentOrganisation.address.state,
              country: currentOrganisation.address.country_code,
              postal_code: currentOrganisation.address.postal_code,
            }}
            showMapLink={true}
          />
        </DataDisplayContainer>
      )}

      {/* Organisation Settings */}
      <DataDisplayContainer
        title="Settings & Preferences"
        description="Organisation-specific configurations and preferences"
        className="mb-8"
      >
        <TextDisplayRow
          label="Timezone"
          caption="Default timezone for the organisation"
          value={currentOrganisation.settings.timezone}
        />
        <TextDisplayRow
          label="Date Format"
          caption="Preferred date display format"
          value={formatDateFormat(currentOrganisation.settings.date_format)}
        />
        <TextDisplayRow
          label="Time Format"
          caption="Preferred time display format"
          value={formatTimeFormat(currentOrganisation.settings.time_format)}
        />
        <TextDisplayRow
          label="Default Meeting Duration"
          caption="Default length for new meetings (minutes)"
          value={`${currentOrganisation.settings.default_meeting_duration} minutes`}
        />
        <BadgeDisplayRow
          label="Location Required for Check-in"
          caption="Whether location is required for check-in"
          value={
            currentOrganisation.settings.require_location_for_checkin
              ? "Required"
              : "Optional"
          }
          variant={
            currentOrganisation.settings.require_location_for_checkin
              ? "default"
              : "secondary"
          }
        />
        <BadgeDisplayRow
          label="Guest Check-in Allowed"
          caption="Whether guests can check in"
          value={
            currentOrganisation.settings.allow_guest_checkin
              ? "Allowed"
              : "Not Allowed"
          }
          variant={
            currentOrganisation.settings.allow_guest_checkin
              ? "default"
              : "secondary"
          }
        />
        <BadgeDisplayRow
          label="Edit Meetings After Start"
          caption="Can meetings be edited after they start"
          value={
            currentOrganisation.settings.allow_meeting_edit_after_start
              ? "Allowed"
              : "Not Allowed"
          }
          variant={
            currentOrganisation.settings.allow_meeting_edit_after_start
              ? "default"
              : "secondary"
          }
        />
        <BadgeDisplayRow
          label="Delete Meetings After Start"
          caption="Can meetings be deleted after they start"
          value={
            currentOrganisation.settings.allow_meeting_delete_after_start
              ? "Allowed"
              : "Not Allowed"
          }
          variant={
            currentOrganisation.settings.allow_meeting_delete_after_start
              ? "default"
              : "secondary"
          }
        />
      </DataDisplayContainer>

      {/* Metadata */}
      <DataDisplayContainer
        title="Metadata"
        description="Creation and modification information"
      >
        <DateDisplayRow
          label="Created"
          caption="When the organisation was first created"
          value={currentOrganisation.created_at}
          format="datetime"
        />
        <DateDisplayRow
          label="Last Updated"
          caption="When the organisation was last modified"
          value={currentOrganisation.updated_at}
          format="datetime"
        />
        <TextDisplayRow
          label="Created By"
          caption="User who created the organisation"
          value={currentOrganisation.creator_id}
        />
        <TextDisplayRow
          label="Last Updated By"
          caption="User who last updated the organisation"
          value={currentOrganisation.updator_id}
        />
      </DataDisplayContainer>
    </div>
  );
};
