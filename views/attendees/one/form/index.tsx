import { FC, Fragment } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { CustomFieldType } from "@/api/services/tendiflow/meetings/types";
import { SelectField } from "@/components/inputs/select/selectfield";
import { TextField } from "@/components/inputs/text";
import { TextAreaField } from "@/components/inputs/textarea";
import { Spinner } from "@/components/loaders/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAttendeeForm } from "@/forms/attendee/hooks/form";
import { useAttendeeCreateUpdate } from "@/forms/attendee/hooks/upsert";
import {
  ATTENDANCE_STATUS_OPTIONS,
  ATTENDEE_FEEDBACK_RATING_OPTIONS,
} from "@/utilities/constants/options";
import { isRecordActive } from "@/utilities/helpers/permissions";

interface AttendeeFormProps {
  meetingId: string;
  attendee?: Attendee | null;
  handleMutateAttendees: () => void;
  setCloseDialog?: () => void;
  showAdvancedFields?: boolean;
}

export const AttendeeForm: FC<AttendeeFormProps> = ({
  meetingId,
  attendee,
  handleMutateAttendees,
  setCloseDialog,
  showAdvancedFields = false,
}) => {
  const attendeeForm = useAttendeeForm({ meetingId, attendee });
  const {
    hook: { control, watch },
    formErrorMessages,
  } = attendeeForm;

  const handleMutate = (): void => {
    handleMutateAttendees();
  };

  const { isSubmitting, handleOnSubmit } = useAttendeeCreateUpdate({
    attendeeForm,
    attendee,
    handleMutateAttendees: handleMutate,
    setCloseDialog,
  });

  const isActiveForm = isRecordActive(attendee?.database_status);
  const isEditMode = Boolean(attendee);

  // Watch for dynamic form changes
  const customFieldResponses = watch("custom_field_responses");

  return (
    <FormProvider {...attendeeForm.hook}>
      <Form onSubmit={handleOnSubmit}>
        <FormSection title="Personal Information">
          <FormRow>
            <FormField
              control={control}
              name="first_name"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="First Name"
                  required
                  disabled={!isActiveForm}
                  helpText="Attendee's first name"
                />
              )}
            />
            <FormField
              control={control}
              name="last_name"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Last Name"
                  required
                  disabled={!isActiveForm}
                  helpText="Attendee's last name"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Email Address"
                  type="email"
                  required
                  disabled={!isActiveForm}
                  helpText="Primary email address"
                />
              )}
            />
            <FormField
              control={control}
              name="phone_number"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Phone Number"
                  type="tel"
                  disabled={!isActiveForm}
                  helpText="Contact phone number (optional)"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Professional Information">
          <FormRow>
            <FormField
              control={control}
              name="organisation_name"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Organisation"
                  disabled={!isActiveForm}
                  helpText="Company or organisation name (optional)"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="division"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Division"
                  disabled={!isActiveForm}
                  helpText="Department or division (optional)"
                />
              )}
            />
            <FormField
              control={control}
              name="occupation"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Occupation"
                  disabled={!isActiveForm}
                  helpText="Job title or occupation (optional)"
                />
              )}
            />
          </FormRow>
        </FormSection>

        {showAdvancedFields && (
          <FormSection title="Attendance Status">
            <FormRow>
              <FormField
                control={control}
                name="attendance_status"
                render={({ field }) => (
                  <SelectField
                    selected={field.value}
                    setSelected={field.onChange}
                    options={ATTENDANCE_STATUS_OPTIONS}
                    label="Attendance Status"
                    placeholder="Select status"
                    disabled={!isActiveForm}
                    helpText="Current attendance status"
                  />
                )}
              />
              {attendee && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Meeting</label>
                  <Badge variant="outline" className="w-fit">
                    {attendee.meeting?.title || meetingId}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Associated meeting
                  </span>
                </div>
              )}
            </FormRow>
          </FormSection>
        )}

        {showAdvancedFields && (
          <FormSection title="Feedback">
            <FormRow>
              <FormField
                control={control}
                name="feedback.rating"
                render={({ field }) => (
                  <SelectField
                    selected={field.value?.toString()}
                    setSelected={(value) =>
                      field.onChange(value ? parseInt(value) : null)
                    }
                    options={ATTENDEE_FEEDBACK_RATING_OPTIONS}
                    label="Rating"
                    placeholder="Select rating"
                    disabled={!isActiveForm}
                    helpText="Rate the meeting experience (1-5)"
                  />
                )}
              />
            </FormRow>
            <FormRow>
              <FormField
                control={control}
                name="feedback.comment"
                render={({ field }) => (
                  <TextAreaField
                    field={field}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    label="Feedback Comment"
                    placeholder="Share your thoughts about the meeting..."
                    disabled={!isActiveForm}
                    helpText="Additional comments or feedback"
                  />
                )}
              />
            </FormRow>
          </FormSection>
        )}

        {/* Custom Field Responses */}
        {customFieldResponses && customFieldResponses.length > 0 && (
          <FormSection title="Additional Information">
            {customFieldResponses.map((fieldResponse, index) => (
              <FormRow key={fieldResponse.customfield_id || index}>
                <FormField
                  control={control}
                  name={`custom_field_responses.${index}.value`}
                  render={({ field }) => {
                    const fieldType = fieldResponse.field_type;
                    const fieldName = fieldResponse.field_name;

                    // Render different input types based on field type
                    switch (fieldType) {
                      case CustomFieldType.TEXTAREA:
                        return (
                          <TextAreaField
                            field={field}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            label={fieldName}
                            disabled={!isActiveForm}
                          />
                        );
                      case CustomFieldType.EMAIL:
                        return (
                          <TextField
                            field={field}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            label={fieldName}
                            type="email"
                            disabled={!isActiveForm}
                          />
                        );
                      case CustomFieldType.PHONE:
                        return (
                          <TextField
                            field={field}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            label={fieldName}
                            type="tel"
                            disabled={!isActiveForm}
                          />
                        );
                      case CustomFieldType.NUMBER:
                        return (
                          <TextField
                            field={field}
                            onChange={(e) => {
                              const value = e.target.value;
                              const numericValue = value
                                ? parseFloat(value)
                                : null;
                              field.onChange(numericValue);
                            }}
                            onBlur={field.onBlur}
                            label={fieldName}
                            type="number"
                            disabled={!isActiveForm}
                          />
                        );
                      case CustomFieldType.URL:
                        return (
                          <TextField
                            field={field}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            label={fieldName}
                            type="url"
                            disabled={!isActiveForm}
                          />
                        );
                      default:
                        return (
                          <TextField
                            field={field}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            label={fieldName}
                            disabled={!isActiveForm}
                          />
                        );
                    }
                  }}
                />

                {/* Hidden fields to maintain field structure */}
                <FormField
                  control={control}
                  name={`custom_field_responses.${index}.customfield_id`}
                  render={() => <input type="hidden" />}
                />
                <FormField
                  control={control}
                  name={`custom_field_responses.${index}.field_name`}
                  render={() => <input type="hidden" />}
                />
                <FormField
                  control={control}
                  name={`custom_field_responses.${index}.field_type`}
                  render={() => <input type="hidden" />}
                />
              </FormRow>
            ))}
          </FormSection>
        )}

        {/* Hidden field for meeting_id */}
        <FormField
          control={control}
          name="meeting_id"
          render={() => <input type="hidden" value={meetingId} />}
        />

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
              {!isSubmitting &&
                `${isEditMode ? "Update" : "Register"} Attendee`}
              {isSubmitting && (
                <Fragment>
                  <Spinner className="mr-2 h-4 w-4" />
                  {isEditMode ? "Updating" : "Registering"} Attendee
                </Fragment>
              )}
            </Button>
          </div>
        </SheetFooter>
      </Form>
    </FormProvider>
  );
};
