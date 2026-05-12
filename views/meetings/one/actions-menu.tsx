import {
  Archive,
  Download,
  EllipsisVertical,
  PenBox,
  QrCode,
  Trash,
} from "lucide-react";
import { Fragment, useState } from "react";

import { Meeting } from "@/api/services/tendiflow/meetings/types";
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
import { useMeetingDatabaseStatus } from "@/forms/meeting/hooks/database-status";
import { useMeetingDelete } from "@/forms/meeting/hooks/delete";
import { useRegenerateQrcode } from "@/forms/meeting/hooks/qrcode"; // Import the new hook
import { DATABASE_STATUS_OPTIONS } from "@/utilities/constants/options";
import { ExportMeetingDialog } from "@/views/attendees/many/export";

import { MeetingForm } from "./form";

interface MeetingActionsMenuProps {
  meeting: Meeting;
  handleMutateMeetings: () => void;
  contentAlign?: "center" | "start" | "end";
  useDropdownMenu?: boolean;
}

export const MeetingActionsMenu: React.FC<MeetingActionsMenuProps> = ({
  meeting,
  handleMutateMeetings,
  contentAlign = "start",
  useDropdownMenu = true,
}) => {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("archive");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isSubmitting: isUpdatingDatabaseStatus, handleUpdateDatabaseStatus } =
    useMeetingDatabaseStatus({
      meeting,
      handleMutateMeetings,
    });

  const { isSubmitting: isDeleting, handleDelete } = useMeetingDelete({
    meeting,
    handleMutateMeetings,
  });

  // Instantiate the new hook for regenerating the QR code
  const { isRegenerating, handleRegenerateQrcode } = useRegenerateQrcode({
    organisationId: meeting.organisation_id,
    meeting,
    onSuccess: handleMutateMeetings,
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
    if (meeting.database_status === DatabaseStatus.ACTIVE) {
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

  const handleExportClick = (): void => {
    setIsExportDialogOpen(true);
    setIsDropdownOpen(false);
  };

  // Handler for the new action
  const handleRegenerateQrcodeClick = async (): Promise<void> => {
    setIsDropdownOpen(false);
    await handleRegenerateQrcode();
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
          <DropdownMenuItem onClick={handleExportClick}>
            Export
          </DropdownMenuItem>
          {/* Add Regenerate QR Code menu item */}
          <DropdownMenuItem
            onClick={handleRegenerateQrcodeClick}
            disabled={isRegenerating}
          >
            Regenerate QR
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleStatusAction}>
            {meeting.database_status === DatabaseStatus.ACTIVE
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
        <Button variant="outline" size="sm" onClick={handleExportClick}>
          <Download className="size-4" />
          <span>Export</span>
        </Button>
        {/* Add Regenerate QR Code button for larger screens */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerateQrcodeClick}
          disabled={isRegenerating}
        >
          <QrCode className="size-4" />
          <span>Regenerate QR</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleStatusAction}>
          {meeting.database_status === DatabaseStatus.ACTIVE && (
            <Fragment>
              <Archive className="size-4" />
              <span>Archive</span>
            </Fragment>
          )}
          {meeting.database_status === DatabaseStatus.ARCHIVED && (
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
        what="meeting"
        entityName={meeting.title}
        actionType={actionType}
        onConfirm={handleConfirm}
        isProcessing={isUpdatingDatabaseStatus || isDeleting}
      />
      <EntityDialog
        open={isFormDialogOpen}
        setOpen={setIsFormDialogOpen}
        title={
          <div className="flex flex-col gap-4">
            {meeting.title}{" "}
            <StatusFieldView
              option={meeting.database_status}
              options={DATABASE_STATUS_OPTIONS}
            />
          </div>
        }
      >
        <MeetingForm
          meeting={meeting}
          handleMutateMeetings={handleMutateMeetings}
          setCloseDialog={
            meeting ? undefined : (): void => setIsFormDialogOpen(false)
          }
        />
      </EntityDialog>
      <ExportMeetingDialog
        meetingId={meeting.id}
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </Fragment>
  );
};
