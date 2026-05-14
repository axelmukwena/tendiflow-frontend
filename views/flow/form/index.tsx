// forms/attendee/guest/components/GuestAttendeeForm.tsx

import { FC, Fragment } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { TextField } from "@/components/inputs/text";
import { Spinner } from "@/components/loaders/spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  FormRow,
  FormSection,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { MultilineTextView } from "@/components/ui/view";
import { UseGuestCheckinAttendeeForm } from "@/forms/attendee/types";

interface GuestAttendeeFormProps {
  meetingId: string;
  attendee?: Attendee | null;
  onCancel?: () => void;
  isSubmitting: boolean;
  handleOnSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  attendeeForm: UseGuestCheckinAttendeeForm;
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

          <FormRow>
            <FormField
              control={control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value ?? ""}
                      onChange={(v: string | undefined) =>
                        field.onChange(v ?? "")
                      }
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>

          <FormRow>
            <FormField
              control={control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Where should we send your verification code? *
                  </FormLabel>
                  <div className="flex gap-4 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.name}
                        value="email"
                        checked={field.value === "email"}
                        onChange={() => field.onChange("email")}
                        onBlur={field.onBlur}
                        className="accent-primary"
                      />
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.name}
                        value="sms"
                        checked={field.value === "sms"}
                        onChange={() => field.onChange("sms")}
                        onBlur={field.onBlur}
                        className="accent-primary"
                      />
                      <span className="text-sm">SMS</span>
                    </label>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Additional Information (Optional)">
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
