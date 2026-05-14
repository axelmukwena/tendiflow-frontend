import { Building2, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

import { Footer } from "../footer";

interface SuccessScreenProps {
  meeting: Meeting;
  onLeaveFeedback: () => void;
}

export const SuccessScreen: FC<SuccessScreenProps> = ({
  meeting,
  onLeaveFeedback,
}) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
        <div className="bg-green-50 px-4 py-5 sm:p-6 text-center">
          <CheckCircle className="mx-auto size-12 text-green-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            Check-in Successful!
          </h3>
          <p className="mt-1 text-sm/6 text-gray-500">
            You have been successfully checked in to the meeting.
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl/7 font-semibold text-gray-900">
            {meeting.title}
          </h2>
          <div className="mt-2 text-sm/6 text-gray-500 space-y-2">
            <div className="flex items-center">
              <Clock className="size-4 mr-2" />
              {getFormattedDateAndTime({ utc: meeting.start_datetime })} -{" "}
              {getFormattedDateAndTime({ utc: meeting.end_datetime })}
            </div>
            <div className="flex items-center">
              <Building2 className="size-4 mr-2" />
              {meeting.address}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4 space-y-3">
            <p className="text-sm/6 text-gray-500">
              Thank you for confirming your attendance. Have a great meeting!
            </p>
            <button
              type="button"
              onClick={onLeaveFeedback}
              className="w-full inline-flex justify-center items-center rounded-md bg-background px-3 py-2 text-sm font-medium text-primary border border-input hover:bg-accent hover:text-accent-foreground"
            >
              <MessageSquare className="mr-1.5 size-4" />
              Leave feedback
            </button>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
