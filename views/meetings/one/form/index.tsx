import { FC, Fragment } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { DatePickerField } from "@/components/inputs/datepicker";
import { SelectField } from "@/components/inputs/select/selectfield";
import { SwitchField } from "@/components/inputs/switch";
import { TextField } from "@/components/inputs/text";
import { TextAreaField } from "@/components/inputs/textarea";
import { Spinner } from "@/components/loaders/spinner";
import { Button } from "@/components/ui/button";
import { DateTimeFormat } from "@/components/ui/datepicker";
import {
  Form,
  FormErrorMessage,
  FormField,
  FormProvider,
  FormRow,
  FormSection,
} from "@/components/ui/form";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { MultilineTextView } from "@/components/ui/view";
import { useMeetingForm } from "@/forms/meeting/hooks/form";
import { useMeetingCreateUpdate } from "@/forms/meeting/hooks/upsert";
import { TIMEZONE_OPTIONS } from "@/utilities/constants/timezone";
import { isRecordActive } from "@/utilities/helpers/permissions";

interface MeetingFormProps {
  meeting?: Meeting | null;
  handleMutateMeetings: () => void;
  setCloseDialog?: () => void;
}

export const MeetingForm: FC<MeetingFormProps> = ({
  meeting,
  handleMutateMeetings,
  setCloseDialog,
}) => {
  const meetingForm = useMeetingForm({ meeting });
  const {
    hook: {
      control,
      formState: { errors },
    },
    formErrorMessages,
  } = meetingForm;

  const handleMutate = (): void => {
    handleMutateMeetings();
  };

  const { isSubmitting, handleOnSubmit } = useMeetingCreateUpdate({
    meetingForm,
    meeting,
    handleMutateMeetings: handleMutate,
    setCloseDialog,
  });

  const isActiveForm = isRecordActive(meeting?.database_status);
  const isEditMode = Boolean(meeting);

  return (
    <FormProvider {...meetingForm.hook}>
      <Form onSubmit={handleOnSubmit}>
        <FormSection title="Basic Information">
          <FormRow>
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Meeting Title"
                  required
                  disabled={!isActiveForm}
                  helpText="The title of your meeting"
                />
              )}
            />
            <FormField
              control={control}
              name="expected_attendees"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value ? parseInt(value, 10) : null;
                    field.onChange(numericValue);
                  }}
                  onBlur={field.onBlur}
                  label="Expected Attendees"
                  type="number"
                  placeholder="50"
                  disabled={!isActiveForm}
                  helpText="Number of expected attendees"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <TextAreaField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Description"
                  placeholder="Brief description of your meeting"
                  disabled={!isActiveForm}
                  helpText="A brief description of what the meeting is about"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Date & Time">
          <FormRow>
            <FormField
              control={control}
              name="start_datetime"
              render={({ field }) => (
                <DatePickerField
                  selectedDateTime={field.value ? new Date(field.value) : null}
                  setSelectedDateTime={(newDate: Date | null) => {
                    field.onChange(newDate ? newDate.toISOString() : "");
                  }}
                  label="Start Date & Time"
                  includeTime={true}
                  format={DateTimeFormat.DATE_ONLY}
                  disabled={!isActiveForm}
                  helpText="When the meeting starts"
                  error={errors.start_datetime?.message}
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="end_datetime"
              render={({ field }) => (
                <DatePickerField
                  selectedDateTime={field.value ? new Date(field.value) : null}
                  setSelectedDateTime={(newDate: Date | null) => {
                    field.onChange(newDate ? newDate.toISOString() : "");
                  }}
                  label="End Date & Time"
                  includeTime={true}
                  format={DateTimeFormat.DATE_ONLY}
                  disabled={!isActiveForm}
                  helpText="When the meeting ends"
                  error={errors.end_datetime?.message}
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="timezone"
              render={({ field }) => (
                <SelectField
                  selected={field.value}
                  setSelected={field.onChange}
                  options={TIMEZONE_OPTIONS}
                  label="Timezone"
                  placeholder="Select timezone"
                  required
                  disabled={!isActiveForm}
                  helpText="Timezone for the meeting"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Location">
          <FormRow>
            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <TextAreaField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Address"
                  placeholder="123 Main Street, City, State, Country"
                  disabled={!isActiveForm}
                  helpText="Full address where the meeting will take place"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="coordinates.latitude"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Latitude"
                  disabled={!isActiveForm}
                  helpText="Latitude coordinate (optional)"
                />
              )}
            />
            <FormField
              control={control}
              name="coordinates.longitude"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Longitude"
                  disabled={!isActiveForm}
                  helpText="Longitude coordinate (optional)"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Attendee Management">
          <FormRow>
            <FormField
              control={control}
              name="tags"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const tagArray = value
                      ? value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                      : null;
                    field.onChange(tagArray);
                  }}
                  onBlur={field.onBlur}
                  label="Tags"
                  placeholder="tag1, tag2, tag3"
                  disabled={!isActiveForm}
                  helpText="Tags for categorizing the meeting (comma-separated)"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Meeting Settings">
          <FormRow>
            <FormField
              control={control}
              name="settings.checkin_radius_meters"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value ? parseInt(value, 10) : null;
                    field.onChange(numericValue);
                  }}
                  onBlur={field.onBlur}
                  label="Check-in Radius (meters)"
                  type="number"
                  placeholder="100"
                  disabled={!isActiveForm}
                  helpText="Required radius for location-based check-in"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.checkin_window_seconds"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value ? parseInt(value, 10) : null;
                    field.onChange(numericValue);
                  }}
                  onBlur={field.onBlur}
                  label="Check-in Window (seconds)"
                  type="number"
                  placeholder="1800"
                  disabled={!isActiveForm}
                  helpText="How long before start attendees can check in (30 minutes = 1800 seconds)"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="settings.late_checkin_seconds"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value ? parseInt(value, 10) : null;
                    field.onChange(numericValue);
                  }}
                  onBlur={field.onBlur}
                  label="Late Check-in Window (seconds)"
                  type="number"
                  placeholder="900"
                  disabled={!isActiveForm}
                  helpText="How long after start late check-ins are allowed (15 minutes = 900 seconds)"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.feedback_window_seconds"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value ? parseInt(value, 10) : null;
                    field.onChange(numericValue);
                  }}
                  onBlur={field.onBlur}
                  label="Feedback Window (seconds)"
                  type="number"
                  placeholder="3600"
                  disabled={!isActiveForm}
                  helpText="How long after end feedback can be submitted (1 hour = 3600 seconds)"
                />
              )}
            />
          </FormRow>

          <div className="flex flex-col items-start gap-2">
            <FormField
              control={control}
              name="settings.require_location_verification"
              render={({ field }) => (
                <SwitchField
                  field={field}
                  label="Require Location Verification"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isActiveForm}
                  helpText="Whether attendees must be at the correct location to check in"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.send_reminders"
              render={({ field }) => (
                <SwitchField
                  field={field}
                  label="Send Reminders"
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  disabled={!isActiveForm}
                  helpText="Whether to send automated meeting reminders"
                />
              )}
            />
          </div>
        </FormSection>

        <FormSection title="Additional Information">
          <FormRow>
            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <TextAreaField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Notes"
                  placeholder="Any additional notes about the meeting"
                  disabled={!isActiveForm}
                  helpText="Internal notes about the meeting"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <SheetFooter>
          {formErrorMessages && formErrorMessages?.length > 0 && (
            <FormErrorMessage>
              <MultilineTextView texts={formErrorMessages} />
            </FormErrorMessage>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <SheetClose asChild>
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting || !!formErrorMessages.length}
              >
                Cancel
              </Button>
            </SheetClose>
            <Button variant="default" type="submit" disabled={isSubmitting}>
              {!isSubmitting && `${isEditMode ? "Update" : "Create"} Meeting`}
              {isSubmitting && (
                <Fragment>
                  <Spinner className="mr-2 h-4 w-4" />
                  {isEditMode ? "Updating" : "Creating"} Meeting
                </Fragment>
              )}
            </Button>
          </div>
        </SheetFooter>
      </Form>
    </FormProvider>
  );
};
