import { FC } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { DataTable } from "@/components/datagrid/data-table";

import { AttendeeColumns } from "./columns";

interface AttendeeProps {
  attendees?: Attendee[] | null;
  isLoading?: boolean;
  handleMutateAttendees: () => void;
}

export const AttendeeDataGrid: FC<AttendeeProps> = ({
  attendees,
  isLoading,
  handleMutateAttendees,
}) => {
  const columns = AttendeeColumns({ handleMutateAttendees });

  return (
    <DataTable<Attendee>
      rows={attendees || []}
      columns={columns}
      rowKey={(row): string => row.id}
      isLoading={isLoading}
      emptyMessage="No attendees found"
    />
  );
};
