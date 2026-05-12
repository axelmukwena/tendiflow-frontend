import { UseFormReturn } from "react-hook-form";

import { Attendee } from "@/api/services/tendiflow/attendees/types";

import { AttendeeFormSchema } from "./schema";

export interface UseAttendeeFormProps {
  attendee?: Attendee | null;
  meetingId: string;
}

export interface AttendeeFormDefaultValuesProps {
  organisationId: string;
  attendee?: Attendee | null;
}

export interface UseAttendeeForm {
  organisationId: string;
  hook: UseFormReturn<AttendeeFormSchema>;
  formErrorMessages: string[];
  resetForm: () => void;
  updateForm: (a?: Attendee | null) => void;
}

export interface LoadAttendeeCreateData {
  values: AttendeeFormSchema;
}

export interface LoadAttendeeUpdateData {
  values: AttendeeFormSchema;
}
