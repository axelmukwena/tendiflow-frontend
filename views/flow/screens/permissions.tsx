import { Building2, Calendar, MapPin, Shield } from "lucide-react";
import { FC } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

import { Footer } from "../footer";

interface PermissionsScreenProps {
  meeting: Meeting;
  onRequestPermissions: () => void;
}

export const PermissionsScreen: FC<PermissionsScreenProps> = ({
  meeting,
  onRequestPermissions,
}) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
        <div className="px-4 py-5 sm:p-6 text-center">
          <Shield className="mx-auto size-12 text-blue-500" />
          <h3 className="mt-2 text-base/7 font-medium text-gray-900">
            Location Permission Required
          </h3>
          <p className="mt-1 text-sm/6 text-gray-500">
            To complete your check-in, we need access to your location. This
            helps verify your attendance at the meeting venue.
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <h2 className="text-lg/7 font-semibold text-gray-900">
            {meeting.title}
          </h2>
          <div className="mt-2 text-sm/6 text-gray-500 space-y-2">
            <div className="flex items-center">
              <Calendar className="size-4 mr-2" />
              {getFormattedDateAndTime({ utc: meeting.start_datetime })} -{" "}
              {getFormattedDateAndTime({ utc: meeting.end_datetime })}
            </div>
            <div className="flex items-center">
              <Building2 className="size-4 mr-2" />
              {meeting.address}
            </div>
          </div>

          <button
            onClick={onRequestPermissions}
            className="mt-6 w-full flex justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <MapPin className="mr-1.5 size-4" />
            Enable Location & Continue
          </button>

          <p className="mt-3 text-xs text-gray-500 text-center">
            Your location data is only used for attendance verification and is
            not shared with third parties.
          </p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
