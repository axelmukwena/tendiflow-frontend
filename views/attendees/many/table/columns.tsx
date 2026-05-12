import { Calendar, CheckCircle, MapPin, Star } from "lucide-react";
import { ReactNode } from "react";

import {
  AttendanceStatus,
  Attendee,
} from "@/api/services/tendiflow/attendees/types";
import { TendiflowLink } from "@/components/common/tendiflow-link";
import { DataTableColumn } from "@/components/datagrid/data-table";
import { Badge } from "@/components/ui/badge";
import {
  getFormattedDate,
  getFormattedDateAndTime,
  getFormattedTime,
} from "@/utilities/helpers/date";

import { AttendeeActionsMenu } from "../../one/actions-menu";

interface AttendeeColumnsProps {
  handleMutateAttendees: () => void;
}

const getAttendanceStatusVariant = (
  status: AttendanceStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case AttendanceStatus.CHECKED_IN:
      return "default";
    case AttendanceStatus.CHECKED_IN_LATE:
      return "secondary";
    case AttendanceStatus.REGISTERED:
      return "outline";
    case AttendanceStatus.CANCELLED:
      return "destructive";
    default:
      return "outline";
  }
};

const getDatabaseStatusVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "archived":
      return "secondary";
    case "deleted":
      return "destructive";
    default:
      return "outline";
  }
};

const formatAttendanceStatus = (status: AttendanceStatus): string => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const AttendeeColumns = (
  props: AttendeeColumnsProps,
): readonly DataTableColumn<Attendee>[] => [
  {
    key: "actions",
    name: "",
    width: 50,
    frozen: true,
    className: "p-1.5",
    renderCell: ({ row }) => (
      <AttendeeActionsMenu
        attendee={row}
        handleMutateAttendees={props.handleMutateAttendees}
      />
    ),
  },
  {
    key: "name",
    name: "Attendee",
    width: 250,
    renderCell: ({ row }): ReactNode => (
      <TendiflowLink
        href={`/meetings/${row.meeting_id}?tab=attendee&attendeeId=${row.id}`}
        className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors"
      >
        {row.first_name} {row.last_name}
      </TendiflowLink>
    ),
  },
  {
    key: "email",
    name: "Email",
    width: 220,
    renderCell: ({ row }): ReactNode => (
      <span className="truncate">{row.email}</span>
    ),
  },
  {
    key: "attendance_status",
    name: "Status",
    width: 130,
    renderCell: ({ row }): ReactNode => (
      <Badge variant={getAttendanceStatusVariant(row.attendance_status)}>
        {formatAttendanceStatus(row.attendance_status)}
      </Badge>
    ),
  },
  {
    key: "organisation_name",
    name: "Organisation",
    width: 180,
    renderCell: ({ row }): ReactNode => {
      if (!row.organisation_name) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      return <span className="truncate">{row.organisation_name}</span>;
    },
  },
  {
    key: "division",
    name: "Division",
    width: 150,
    renderCell: ({ row }): ReactNode => (
      <span className="truncate">{row.division || "-"}</span>
    ),
  },
  {
    key: "occupation",
    name: "Occupation",
    width: 150,
    renderCell: ({ row }): ReactNode => (
      <span className="truncate">{row.occupation || "-"}</span>
    ),
  },
  {
    key: "phone_number",
    name: "Phone",
    width: 140,
    renderCell: ({ row }): ReactNode => {
      if (!row.phone_number) {
        return <span className="truncate">-</span>;
      }
      return <span className="truncate">{row.phone_number}</span>;
    },
  },
  {
    key: "meeting",
    name: "Meeting",
    width: 220,
    renderCell: ({ row }): ReactNode => {
      if (!row.meeting) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      return (
        <div className="space-y-1">
          <TendiflowLink
            href={`/meetings/${row.meeting_id}`}
            className="text-sm text-blue-600 hover:text-blue-800 truncate block"
          >
            {row.meeting.title}
          </TendiflowLink>
          {row.meeting.start_datetime && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
              {getFormattedDate({ utc: row.meeting.start_datetime })}
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "checkin_status",
    name: "Check-in",
    width: 140,
    renderCell: ({ row }): ReactNode => {
      if (!row.checkin) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      return (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            Checked in
          </div>
          <div className="text-xs text-gray-500">
            {getFormattedTime(row.checkin.checkin_datetime)}
          </div>
        </div>
      );
    },
  },
  {
    key: "checkin_location",
    name: "Check-in Location",
    width: 200,
    renderCell: ({ row }): ReactNode => {
      if (!row.checkin?.checkin_location) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      const location = row.checkin.checkin_location;
      return (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
            <span className="text-xs">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
          {location.address && (
            <div className="text-xs text-gray-500 truncate max-w-xs">
              {location.address}
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "feedback_rating",
    name: "Rating",
    width: 100,
    renderCell: ({ row }): ReactNode => {
      if (!row.feedback?.rating) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      return (
        <div className="flex items-center text-sm text-yellow-600">
          <Star className="w-4 h-4 mr-1 fill-current" />
          <span>{row.feedback.rating}/5</span>
        </div>
      );
    },
  },
  {
    key: "feedback_comment",
    name: "Feedback",
    width: 220,
    renderCell: ({ row }): ReactNode => {
      if (!row.feedback?.comment) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      return (
        <div
          className="text-sm text-gray-700 truncate"
          title={row.feedback.comment}
        >
          {row.feedback.comment}
        </div>
      );
    },
  },
  {
    key: "custom_fields",
    name: "Custom Fields",
    width: 130,
    renderCell: ({ row }): ReactNode => {
      if (
        !row.custom_field_responses ||
        row.custom_field_responses.length === 0
      ) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      return (
        <Badge variant="outline" className="text-xs">
          {row.custom_field_responses.length} field
          {row.custom_field_responses.length !== 1 ? "s" : ""}
        </Badge>
      );
    },
  },
  {
    key: "database_status",
    name: "Database Status",
    width: 130,
    renderCell: ({ row }): ReactNode => (
      <Badge variant={getDatabaseStatusVariant(row.database_status)}>
        {row.database_status.charAt(0).toUpperCase() +
          row.database_status.slice(1)}
      </Badge>
    ),
  },
  {
    key: "created_at",
    name: "Registered",
    width: 170,
    renderCell: ({ row }): ReactNode => (
      <div className="text-sm text-gray-700">
        {getFormattedDateAndTime({ utc: row.created_at })}
      </div>
    ),
  },
  {
    key: "updated_at",
    name: "Updated",
    width: 170,
    renderCell: ({ row }): ReactNode => (
      <div className="text-sm text-gray-700">
        {row.updated_at
          ? getFormattedDateAndTime({ utc: row.updated_at })
          : "-"}
      </div>
    ),
  },
];
