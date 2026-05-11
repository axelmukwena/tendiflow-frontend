import { FC } from "react";

import { Meeting } from "@/api/services/weaver/meetings/types";
import { DataTable } from "@/components/datagrid/data-table";

import { MeetingColumns } from "./columns";

interface MeetingProps {
  meetings?: Meeting[] | null;
  isLoading?: boolean;
  handleMutateMeetings: () => void;
}

export const MeetingDataGrid: FC<MeetingProps> = ({
  meetings,
  isLoading,
  handleMutateMeetings,
}) => {
  const columns = MeetingColumns({ handleMutateMeetings });

  return (
    <DataTable<Meeting>
      rows={meetings || []}
      columns={columns}
      rowKey={(row): string => row.id}
      isLoading={isLoading}
      emptyMessage="No meetings found"
    />
  );
};
