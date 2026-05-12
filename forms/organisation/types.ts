import { UseFormReturn } from "react-hook-form";

import { Organisation } from "@/api/services/tendiflow/organisations/types";

import { OrganisationFormSchema } from "./schema";

export interface UseOrganisationFormProps {
  organisation?: Organisation | null;
}

export interface OrganisationFormDefaultValuesProps {
  organisation?: Organisation | null;
}

export interface UseOrganisationForm {
  hook: UseFormReturn<OrganisationFormSchema>;
  formErrorMessages: string[];
  resetForm: () => void;
  updateForm: (a?: Organisation | null) => void;
}

export interface LoadOrganisationCreateData {
  values: OrganisationFormSchema;
}

export interface LoadOrganisationUpdateData {
  values: OrganisationFormSchema;
}
