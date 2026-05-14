import { Building2, Calendar, Mail, MapPin } from "lucide-react";
import { FC } from "react";

import {
  AttendeeCheckinDevice,
  AttendeeCheckinLocation,
} from "@/api/services/tendiflow/attendees/types";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { UseAttendeeForm } from "@/forms/attendee/types";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

import { Footer } from "../footer";

interface PreviewScreenProps {
  meeting: Meeting;
  attendeeForm: UseAttendeeForm;
  metadata: {
    locationInfo: AttendeeCheckinLocation;
    deviceInfo: AttendeeCheckinDevice;
  } | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export const PreviewScreen: FC<PreviewScreenProps> = ({
  meeting,
  attendeeForm,
  metadata,
  isSubmitting,
  onConfirm,
  onBack,
}) => {
  const formValues = attendeeForm.hook.getValues();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg/7 font-medium text-gray-900 mb-4">
              Confirm Check-in Details
            </h3>

            <div className="border-b border-gray-200 pb-4 mb-4">
              <h4 className="font-medium text-gray-900">{meeting.title}</h4>
              <div className="mt-2 text-sm/6 text-gray-500 space-y-1">
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
            </div>

            <div className="border-b border-gray-200 pb-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Your Information
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {formValues.first_name} {formValues.last_name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {formValues.email}
                </p>
                {formValues.organisation_name && (
                  <p>
                    <span className="font-medium">Organisation:</span>{" "}
                    {formValues.organisation_name}
                  </p>
                )}
                {formValues.division && (
                  <p>
                    <span className="font-medium">Division:</span>{" "}
                    {formValues.division}
                  </p>
                )}
                {formValues.occupation && (
                  <p>
                    <span className="font-medium">Job Title:</span>{" "}
                    {formValues.occupation}
                  </p>
                )}
              </div>
            </div>

            {metadata && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  Check-in Verification
                </h4>
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-start">
                    <MapPin className="size-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Device:</span>{" "}
                        {metadata.deviceInfo?.browser} on{" "}
                        {metadata.deviceInfo?.os}
                      </p>
                      {metadata.locationInfo?.address && (
                        <p>
                          <span className="font-medium">Location:</span>{" "}
                          {metadata.locationInfo.address}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Time:</span>{" "}
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex w-full justify-center items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-gray-400"
              >
                <Mail className="mr-1.5 size-4" />
                {isSubmitting
                  ? "Sending verification code..."
                  : "Email me a verification code"}
              </button>

              <button
                onClick={onBack}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                ← Back to edit details
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
