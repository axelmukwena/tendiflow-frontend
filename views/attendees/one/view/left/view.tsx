import { FC } from "react";

import {
  AttendanceStatus,
  Attendee,
} from "@/api/services/tendiflow/attendees/types";
import { CustomFieldType } from "@/api/services/tendiflow/meetings/types";
import { BadgeDisplayRow } from "@/components/data-display/badge";
import { DataDisplayContainer } from "@/components/data-display/container";
import { DateDisplayRow } from "@/components/data-display/date";
import { EmailDisplayRow } from "@/components/data-display/email";
import { LinkDisplayRow } from "@/components/data-display/link";
import { PhonenumberDisplayRow } from "@/components/data-display/phonenumber";
import { TextDisplayRow } from "@/components/data-display/text";
import { Variant } from "@/types/general";
import { mergeTailwind } from "@/utilities/helpers/tailwind";

interface AttendeeContentViewProps {
  attendee: Attendee;
  className?: string;
}

export const AttendeeContentView: FC<AttendeeContentViewProps> = ({
  attendee,
  className = "",
}) => {
  const formatCustomFieldType = (type: CustomFieldType): string => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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

  const getAttendanceStatusVariant = (status: AttendanceStatus): Variant => {
    switch (status) {
      case AttendanceStatus.CHECKED_IN:
        return "default";
      case AttendanceStatus.CHECKED_IN_LATE:
        return "secondary";
      case AttendanceStatus.REGISTERED:
        return "outline";
      case AttendanceStatus.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatAttendanceStatus = (status: AttendanceStatus): string => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDeviceInfo = (device: any): string => {
    const parts = [device?.browser, device?.os, device?.device].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : "Unknown Device";
  };

  const formatCustomFieldValue = (
    value: any,
    type: CustomFieldType,
  ): string => {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case CustomFieldType.CHECKBOX:
        return value ? "Yes" : "No";
      case CustomFieldType.MONEY:
        return typeof value === "number"
          ? `$${value.toFixed(2)}`
          : value.toString();
      case CustomFieldType.DATE:
        return value ? new Date(value).toLocaleDateString() : "-";
      default:
        return value.toString();
    }
  };

  return (
    <div className={mergeTailwind("w-full", className)}>
      {/* Personal Information */}
      <DataDisplayContainer
        title="Personal Information"
        description="Basic attendee details and contact information"
        className="mb-8"
      >
        <TextDisplayRow
          label="Full Name"
          caption="Attendee's full name"
          value={`${attendee.first_name} ${attendee.last_name}`}
        />
        <EmailDisplayRow
          label="Email Address"
          caption="Primary email address"
          value={attendee.email}
        />
        {attendee.phone_number && (
          <PhonenumberDisplayRow
            label="Phone Number"
            caption="Contact phone number"
            value={attendee.phone_number}
          />
        )}
        <TextDisplayRow
          label="Organisation"
          caption="Company or organisation name"
          value={attendee.organisation_name}
        />
        <TextDisplayRow
          label="Division"
          caption="Division within the organisation"
          value={attendee.division}
        />
        <TextDisplayRow
          label="Occupation"
          caption="Job title or role"
          value={attendee.occupation}
        />
        <BadgeDisplayRow
          label="Database Status"
          caption="Current record status"
          value={attendee.database_status}
          variant={getDatabaseStatusVariant(attendee.database_status)}
        />
        <TextDisplayRow
          label="Attendee ID"
          caption="Unique identifier"
          value={attendee.id}
        />
      </DataDisplayContainer>

      {/* Attendance Information */}
      <DataDisplayContainer
        title="Attendance Status"
        description="Current attendance status and meeting association"
        className="mb-8"
      >
        <BadgeDisplayRow
          label="Attendance Status"
          caption="Current attendance state"
          value={formatAttendanceStatus(attendee.attendance_status)}
          variant={getAttendanceStatusVariant(attendee.attendance_status)}
        />

        {/* Meeting Information */}
        {attendee.meeting && (
          <>
            <LinkDisplayRow
              label="Meeting"
              caption="Associated meeting"
              value={attendee.meeting.title}
              href={`/meetings/${attendee.meeting_id}`}
              external={false}
            />
            <DateDisplayRow
              label="Meeting Start"
              caption="When the meeting starts"
              value={attendee.meeting.start_datetime}
              format="datetime"
            />
            <DateDisplayRow
              label="Meeting End"
              caption="When the meeting ends"
              value={attendee.meeting.end_datetime}
              format="datetime"
            />
            <TextDisplayRow
              label="Meeting Timezone"
              caption="Meeting timezone"
              value={attendee.meeting.timezone}
            />
            {attendee.meeting.address && (
              <TextDisplayRow
                label="Meeting Location"
                caption="Meeting venue"
                value={attendee.meeting.address}
              />
            )}
          </>
        )}

        {/* Organisation Information */}
        {attendee.organisation && (
          <LinkDisplayRow
            label="Organisation"
            caption="Associated organisation"
            value={attendee.organisation.name}
            href={`/organisations/${attendee.organisation_id}`}
            external={false}
          />
        )}
      </DataDisplayContainer>

      {/* Check-in Information */}
      {attendee.checkin && (
        <DataDisplayContainer
          title="Check-in Details"
          description="Information about when and where the attendee checked in"
          className="mb-8"
        >
          <DateDisplayRow
            label="Check-in Time"
            caption="When the attendee checked in"
            value={attendee.checkin.checkin_datetime}
            format="datetime"
          />
          <TextDisplayRow
            label="Device Fingerprint"
            caption="Unique device identifier"
            value={attendee.checkin.device_fingerprint}
          />
          <TextDisplayRow
            label="Session ID"
            caption="Check-in session identifier"
            value={attendee.checkin.session_id}
          />

          {/* Location Information */}
          {attendee.checkin.checkin_location && (
            <>
              <TextDisplayRow
                label="Check-in Location"
                caption="GPS coordinates where check-in occurred"
                value={`${attendee.checkin.checkin_location.latitude}, ${attendee.checkin.checkin_location.longitude}`}
              />
              <TextDisplayRow
                label="Location Address"
                caption="Address at check-in location"
                value={attendee.checkin.checkin_location.address}
              />
              <TextDisplayRow
                label="Location Accuracy"
                caption="GPS accuracy in meters"
                value={`${attendee.checkin.checkin_location.accuracy}m`}
              />
              <TextDisplayRow
                label="IP Address"
                caption="Network IP address during check-in"
                value={attendee.checkin.checkin_location.ip_address}
              />
            </>
          )}

          {/* Device Information */}
          {attendee.checkin.checkin_device && (
            <>
              <TextDisplayRow
                label="Device Info"
                caption="Browser and device details"
                value={formatDeviceInfo(attendee.checkin.checkin_device)}
              />
              <TextDisplayRow
                label="Screen Resolution"
                caption="Device screen size"
                value={attendee.checkin.checkin_device.screen_resolution}
              />
              <TextDisplayRow
                label="Device Timezone"
                caption="Device timezone setting"
                value={attendee.checkin.checkin_device.timezone}
              />
              <TextDisplayRow
                label="User Agent"
                caption="Full browser user agent string"
                value={attendee.checkin.checkin_device.user_agent}
                multiline={true}
              />
            </>
          )}
        </DataDisplayContainer>
      )}

      {!attendee.checkin && (
        <DataDisplayContainer
          title="Check-in Status"
          description="No check-in information available"
          className="mb-8"
        >
          <TextDisplayRow
            label="Check-in Status"
            caption="Attendee has not checked in"
          />
        </DataDisplayContainer>
      )}

      {/* Feedback Information */}
      {attendee.feedback && (
        <DataDisplayContainer
          title="Feedback"
          description="Attendee's feedback about the meeting"
          className="mb-8"
        >
          {attendee.feedback.rating && (
            <BadgeDisplayRow
              label="Rating"
              caption="Meeting rating (1-5 stars)"
              value={`${attendee.feedback.rating}/5 ⭐`}
              variant="default"
            />
          )}
          {attendee.feedback.comment && (
            <TextDisplayRow
              label="Comment"
              caption="Written feedback"
              value={attendee.feedback.comment}
              multiline={true}
            />
          )}
          {attendee.feedback.feedback_datetime && (
            <DateDisplayRow
              label="Feedback Submitted"
              caption="When feedback was provided"
              value={attendee.feedback.feedback_datetime}
              format="datetime"
            />
          )}
        </DataDisplayContainer>
      )}

      {!attendee.feedback && (
        <DataDisplayContainer
          title="Feedback Status"
          description="No feedback provided by the attendee"
          className="mb-8"
        >
          <TextDisplayRow
            label="Feedback Status"
            caption="Attendee has not provided feedback"
          />
        </DataDisplayContainer>
      )}

      {/* Custom Field Responses */}
      {attendee.custom_field_responses &&
        attendee.custom_field_responses.length > 0 && (
          <DataDisplayContainer
            title="Additional Information"
            description="Custom field responses from the attendee"
            className="mb-8"
          >
            {attendee.custom_field_responses.map((fieldResponse, index) => (
              <TextDisplayRow
                key={fieldResponse.customfield_id || index}
                label={fieldResponse.field_name}
                caption={`Type: ${formatCustomFieldType(fieldResponse.field_type)}`}
                value={formatCustomFieldValue(
                  fieldResponse.value,
                  fieldResponse.field_type,
                )}
                multiline={
                  fieldResponse.field_type === CustomFieldType.TEXTAREA
                }
              />
            ))}
          </DataDisplayContainer>
        )}

      {(!attendee.custom_field_responses ||
        attendee.custom_field_responses.length === 0) && (
        <DataDisplayContainer
          title="Custom Fields Status"
          description="No custom field responses provided"
          className="mb-8"
        >
          <TextDisplayRow
            label="Custom Fields Status"
            caption="Attendee has not provided any custom field responses"
          />
        </DataDisplayContainer>
      )}

      {/* System Information */}
      <DataDisplayContainer
        title="System Information"
        description="Creation and modification details"
      >
        <DateDisplayRow
          label="Registered"
          caption="When the attendee was registered"
          value={attendee.created_at}
          format="datetime"
        />
        <DateDisplayRow
          label="Last Updated"
          caption="When the record was last modified"
          value={attendee.updated_at}
          format="datetime"
        />
        <TextDisplayRow
          label="Created By"
          caption="User who registered the attendee"
          value={attendee.creator_id}
        />
        <TextDisplayRow
          label="Last Updated By"
          caption="User who last updated the record"
          value={attendee.updator_id}
        />
        <TextDisplayRow
          label="User Account"
          caption="Associated user account (if any)"
          value={attendee.user_id}
        />
        <TextDisplayRow
          label="Meeting ID"
          caption="Associated meeting identifier"
          value={attendee.meeting_id}
        />
        <TextDisplayRow
          label="Organisation ID"
          caption="Associated organisation identifier"
          value={attendee.organisation_id}
        />
      </DataDisplayContainer>
    </div>
  );
};
