"use client";

import { useRouter } from "next/navigation";
import { FC } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { TablePagination } from "@/components/pagination/table";
import { useAttendeeUsersMany } from "@/hooks/profile/attendee/many";
import { useAttendeeUserPagination } from "@/hooks/profile/attendee/pagination";

import { AttendeeTable } from "./table";

interface ProfileAttendeesContentProps {}

export const ProfileAttendeesContent: FC<ProfileAttendeesContentProps> = () => {
  const router = useRouter();

  const {
    search,
    sortBy,
    orderBy,
    limit,
    page,
    total,
    handlePageChange,
    handleLimitChange,
    handleSort,
    setTotal,
  } = useAttendeeUserPagination();

  const { isLoading, attendees, count, handleMutateAttendees } =
    useAttendeeUsersMany({
      search,
      sortBy,
      orderBy,
      limit,
      page,
      setTotal,
    });

  const handleRowClick = (attendee: Attendee): void => {
    router.push(`/attendances/${attendee.id}`);
  };

  return (
    <div className="space-y-4">
      <AttendeeTable
        attendees={attendees || []}
        isLoading={isLoading}
        hasFilters={!!search}
        sortBy={sortBy}
        orderBy={orderBy}
        onSort={handleSort}
        onRowClick={handleRowClick}
        handleMutateAttendees={handleMutateAttendees}
      />

      <TablePagination
        entity="attendance"
        count={count}
        total={total}
        limit={limit}
        page={page}
        handleLimitChange={handleLimitChange}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};
