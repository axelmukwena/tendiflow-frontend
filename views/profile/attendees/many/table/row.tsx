import { Calendar, Clock, MapPin } from "lucide-react";
import { FC } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

import { AttendeeStatusBadge } from "./status";

interface AttendeeTableRowProps {
  attendee: Attendee;
  onRowClick?: (attendee: Attendee) => void;
}

export const AttendeeTableRow: FC<AttendeeTableRowProps> = ({
  attendee,
  onRowClick,
}) => {
  const formatDateTime = (dateString: string): string => {
    return getFormattedDateAndTime({ utc: dateString });
  };

  const handleRowClick = (): void => {
    if (onRowClick) {
      onRowClick(attendee);
    }
  };

  return (
    <TableRow
      className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
      onClick={handleRowClick}
    >
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {attendee.meeting?.title || "Unknown Meeting"}
          </span>
          <span className="text-xs text-gray-500">
            {attendee.organisation?.name || "Unknown Organization"}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-1 text-sm">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span>
            {attendee.meeting?.start_datetime
              ? formatDateTime(attendee.meeting.start_datetime)
              : "N/A"}
          </span>
        </div>
      </TableCell>

      <TableCell>
        {attendee.meeting?.address && (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="truncate max-w-[200px]">
              {attendee.meeting.address}
            </span>
          </div>
        )}
      </TableCell>

      <TableCell>
        <AttendeeStatusBadge status={attendee.attendance_status} />
      </TableCell>

      <TableCell>
        {attendee.checkin?.checkin_datetime && (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{formatDateTime(attendee.checkin.checkin_datetime)}</span>
          </div>
        )}
      </TableCell>

      <TableCell>
        <div className="text-xs text-gray-500">
          {formatDateTime(attendee.created_at)}
        </div>
      </TableCell>
    </TableRow>
  );
};
