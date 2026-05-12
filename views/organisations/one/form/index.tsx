import { FC, Fragment } from "react";

import { Organisation } from "@/api/services/tendiflow/organisations/types";
import { SelectField } from "@/components/inputs/select/selectfield";
import { SwitchField } from "@/components/inputs/switch";
import { TextField } from "@/components/inputs/text";
import { TextAreaField } from "@/components/inputs/textarea";
import { Spinner } from "@/components/loaders/spinner";
import { SelectCountryIso } from "@/components/select/select-country-iso";
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
import { useOrganisationForm } from "@/forms/organisation/hooks/form";
import { useOrganisationCreateUpdate } from "@/forms/organisation/hooks/upsert";
import { ORGANISATION_INDUSTRY_OPTIONS } from "@/utilities/constants/industry";
import {
  ORGANISATION_DATE_FORMAT_OPTIONS,
  ORGANISATION_TIME_FORMAT_OPTIONS,
} from "@/utilities/constants/options";
import { TIMEZONE_OPTIONS } from "@/utilities/constants/timezone";
import { isRecordActive } from "@/utilities/helpers/permissions";

interface OrganisationFormProps {
  organisation?: Organisation | null;
  handleMutateOrganisations: () => void;
  setCloseDialog?: () => void;
}

export const OrganisationForm: FC<OrganisationFormProps> = ({
  organisation,
  handleMutateOrganisations,
  setCloseDialog,
}) => {
  const organisationForm = useOrganisationForm({ organisation });
  const {
    hook: {
      control,
      formState: { errors },
    },
    formErrorMessages,
  } = organisationForm;

  const handleMutate = (): void => {
    handleMutateOrganisations();
  };

  const { isSubmitting, handleOnSubmit } = useOrganisationCreateUpdate({
    organisationForm,
    organisation,
    handleMutateOrganisations: handleMutate,
    setCloseDialog,
  });

  const isActiveForm = isRecordActive(organisation?.database_status);
  const isEditMode = Boolean(organisation);

  return (
    <FormProvider {...organisationForm.hook}>
      <Form onSubmit={handleOnSubmit}>
        <FormSection title="Basic Information">
          <FormRow>
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Organisation Name"
                  required
                  disabled={!isActiveForm}
                  helpText="The official name of your organisation"
                />
              )}
            />
            <FormField
              control={control}
              name="industry"
              render={({ field }) => (
                <SelectField
                  selected={field.value}
                  setSelected={field.onChange}
                  options={ORGANISATION_INDUSTRY_OPTIONS}
                  label="Industry"
                  placeholder="Select an industry"
                  required
                  disabled={!isActiveForm}
                  helpText="The primary industry sector of your organisation"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="website_url"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Website URL"
                  placeholder="https://www.example.com"
                  disabled={!isActiveForm}
                  helpText="The URL of your organisation's official website"
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
                  placeholder="Brief description of your organisation"
                  disabled={!isActiveForm}
                  helpText="A brief description of what your organisation does"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Contact Information">
          <FormRow>
            <FormField
              control={control}
              name="contact_email"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Contact Email"
                  placeholder="contact@example.com"
                  type="email"
                  disabled={!isActiveForm}
                  helpText="Primary email address for the organisation"
                />
              )}
            />
            <FormField
              control={control}
              name="contact_phone_number"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Contact Phone"
                  placeholder="+1234567890"
                  disabled={!isActiveForm}
                  helpText="Primary phone number for the organisation"
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Address">
          <FormRow>
            <FormField
              control={control}
              name="address.street"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Street Address"
                  placeholder="123 Main Street"
                  disabled={!isActiveForm}
                  helpText="Street address and number"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="address.city"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="City"
                  placeholder="New York"
                  disabled={!isActiveForm}
                />
              )}
            />
            <FormField
              control={control}
              name="address.state"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="State/Region"
                  placeholder="Khomas"
                  disabled={!isActiveForm}
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="address.country_code"
              render={({ field }) => (
                <SelectCountryIso
                  selectedCountryCode={field.value}
                  setSelectedCountryCode={field.onChange}
                  disabled={!isActiveForm}
                  error={errors.address?.country_code?.message}
                />
              )}
            />
            <FormField
              control={control}
              name="address.postal_code"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  label="Postal Code"
                  placeholder="9000"
                  disabled={!isActiveForm}
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Settings & Preferences">
          <FormRow>
            <FormField
              control={control}
              name="settings.timezone"
              render={({ field }) => (
                <SelectField
                  selected={field.value}
                  setSelected={field.onChange}
                  options={TIMEZONE_OPTIONS}
                  label="Timezone"
                  placeholder="Select timezone"
                  required
                  disabled={!isActiveForm}
                  helpText="Default timezone for the organisation"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.default_meeting_duration"
              render={({ field }) => (
                <TextField
                  field={field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value ? parseInt(value, 10) : "";
                    field.onChange(numericValue);
                  }}
                  onBlur={field.onBlur}
                  label="Default Meeting Duration"
                  type="number"
                  disabled={!isActiveForm}
                  helpText="Default meeting duration in minutes"
                />
              )}
            />
          </FormRow>
          <FormRow>
            <FormField
              control={control}
              name="settings.date_format"
              render={({ field }) => (
                <SelectField
                  selected={field.value}
                  setSelected={field.onChange}
                  options={ORGANISATION_DATE_FORMAT_OPTIONS}
                  label="Date Format"
                  placeholder="Select date format"
                  required
                  disabled={!isActiveForm}
                  helpText="Preferred date display format"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.time_format"
              render={({ field }) => (
                <SelectField
                  selected={field.value}
                  setSelected={field.onChange}
                  options={ORGANISATION_TIME_FORMAT_OPTIONS}
                  label="Time Format"
                  placeholder="Select time format"
                  required
                  disabled={!isActiveForm}
                  helpText="Preferred time display format"
                />
              )}
            />
          </FormRow>

          <div className="flex flex-col items-start gap-2">
            <FormField
              control={control}
              name="settings.require_location_for_checkin"
              render={({ field }) => (
                <SwitchField
                  field={field}
                  label="Require Location for Check-in"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isActiveForm}
                  helpText="Whether location is required for check-in"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.allow_guest_checkin"
              render={({ field }) => (
                <SwitchField
                  field={field}
                  label="Allow Guest Check-in"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isActiveForm}
                  helpText="Whether guests can check in"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.allow_meeting_edit_after_start"
              render={({ field }) => (
                <SwitchField
                  field={field}
                  label="Allow Meeting Edit After Start"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isActiveForm}
                  helpText="Whether meetings can be edited after they start"
                />
              )}
            />
            <FormField
              control={control}
              name="settings.allow_meeting_delete_after_start"
              render={({ field }) => (
                <SwitchField
                  field={field}
                  label="Allow Meeting Delete After Start"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isActiveForm}
                  helpText="Whether meetings can be deleted after they start"
                />
              )}
            />
          </div>
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
              {!isSubmitting &&
                `${isEditMode ? "Update" : "Create"} Organisation`}
              {isSubmitting && (
                <Fragment>
                  <Spinner className="mr-2 h-4 w-4" />
                  {isEditMode ? "Updating" : "Creating"} Organisation
                </Fragment>
              )}
            </Button>
          </div>
        </SheetFooter>
      </Form>
    </FormProvider>
  );
};
