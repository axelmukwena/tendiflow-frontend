// forms/attendee/guest/components/GuestAttendeeForm.tsx

import { FC, Fragment } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { TextField } from "@/components/inputs/text";
import { Spinner } from "@/components/loaders/spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormErrorMessage,
  FormField,
  FormProvider,
  FormRow,
  FormSection,
} from "@/components/ui/form";
import { MultilineTextView } from "@/components/ui/view";
import { UseAttendeeForm } from "@/forms/attendee/types";

interface GuestAttendeeFormProps {
  meetingId: string;
  attendee?: Attendee | null;
  onCancel?: () => void;
  isSubmitting: boolean;
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  attendeeForm: UseAttendeeForm;
}

export const GuestAttendeeForm: FC<GuestAttendeeFormProps> = ({
  meetingId,
  attendee,
  isSubmitting,
  handleOnSubmit,
  attendeeForm,
}) => {
  const {
    hook: { control },
    formErrorMessages,
  } = attendeeForm;

  const isEditMode = Boolean(attendee);

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
                  helpText="Your first name"
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
                  helpText="Your last name"
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
                  helpText="Your email address"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Additional Information (Optional)">
          <FormRow>
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
                  helpText="Your contact phone number"
                />
              )}
            />
          </FormRow>

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
                  helpText="Your company or organisation"
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
                  helpText="Your division within the organisation"
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
                  label="Job Title"
                  helpText="Your job title or role"
                />
              )}
            />
          </FormRow>
        </FormSection>

        {/* Hidden field for meeting_id */}
        <FormField
          control={control}
          name="meeting_id"
          render={() => <input type="hidden" value={meetingId} />}
        />

        <div className="mt-6">
          {formErrorMessages && formErrorMessages?.length > 0 && (
            <FormErrorMessage>
              <MultilineTextView texts={formErrorMessages} />
            </FormErrorMessage>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <Button variant="default" type="submit" disabled={isSubmitting}>
              {!isSubmitting &&
                `${isEditMode ? "Update Information" : "Continue to Preview"}`}
              {isSubmitting && (
                <Fragment>
                  <Spinner className="mr-2 h-4 w-4" />
                  {isEditMode ? "Updating..." : "Processing..."}
                </Fragment>
              )}
            </Button>
          </div>
        </div>
      </Form>
    </FormProvider>
  );
};
