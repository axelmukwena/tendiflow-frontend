import { FC } from "react";

import { CustomFieldType, Meeting } from "@/api/services/tendiflow/meetings/types";
import { AddressDisplayRow } from "@/components/data-display/address";
import { BadgeDisplayRow } from "@/components/data-display/badge";
import { DataDisplayContainer } from "@/components/data-display/container";
import { DateDisplayRow } from "@/components/data-display/date";
import { ImagesDisplayRow } from "@/components/data-display/images";
import { LinkDisplayRow } from "@/components/data-display/link";
import { ListDisplayRow } from "@/components/data-display/list";
import { TextDisplayRow } from "@/components/data-display/text";
import { Variant } from "@/types/general";
import { mergeTailwind } from "@/utilities/helpers/tailwind";

interface MeetingContentViewProps {
  meeting: Meeting;
  className?: string;
}

export const MeetingContentView: FC<MeetingContentViewProps> = ({
  meeting,
  className = "",
}) => {
  const formatCustomFieldType = (type: CustomFieldType): string => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatRecurringFrequency = (frequency: string): string => {
    return frequency
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
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

  const getBooleanVariant = (value: boolean): Variant => {
    return value ? "default" : "secondary";
  };

  const formatDuration = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  return (
    <div className={mergeTailwind("w-full", className)}>
      {/* Basic Information */}
      <DataDisplayContainer
        title="Meeting Details"
        description="Basic information about the meeting"
        className="mb-8"
      >
        <TextDisplayRow
          label="Meeting Title"
          caption="The title of the meeting"
          value={meeting.title}
        />
        <TextDisplayRow
          label="Description"
          caption="Brief description of the meeting"
          value={meeting.description}
          multiline={true}
        />
        <DateDisplayRow
          label="Start Date & Time"
          caption="When the meeting starts"
          value={meeting.start_datetime}
          format="datetime"
        />
        <DateDisplayRow
          label="End Date & Time"
          caption="When the meeting ends"
          value={meeting.end_datetime}
          format="datetime"
        />
        <TextDisplayRow
          label="Duration"
          caption="Length of the meeting"
          value={formatDuration(meeting.start_datetime, meeting.end_datetime)}
        />
        <TextDisplayRow
          label="Timezone"
          caption="Meeting timezone"
          value={meeting.timezone}
        />
        <TextDisplayRow
          label="Expected Attendees"
          caption="Number of expected attendees"
          value={meeting.expected_attendees?.toString()}
        />
        <BadgeDisplayRow
          label="Status"
          caption="Current database status"
          value={meeting.database_status}
          variant={getDatabaseStatusVariant(meeting.database_status)}
        />
        <TextDisplayRow
          label="Meeting ID"
          caption="Unique identifier"
          value={meeting.id}
        />
      </DataDisplayContainer>

      {/* Address & Location */}
      {(meeting.address || meeting.coordinates) && (
        <DataDisplayContainer
          title="Location"
          description="Meeting location and address information"
          className="mb-8"
        >
          {meeting.address && (
            <AddressDisplayRow
              label="Address"
              caption="Meeting venue address"
              address={meeting.address}
              showMapLink={true}
            />
          )}
          {meeting.coordinates && (
            <TextDisplayRow
              label="Coordinates"
              caption="Latitude and longitude"
              value={`${meeting.coordinates.latitude}, ${meeting.coordinates.longitude}`}
            />
          )}
        </DataDisplayContainer>
      )}

      {/* Meeting Settings */}
      <DataDisplayContainer
        title="Meeting Settings"
        description="Configuration and access controls for the meeting"
        className="mb-8"
      >
        <BadgeDisplayRow
          label="Location Verification Required"
          caption="Whether attendees must be at the correct location"
          value={
            meeting.settings.require_location_verification
              ? "Required"
              : "Not Required"
          }
          variant={getBooleanVariant(
            meeting.settings.require_location_verification,
          )}
        />
        <TextDisplayRow
          label="Check-in Radius"
          caption="Required radius for location check-in (meters)"
          value={meeting.settings.checkin_radius_meters?.toString()}
        />
        <TextDisplayRow
          label="Check-in Window"
          caption="How long before start attendees can check in (seconds)"
          value={meeting.settings.checkin_window_seconds?.toString()}
        />
        <TextDisplayRow
          label="Late Check-in Window"
          caption="How long after start late check-ins are allowed (seconds)"
          value={meeting.settings.late_checkin_seconds?.toString()}
        />
        <TextDisplayRow
          label="Feedback Window"
          caption="How long after end feedback can be submitted (seconds)"
          value={meeting.settings.feedback_window_seconds?.toString()}
        />
        <BadgeDisplayRow
          label="Send Reminders"
          caption="Whether automated reminders are enabled"
          value={meeting.settings.send_reminders ? "Enabled" : "Disabled"}
          variant={getBooleanVariant(meeting.settings.send_reminders || false)}
        />
        {meeting.settings.reminder_intervals && (
          <ListDisplayRow
            label="Reminder Intervals"
            caption="When reminders are sent (seconds before meeting)"
            items={meeting.settings.reminder_intervals.map(
              (interval) => `${interval}s`,
            )}
          />
        )}
      </DataDisplayContainer>

      {/* Recurring Pattern */}
      {meeting.recurring_pattern && (
        <DataDisplayContainer
          title="Recurring Pattern"
          description="How this meeting repeats"
          className="mb-8"
        >
          <BadgeDisplayRow
            label="Frequency"
            caption="How often the meeting repeats"
            value={formatRecurringFrequency(
              meeting.recurring_pattern.frequency,
            )}
            variant="outline"
          />
          <TextDisplayRow
            label="Interval"
            caption="Repeat every N periods"
            value={meeting.recurring_pattern.interval.toString()}
          />
          {meeting.recurring_pattern.days_of_week && (
            <ListDisplayRow
              label="Days of Week"
              caption="Which days of the week (0=Sunday, 6=Saturday)"
              items={meeting.recurring_pattern.days_of_week.map((day) =>
                day.toString(),
              )}
            />
          )}
          <TextDisplayRow
            label="Day of Month"
            caption="Which day of the month for monthly recurring"
            value={meeting.recurring_pattern.day_of_month?.toString()}
          />
          <DateDisplayRow
            label="End Date"
            caption="When the recurring pattern ends"
            value={meeting.recurring_pattern.end_date}
            format="date"
          />
          <TextDisplayRow
            label="Max Occurrences"
            caption="Maximum number of occurrences"
            value={meeting.recurring_pattern.max_occurrences.toString()}
          />
        </DataDisplayContainer>
      )}

      {/* Custom Fields */}
      {meeting.custom_fields && meeting.custom_fields.length > 0 && (
        <DataDisplayContainer
          title="Custom Fields"
          description="Additional form fields for this meeting"
          className="mb-8"
        >
          {meeting.custom_fields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              <TextDisplayRow
                label={`Field ${index + 1}: ${field.label}`}
                caption={`Type: ${formatCustomFieldType(field.field_type)} | Required: ${field.is_required ? "Yes" : "No"}`}
                value={field.field_name}
              />
              {field.placeholder && (
                <TextDisplayRow label="Placeholder" value={field.placeholder} />
              )}
              {field.options && (
                <ListDisplayRow label="Options" items={field.options} />
              )}
            </div>
          ))}
        </DataDisplayContainer>
      )}

      {/* Tags & Notes */}
      {(meeting.tags || meeting.notes) && (
        <DataDisplayContainer
          title="Additional Information"
          description="Tags and notes for the meeting"
          className="mb-8"
        >
          {meeting.tags && (
            <ListDisplayRow
              label="Tags"
              caption="Labels and categories for this meeting"
              items={meeting.tags}
            />
          )}
          <TextDisplayRow
            label="Notes"
            caption="Additional notes about the meeting"
            value={meeting.notes}
            multiline={true}
          />
        </DataDisplayContainer>
      )}

      {/* Files & Media - Updated to use ImagesDisplayRow */}
      {(meeting.image ||
        (meeting.attachments && meeting.attachments.length > 0)) && (
        <DataDisplayContainer
          title="Files & Media"
          description="QR codes, images, and attachments"
          className="mb-8"
        >
          {/* Meeting Image using ImagesDisplayRow */}
          {meeting.image && (
            <ImagesDisplayRow
              label="Meeting Image"
              caption="Primary image associated with this meeting"
              images={[meeting.image]}
              gridCols={2}
              showMetadata={true}
            />
          )}

          {/* All Attachments (including images) using ImagesDisplayRow */}
          {meeting.attachments && meeting.attachments.length > 0 && (
            <>
              <ImagesDisplayRow
                label="Image Attachments"
                caption="Images attached to this meeting"
                images={meeting.attachments}
                gridCols={3}
                maxImages={6}
                showMetadata={true}
              />

              {/* Non-image attachments as links */}
              <div className="space-y-2">
                <TextDisplayRow
                  label="Other Attachments"
                  caption={`${meeting.attachments.filter((file) => !["image/png", "image/jpeg", "image/gif", "image/webp", "image/tiff", "image/svg+xml", "image/x-icon", "image/bmp"].includes(file.mime_type)).length} non-image file(s)`}
                  value=""
                />
                {meeting.attachments
                  .filter(
                    (file) =>
                      ![
                        "image/png",
                        "image/jpeg",
                        "image/gif",
                        "image/webp",
                        "image/tiff",
                        "image/svg+xml",
                        "image/x-icon",
                        "image/bmp",
                      ].includes(file.mime_type),
                  )
                  .map((file) => (
                    <LinkDisplayRow
                      key={file.id}
                      label={file.name}
                      caption={`${file.mime_type} • ${Math.round(file.size_bytes / 1024)}KB`}
                      value={file.name}
                      href={file.pathname}
                      external={true}
                    />
                  ))}
              </div>
            </>
          )}
        </DataDisplayContainer>
      )}

      {/* Metadata */}
      <DataDisplayContainer
        title="Metadata"
        description="Creation and modification information"
      >
        <DateDisplayRow
          label="Created"
          caption="When the meeting was first created"
          value={meeting.created_at}
          format="datetime"
        />
        <DateDisplayRow
          label="Last Updated"
          caption="When the meeting was last modified"
          value={meeting.updated_at}
          format="datetime"
        />
        <TextDisplayRow
          label="Created By"
          caption="User who created the meeting"
          value={meeting.creator_id}
        />
        <TextDisplayRow
          label="Last Updated By"
          caption="User who last updated the meeting"
          value={meeting.updator_id}
        />
        {meeting.parent_meeting_id && (
          <TextDisplayRow
            label="Parent Meeting"
            caption="Parent meeting for recurring series"
            value={meeting.parent_meeting_id}
          />
        )}
        <TextDisplayRow
          label="Organisation"
          caption="Organisation this meeting belongs to"
          value={meeting.organisation_id}
        />
      </DataDisplayContainer>
    </div>
  );
};
