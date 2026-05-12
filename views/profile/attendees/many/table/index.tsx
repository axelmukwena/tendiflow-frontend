import { FC } from "react";

import {
  Attendee,
  AttendeeSortBy,
} from "@/api/services/tendiflow/attendees/types";
import { OrderBy } from "@/api/services/tendiflow/types/general";
import { Table, TableBody } from "@/components/ui/table";

import { AttendeeTableEmpty } from "./empty";
import { AttendeeTableHeader } from "./header";
import { AttendeeTableRow } from "./row";
import { AttendeeTableSkeleton } from "./skeleton";

interface AttendeeTableProps {
  attendees: Attendee[];
  isLoading: boolean;
  hasFilters?: boolean;
  sortBy?: AttendeeSortBy;
  orderBy?: OrderBy;
  onSort?: (sortBy: AttendeeSortBy, orderBy: OrderBy) => void;
  onRowClick?: (attendee: Attendee) => void;
  handleMutateAttendees: () => void;
}

export const AttendeeTable: FC<AttendeeTableProps> = ({
  attendees,
  isLoading,
  hasFilters,
  sortBy,
  orderBy,
  onSort,
  onRowClick,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <AttendeeTableHeader
          sortBy={sortBy}
          orderBy={orderBy}
          onSort={onSort}
        />
        <TableBody>
          {isLoading ? (
            <AttendeeTableSkeleton />
          ) : attendees.length === 0 ? (
            <AttendeeTableEmpty hasFilters={hasFilters} />
          ) : (
            attendees.map((attendee) => (
              <AttendeeTableRow
                key={attendee.id}
                attendee={attendee}
                onRowClick={onRowClick}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
