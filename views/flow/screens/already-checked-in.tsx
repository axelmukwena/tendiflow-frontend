import {
  AlertTriangle,
  Building2,
  Calendar,
  MessageSquare,
  Star,
  Trash2,
} from "lucide-react";
import { FC } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

import { Footer } from "../footer";

interface AlreadyCheckedInScreenProps {
  meeting: Meeting;
  sessionAttendee: Attendee | null;
  cancelConfirming: boolean;
  cancelSubmitting: boolean;
  cancelError: string | null;
  onStartFeedback: () => void;
  onShowCancelConfirm: () => void;
  onDismissCancelConfirm: () => void;
  onConfirmCancel: () => void;
}

export const AlreadyCheckedInScreen: FC<AlreadyCheckedInScreenProps> = ({
  meeting,
  sessionAttendee,
  cancelConfirming,
  cancelSubmitting,
  cancelError,
  onStartFeedback,
  onShowCancelConfirm,
  onDismissCancelConfirm,
  onConfirmCancel,
}) => {
  const existingFeedback = sessionAttendee?.feedback;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm max-w-md w-full overflow-hidden">
          <div className="bg-yellow-50 px-4 py-5 sm:p-6 text-center">
            <AlertTriangle className="mx-auto size-12 text-yellow-500" />
            <h3 className="mt-2 text-base/7 font-medium text-gray-900">
              Already Checked In
            </h3>
            <p className="mt-1 text-sm/6 text-gray-500">
              You&apos;re checked in to this meeting from this browser.
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-xl/7 font-semibold text-gray-900">
                {meeting.title}
              </h2>
              <div className="mt-2 text-sm/6 text-gray-500 space-y-2">
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

            {existingFeedback?.rating && (
              <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  Your feedback
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-4 ${
                        n <= (existingFeedback.rating ?? 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                {existingFeedback.comment && (
                  <p className="mt-2 text-sm text-gray-600 italic">
                    &ldquo;{existingFeedback.comment}&rdquo;
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={onStartFeedback}
                className="w-full flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <MessageSquare className="mr-1.5 size-4" />
                {existingFeedback?.rating ? "Update feedback" : "Leave feedback"}
              </button>

              {cancelConfirming ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-3">
                  <p className="text-sm text-red-800">
                    Cancel your check-in? You&apos;ll need to verify your email
                    again to re-check in.
                  </p>
                  {cancelError && (
                    <p className="text-xs text-red-700" role="alert">
                      {cancelError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onConfirmCancel}
                      disabled={cancelSubmitting}
                      className="flex-1 inline-flex justify-center items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 disabled:bg-gray-400"
                    >
                      {cancelSubmitting ? "Cancelling..." : "Yes, cancel"}
                    </button>
                    <button
                      type="button"
                      onClick={onDismissCancelConfirm}
                      disabled={cancelSubmitting}
                      className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                    >
                      Keep me in
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onShowCancelConfirm}
                  className="w-full inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-red-700 border border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-1.5 size-4" />
                  Cancel my check-in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
