import { FC } from "react";

import { AttendanceStatus } from "@/api/services/tendiflow/attendees/types";
import { Badge } from "@/components/ui/badge";

interface AttendeeStatusBadgeProps {
  status: AttendanceStatus;
}

interface AttendeeStatusConfig {
  variant: "default" | "secondary" | "outline" | "destructive";
  label: string;
  className: string;
}

export const AttendeeStatusBadge: FC<AttendeeStatusBadgeProps> = ({
  status,
}) => {
  const getStatusConfig = (status: AttendanceStatus): AttendeeStatusConfig => {
    switch (status) {
      case AttendanceStatus.CHECKED_IN:
        return {
          variant: "default",
          label: "Attended",
          className: "bg-green-100 text-green-800 hover:bg-green-100",
        };
      case AttendanceStatus.CHECKED_IN_LATE:
        return {
          variant: "secondary",
          label: "Late",
          className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        };
      case AttendanceStatus.REGISTERED:
        return {
          variant: "outline",
          label: "Registered",
          className:
            "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
        };
      case AttendanceStatus.CANCELLED:
        return {
          variant: "destructive",
          label: "Cancelled",
          className: "bg-red-100 text-red-800 hover:bg-red-100",
        };
      default:
        return {
          variant: "outline",
          label: status,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
