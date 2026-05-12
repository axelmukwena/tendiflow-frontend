import { EllipsisVertical, PenBox } from "lucide-react";
import { Fragment, useState } from "react";

import { User } from "@/api/services/tendiflow/users/types";
import { EntityDialog } from "@/components/dialogs/entity";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusFieldView } from "@/components/ui/view";
import { USER_STATUS_OPTIONS } from "@/utilities/constants/options";

import { ProfileForm } from "./form";

interface ProfileActionsMenuProps {
  profile: User;
  handleMutateProfiles: () => void;
  contentAlign?: "center" | "start" | "end";
  useDropdownMenu?: boolean;
}

export const ProfileActionsMenu: React.FC<ProfileActionsMenuProps> = ({
  profile,
  handleMutateProfiles,
  contentAlign = "start",
  useDropdownMenu = true,
}) => {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            className={`flex p-0 data-[state=open]:bg-muted ${useDropdownMenu ? "" : "sm:hidden"}`}
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={contentAlign} className="w-[160px]">
          <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className={`items-center gap-2 ${useDropdownMenu ? "hidden" : "hidden sm:flex"}`}
      >
        <Button variant="outline" onClick={handleEditClick}>
          <PenBox className="size-4" />
          <span>Edit</span>
        </Button>
      </div>
      <EntityDialog
        open={isFormDialogOpen}
        setOpen={setIsFormDialogOpen}
        title={
          <div className="flex flex-row items-center gap-4">
            {profile.first_name} {profile.last_name}{" "}
            <StatusFieldView
              option={profile.status}
              options={USER_STATUS_OPTIONS}
            />
          </div>
        }
      >
        <ProfileForm
          user={profile}
          handleMutateProfiles={handleMutateProfiles}
          setCloseDialog={() => setIsFormDialogOpen(false)}
        />
      </EntityDialog>
    </Fragment>
  );
};
