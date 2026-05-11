"use client";

import { ReactNode } from "react";

import { LinearLoader } from "@/components/loaders/linear";
import { SectionLoader } from "@/components/loaders/section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mergeTailwind } from "@/utilities/helpers/tailwind";

import { DataTableNoData } from "./data-table-no-data";

export interface DataTableColumn<T> {
  /** Unique key used as React key for the column. */
  key: string;
  /** Header content rendered inside <th>. Empty string for action columns. */
  name: ReactNode;
  /** Optional fixed width in pixels. */
  width?: number;
  /** Extra classes for the data <td>. */
  className?: string;
  /** Extra classes for the header <th>. */
  headerClassName?: string;
  /** Sticks the column to the inline-start edge during horizontal scroll. */
  frozen?: boolean;
  /** Render function for a single cell. */
  renderCell: (props: { row: T }) => ReactNode;
}

interface DataTableProps<T> {
  rows: readonly T[];
  columns: readonly DataTableColumn<T>[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

const stickyClass = "sticky left-0 z-10 bg-background";

export const DataTable = <T,>({
  rows,
  columns,
  rowKey,
  emptyMessage = "No data available",
  isLoading,
}: DataTableProps<T>): React.JSX.Element => {
  const hasRows = rows.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-4">
      {isLoading && <LinearLoader />}
      {hasRows && (
        <div className="rounded-lg border border-slate-200 overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={mergeTailwind(
                      col.frozen && stickyClass,
                      col.headerClassName,
                    )}
                  >
                    {col.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      style={col.width ? { width: col.width } : undefined}
                      className={mergeTailwind(
                        col.frozen && stickyClass,
                        col.className,
                      )}
                    >
                      {col.renderCell({ row })}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {isLoading && <SectionLoader minHeight="200px" />}
      {!hasRows && !isLoading && <DataTableNoData message={emptyMessage} />}
    </div>
  );
};
