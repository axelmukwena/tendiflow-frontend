import { FC, Fragment } from "react";

import { User } from "@/api/services/tendiflow/users/types";
import { SelectField } from "@/components/inputs/select/selectfield";
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
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { MultilineTextView } from "@/components/ui/view";
import { useProfileForm } from "@/forms/profile/hooks/form";
import { useProfileUpdateForm } from "@/forms/profile/hooks/update";
import { LANGUAGE_OPTIONS } from "@/utilities/constants/options";
import { isUserActive } from "@/utilities/helpers/permissions";

interface ProfileFormProps {
  user?: User | null;
  handleMutateProfiles: () => void;
  setCloseDialog?: () => void;
}

export const ProfileForm: FC<ProfileFormProps> = ({
  user,
  handleMutateProfiles,
  setCloseDialog,
}) => {
  // --- THIS TOP SECTION IS UNCHANGED, AS REQUESTED ---
  const profileForm = useProfileForm({ user });
  const {
    hook: { control },
    formErrorMessages,
  } = profileForm;

  const handleMutate = (): void => {
    handleMutateProfiles();
  };

  const { isSubmitting, handleOnSubmit } = useProfileUpdateForm({
    profileForm,
    user,
    handleMutateUsers: handleMutate,
    setCloseDialog,
  });

  const isActiveForm = isUserActive(user?.status);

  return (
    <FormProvider {...profileForm.hook}>
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
                  helpText="Your given name."
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
                  helpText="Your family name."
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="avatar_url"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Avatar URL"
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  disabled={!isActiveForm}
                  helpText="A direct link to your profile picture."
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Contact Information">
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
                  placeholder="+1234567890"
                  disabled={!isActiveForm}
                  helpText="Primary phone number for contact."
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Professional Details">
          <FormRow>
            <FormField
              control={control}
              name="organisation_name"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Organisation Name"
                  placeholder="e.g., Acme Corporation"
                  disabled={!isActiveForm}
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
                  placeholder="e.g., Marketing"
                  disabled={!isActiveForm}
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
                  placeholder="e.g., Project Manager"
                  disabled={!isActiveForm}
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Preferences">
          <FormRow>
            <FormField
              control={control}
              name="language"
              render={({ field }) => (
                <SelectField
                  selected={field.value}
                  setSelected={field.onChange}
                  options={LANGUAGE_OPTIONS}
                  label="Language"
                  placeholder="Select a language"
                  required
                  disabled={!isActiveForm}
                  helpText="The display language for your account."
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
              {!isSubmitting && "Update Profile"}
              {isSubmitting && (
                <Fragment>
                  <Spinner className="mr-2 h-4 w-4" />
                  Updating Profile
                </Fragment>
              )}
            </Button>
          </div>
        </SheetFooter>
      </Form>
    </FormProvider>
  );
};
