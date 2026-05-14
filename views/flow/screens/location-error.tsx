import { MapPin } from "lucide-react";
import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { CheckinValidationResult } from "@/forms/attendee/helpers";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

interface LocationErrorScreenProps {
  meeting: Meeting;
  validationResult: CheckinValidationResult | null;
}

export const LocationErrorScreen: FC<LocationErrorScreenProps> = ({
  meeting,
  validationResult,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <MapPin className="mx-auto size-12 text-red-500" />
      <h3 className="mt-2 text-base/7 font-medium text-gray-900">
        Location Verification Failed
      </h3>
      <div className="mt-1 text-sm/6 text-gray-500">
        {validationResult?.errors?.map((error, index) => (
          <p key={index} className="mt-1">
            {error}
          </p>
        ))}
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h4 className="font-medium text-gray-900">{meeting.title}</h4>
        <div className="mt-2 text-sm text-gray-600">
          <p>
            {getFormattedDateAndTime({ utc: meeting.start_datetime })} -{" "}
            {getFormattedDateAndTime({ utc: meeting.end_datetime })}
          </p>
          {meeting.address && <p className="mt-1">{meeting.address}</p>}
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    </div>
  </div>
);
