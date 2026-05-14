import { Clock } from "lucide-react";
import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { CheckinValidationResult } from "@/forms/attendee/helpers";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

interface TimingErrorScreenProps {
  meeting: Meeting;
  validationResult: CheckinValidationResult | null;
}

export const TimingErrorScreen: FC<TimingErrorScreenProps> = ({
  meeting,
  validationResult,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <Clock className="mx-auto size-12 text-amber-500" />
      <h3 className="mt-2 text-base/7 font-medium text-gray-900">
        Check-in Not Available
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
    </div>
  </div>
);
