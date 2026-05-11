import { Calendar, Clock, MapPin, Tag, Users } from "lucide-react";
import { ReactNode } from "react";

import { Meeting } from "@/api/services/weaver/meetings/types";
import { WeaverLink } from "@/components/common/weaver-link";
import { DataTableColumn } from "@/components/datagrid/data-table";
import { Badge } from "@/components/ui/badge";
import {
  getFormattedDate,
  getFormattedDateAndTime,
  getFormattedTime,
} from "@/utilities/helpers/date";

import { MeetingActionsMenu } from "../../one/actions-menu";

interface MeetingColumnsProps {
  handleMutateMeetings: () => void;
}

const formatDuration = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));

  if (durationMinutes < 60) {
    return `${durationMinutes}m`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

const getStatusBadgeVariant = (
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

export const MeetingColumns = (
  props: MeetingColumnsProps,
): readonly DataTableColumn<Meeting>[] => [
  {
    key: "actions",
    name: "",
    width: 50,
    frozen: true,
    className: "p-1.5",
    renderCell: ({ row }) => (
      <MeetingActionsMenu
        meeting={row}
        handleMutateMeetings={props.handleMutateMeetings}
      />
    ),
  },
  {
    key: "title",
    name: "Meeting",
    width: 300,
    renderCell: ({ row }): ReactNode => (
      <div className="space-y-1">
        <WeaverLink
          href={`/meetings/${row.id}`}
          className="font-medium text-sm text-gray-900 hover:text-blue-600 transition-colors"
        >
          {row.title}
        </WeaverLink>
        {row.description && (
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {row.description}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "start_datetime",
    name: "Date & Time",
    width: 180,
    renderCell: ({ row }): ReactNode => (
      <div className="space-y-1">
        <div className="flex items-center text-sm text-gray-900">
          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
          {getFormattedDate({ utc: row.start_datetime })}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1 text-gray-400" />
          {getFormattedTime(row.start_datetime)} -{" "}
          {getFormattedTime(row.end_datetime)}
        </div>
      </div>
    ),
  },
  {
    key: "duration",
    name: "Duration",
    width: 90,
    renderCell: ({ row }): ReactNode => (
      <span className="text-sm text-gray-700">
        {formatDuration(row.start_datetime, row.end_datetime)}
      </span>
    ),
  },
  {
    key: "expected_attendees",
    name: "Expected Attendees",
    width: 160,
    renderCell: ({ row }): ReactNode => (
      <div className="flex items-center text-sm text-gray-900">
        <Users className="w-4 h-4 mr-2 text-gray-400" />
        {row.expected_attendees || "-"}
      </div>
    ),
  },
  {
    key: "address",
    name: "Location",
    width: 220,
    renderCell: ({ row }): ReactNode => {
      if (row.address) {
        return (
          <div className="flex items-center text-sm text-gray-900">
            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{row.address}</span>
          </div>
        );
      }
      if (row.coordinates) {
        return (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-xs">
              {row.coordinates.latitude.toFixed(4)},{" "}
              {row.coordinates.longitude.toFixed(4)}
            </span>
          </div>
        );
      }
      return <span className="text-sm text-gray-400">Remote</span>;
    },
  },
  {
    key: "timezone",
    name: "Timezone",
    width: 140,
    renderCell: ({ row }): ReactNode => (
      <Badge variant="outline" className="font-mono text-xs">
        {row.timezone}
      </Badge>
    ),
  },
  {
    key: "database_status",
    name: "Status",
    width: 100,
    renderCell: ({ row }): ReactNode => (
      <Badge variant={getStatusBadgeVariant(row.database_status)}>
        {row.database_status.charAt(0).toUpperCase() +
          row.database_status.slice(1)}
      </Badge>
    ),
  },
  {
    key: "tags",
    name: "Tags",
    width: 160,
    renderCell: ({ row }): ReactNode => {
      if (!row.tags || row.tags.length === 0) {
        return <span className="text-sm text-gray-400">-</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {row.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {row.tags.length > 2 && (
            <span className="text-xs text-gray-500">
              +{row.tags.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "recurring",
    name: "Recurring",
    width: 100,
    renderCell: ({ row }): ReactNode => (
      <Badge variant={row.recurring_pattern ? "default" : "outline"}>
        {row.recurring_pattern ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    key: "location_verification",
    name: "Verification",
    width: 120,
    renderCell: ({ row }): ReactNode => (
      <Badge
        variant={
          row.settings.require_location_verification ? "default" : "secondary"
        }
      >
        {row.settings.require_location_verification ? "Required" : "Optional"}
      </Badge>
    ),
  },
  {
    key: "attachments",
    name: "Files",
    width: 90,
    renderCell: ({ row }): ReactNode => {
      const fileCount = [
        row.image ? 1 : 0,
        row.attachments?.length || 0,
      ].reduce((a, b) => a + b, 0);

      if (fileCount === 0) {
        return <span className="text-sm text-gray-400">-</span>;
      }

      return (
        <Badge variant="outline" className="text-xs">
          {fileCount} file{fileCount !== 1 ? "s" : ""}
        </Badge>
      );
    },
  },
  {
    key: "notes",
    name: "Notes",
    width: 220,
    renderCell: ({ row }): ReactNode => {
      if (!row.notes) return <span className="text-sm text-gray-400">-</span>;
      return (
        <div className="text-sm text-gray-700 truncate" title={row.notes}>
          {row.notes}
        </div>
      );
    },
  },
  {
    key: "created_at",
    name: "Created",
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
