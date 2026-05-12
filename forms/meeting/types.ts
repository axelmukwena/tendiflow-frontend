import { UseFormReturn } from "react-hook-form";

import { Meeting } from "@/api/services/tendiflow/meetings/types";

import { MeetingFormSchema } from "./schema";

export interface UseMeetingFormProps {
  meeting?: Meeting | null;
}

export interface MeetingFormDefaultValuesProps {
  organisationId: string;
  meeting?: Meeting | null;
}

export interface UseMeetingForm {
  organisationId: string;
  hook: UseFormReturn<MeetingFormSchema>;
  formErrorMessages: string[];
  resetForm: () => void;
  updateForm: (a?: Meeting | null) => void;
}

export interface LoadMeetingCreateData {
  values: MeetingFormSchema;
}

export interface LoadMeetingUpdateData {
  values: MeetingFormSchema;
}
