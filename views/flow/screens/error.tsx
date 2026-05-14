import { XCircle } from "lucide-react";
import { FC } from "react";

import { CheckinValidationResult } from "@/forms/attendee/helpers";

interface ErrorScreenProps {
  meetingError: string | null;
  validationResult: CheckinValidationResult | null;
}

export const ErrorScreen: FC<ErrorScreenProps> = ({
  meetingError,
  validationResult,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <XCircle className="mx-auto size-12 text-red-500" />
      <h3 className="mt-2 text-base/7 font-medium text-gray-900">
        {meetingError ? "Meeting Not Found" : "Check-in Error"}
      </h3>
      <div className="mt-1 text-sm/6 text-gray-500">
        {meetingError && <p>{meetingError}</p>}
        {validationResult?.errors?.map((error, index) => (
          <p key={index} className="mt-1">
            {error}
          </p>
        ))}
        {!meetingError && !validationResult?.errors?.length && (
          <p>Sorry, something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  </div>
);
