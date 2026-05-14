"use client";

import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { FC } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { useAttendeeUser } from "@/hooks/profile/attendee/one";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

import { AttendeeStatusBadge } from "../many/table/status";

interface ProfileAttendeeOneContentProps {
  attendeeId: string;
}

export const ProfileAttendeeOneContent: FC<ProfileAttendeeOneContentProps> = ({
  attendeeId,
}) => {
  const { attendee, isLoading, error } = useAttendeeUser({
    attendanceId: attendeeId,
  });

  if (isLoading) {
    return <ProfileAttendeeOneSkeleton />;
  }

  if (error || !attendee) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">
          {error || "Couldn't find this attendance record."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <MeetingCard attendee={attendee} />
      <CheckinCard attendee={attendee} />
      <FeedbackCard attendee={attendee} />
    </div>
  );
};

const MeetingCard: FC<{ attendee: Attendee }> = ({ attendee }) => {
  const { meeting, organisation, attendance_status } = attendee;
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {meeting?.title ?? "Untitled meeting"}
          </h2>
          {organisation?.name && (
            <p className="text-sm text-gray-500">{organisation.name}</p>
          )}
        </div>
        <AttendeeStatusBadge status={attendance_status} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        {meeting?.start_datetime && meeting?.end_datetime && (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-gray-400" />
            <span>
              {getFormattedDateAndTime({ utc: meeting.start_datetime })} –{" "}
              {getFormattedDateAndTime({ utc: meeting.end_datetime })}
            </span>
          </div>
        )}
        {meeting?.address && (
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-gray-400" />
            <span>{meeting.address}</span>
          </div>
        )}
      </div>

      {meeting && organisation && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <Link
            href={`/flow/${organisation.id}/meetings/${meeting.id}/checkin`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 underline-offset-2 hover:underline"
          >
            Manage check-in
            <ExternalLink className="size-3.5" />
          </Link>
          <p className="mt-1 text-xs text-gray-500">
            Opens the public check-in page — you can update feedback or cancel
            your attendance from there.
          </p>
        </div>
      )}
    </section>
  );
};

const CheckinCard: FC<{ attendee: Attendee }> = ({ attendee }) => {
  const { checkin } = attendee;
  if (!checkin) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Check-in</h3>
        <p className="text-sm text-gray-500">
          No check-in recorded yet for this meeting.
        </p>
      </section>
    );
  }

  const { checkin_datetime, checkin_location, checkin_device } = checkin;
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Check-in</h3>
      <dl className="grid gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Clock className="size-4 text-gray-400 mt-0.5" />
          <div>
            <dt className="text-xs text-gray-500">Time</dt>
            <dd className="text-gray-900">
              {getFormattedDateAndTime({ utc: checkin_datetime })}
            </dd>
          </div>
        </div>
        {checkin_location?.address && (
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-xs text-gray-500">Location</dt>
              <dd className="text-gray-900">{checkin_location.address}</dd>
            </div>
          </div>
        )}
        {checkin_device && (
          <div className="flex items-start gap-2">
            <Building2 className="size-4 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-xs text-gray-500">Device</dt>
              <dd className="text-gray-900">
                {[checkin_device.browser, checkin_device.os, checkin_device.device]
                  .filter(Boolean)
                  .join(" · ") || "Unknown device"}
              </dd>
            </div>
          </div>
        )}
      </dl>
    </section>
  );
};

const FeedbackCard: FC<{ attendee: Attendee }> = ({ attendee }) => {
  const { feedback } = attendee;
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Your feedback</h3>
      {feedback?.rating ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`size-5 ${
                  n <= (feedback.rating ?? 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          {feedback.comment && (
            <p className="text-sm text-gray-700 italic">
              &ldquo;{feedback.comment}&rdquo;
            </p>
          )}
          {feedback.feedback_datetime && (
            <p className="text-xs text-gray-500">
              Submitted{" "}
              {getFormattedDateAndTime({ utc: feedback.feedback_datetime })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          You haven&apos;t left feedback for this meeting yet. Open the check-in
          page above to add it.
        </p>
      )}
    </section>
  );
};

const ProfileAttendeeOneSkeleton: FC = () => (
  <div className="grid gap-4">
    {[1, 2, 3].map((n) => (
      <div
        key={n}
        className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse"
      >
        <div className="h-4 w-1/3 bg-gray-100 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-3/4 bg-gray-100 rounded" />
          <div className="h-3 w-1/2 bg-gray-100 rounded" />
        </div>
      </div>
    ))}
  </div>
);
