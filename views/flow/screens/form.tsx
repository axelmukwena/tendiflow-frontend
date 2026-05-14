import { AlertTriangle, Building2, Calendar, XCircle } from "lucide-react";
import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { LogoVertical } from "@/components/logos/vertical";
import { CheckinValidationResult } from "@/forms/attendee/helpers";
import { UseAttendeeForm } from "@/forms/attendee/types";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

import { Footer } from "../footer";
import { GuestAttendeeForm } from "../form";

interface FormScreenProps {
  meeting: Meeting;
  meetingId: string;
  attendeeForm: UseAttendeeForm;
  validationResult: CheckinValidationResult | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const FormScreen: FC<FormScreenProps> = ({
  meeting,
  meetingId,
  attendeeForm,
  validationResult,
  isSubmitting,
  onSubmit,
}) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="flex flex-col justify-center py-4 max-w-lg w-full overflow-hidden">
        <div className="flex flex-col items-center gap-4 sm:mx-auto sm:w-full sm:max-w-lg">
          <LogoVertical wordWidth={110} showWord={false} />
          <h2 className="text-center text-2xl/7 font-bold text-gray-900">
            Meeting Check-in
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10">
            <div className="pb-5 mb-5 border-b border-gray-200">
              <h3 className="text-lg/7 font-medium text-gray-900">
                {meeting.title}
              </h3>
              <div className="mt-2 text-sm/6 text-gray-500 space-y-1">
                <div className="flex items-center">
                  <Calendar className="size-4 mr-2" />
                  {getFormattedDateAndTime({ utc: meeting.start_datetime })} -{" "}
                  {getFormattedDateAndTime({ utc: meeting.end_datetime })}
                </div>
                {meeting.address && (
                  <div className="flex items-center">
                    <Building2 className="size-4 mr-2" />
                    {meeting.address}
                  </div>
                )}
              </div>
            </div>

            {validationResult && !validationResult.isValid && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please correct the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {validationResult && validationResult.warnings.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Please note:
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <GuestAttendeeForm
              meetingId={meetingId}
              isSubmitting={isSubmitting}
              handleOnSubmit={onSubmit}
              attendeeForm={attendeeForm}
            />
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
