import { Archive, EllipsisVertical, PenBox, Trash } from "lucide-react";
import { Fragment, useState } from "react";

import { Attendee } from "@/api/services/tendiflow/attendees/types";
import { DatabaseStatus } from "@/api/services/tendiflow/types/general";
import { ActionAlertDialog, ActionType } from "@/components/dialogs/action";
import { EntityDialog } from "@/components/dialogs/entity";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusFieldView } from "@/components/ui/view";
import { useAttendeeDatabaseStatus } from "@/forms/attendee/hooks/database-status";
import { useAttendeeDelete } from "@/forms/attendee/hooks/delete";
import { DATABASE_STATUS_OPTIONS } from "@/utilities/constants/options";

import { AttendeeForm } from "./form";

interface AttendeeActionsMenuProps {
  attendee: Attendee;
  handleMutateAttendees: () => void;
  contentAlign?: "center" | "start" | "end";
  useDropdownMenu?: boolean;
}

export const AttendeeActionsMenu: React.FC<AttendeeActionsMenuProps> = ({
  attendee,
  handleMutateAttendees,
  contentAlign = "start",
  useDropdownMenu = true,
}) => {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("archive");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isSubmitting: isUpdatingDatabaseStatus, handleUpdateDatabaseStatus } =
    useAttendeeDatabaseStatus({
      attendee,
      handleMutateAttendees,
    });

  const { isSubmitting: isDeleting, handleDelete } = useAttendeeDelete({
    attendee,
    handleMutateAttendees,
  });

  const handleActionClick = (action: ActionType): void => {
    // Close the dropdown first
    setIsDropdownOpen(false);
    // Set the action type
    setActionType(action);
    // Then open the dialog
    setTimeout(() => {
      setIsAlertDialogOpen(true);
    }, 100); // Small delay to ensure dropdown is fully closed
  };

  const handleStatusAction = (): void => {
    if (attendee.database_status === DatabaseStatus.ACTIVE) {
      handleActionClick("archive");
    } else {
      handleActionClick("activate");
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (actionType === "archive") {
      await handleUpdateDatabaseStatus(DatabaseStatus.ARCHIVED);
    }
    if (actionType === "activate") {
      await handleUpdateDatabaseStatus(DatabaseStatus.ACTIVE);
    }
    if (actionType === "delete") {
      await handleDelete();
    }
    setIsAlertDialogOpen(false);
  };

  const handleEditClick = (): void => {
    setIsFormDialogOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <Fragment>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex h-[38px] w-[38px] p-0 data-[state=open]:bg-muted ${useDropdownMenu ? "" : "sm:hidden"}`}
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={contentAlign} className="w-[160px]">
          <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleStatusAction}>
            {attendee.database_status === DatabaseStatus.ACTIVE
              ? "Archive"
              : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleActionClick("delete")}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className={`items-center gap-2 ${useDropdownMenu ? "hidden" : "hidden sm:flex"}`}
      >
        <Button variant="outline" size="sm" onClick={handleEditClick}>
          <PenBox className="size-4" />
          <span>Edit</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleStatusAction}>
          {attendee.database_status === DatabaseStatus.ACTIVE && (
            <Fragment>
              <Archive className="size-4" />
              <span>Archive</span>
            </Fragment>
          )}
          {attendee.database_status === DatabaseStatus.ARCHIVED && (
            <span>Activate</span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleActionClick("delete")}
          className="hover:text-destructive hover:border-destructive hover:bg-destructive/5"
        >
          <Trash className="size-4" />
          <span>Delete</span>
        </Button>
      </div>
      <ActionAlertDialog
        open={isAlertDialogOpen}
        setOpen={setIsAlertDialogOpen}
        what="attendee"
        entityName={`${attendee.first_name} ${attendee.last_name}`}
        actionType={actionType}
        onConfirm={handleConfirm}
        isProcessing={isUpdatingDatabaseStatus || isDeleting}
      />
      <EntityDialog
        open={isFormDialogOpen}
        setOpen={setIsFormDialogOpen}
        title={
          <div className="flex flex-col gap-4">
            {attendee.first_name} {attendee.last_name}{" "}
            <StatusFieldView
              option={attendee.database_status}
              options={DATABASE_STATUS_OPTIONS}
            />
          </div>
        }
      >
        <AttendeeForm
          meetingId={attendee.meeting_id}
          attendee={attendee}
          handleMutateAttendees={handleMutateAttendees}
          setCloseDialog={
            attendee ? undefined : (): void => setIsFormDialogOpen(false)
          }
        />
      </EntityDialog>
    </Fragment>
  );
};
