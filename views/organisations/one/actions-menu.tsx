import { EllipsisVertical, PenBox } from "lucide-react";
import { Fragment, useState } from "react";

import { Organisation } from "@/api/services/tendiflow/organisations/types";
import { EntityDialog } from "@/components/dialogs/entity";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusFieldView } from "@/components/ui/view";
import { DATABASE_STATUS_OPTIONS } from "@/utilities/constants/options";

import { OrganisationForm } from "./form";

interface OrganisationActionsMenuProps {
  organisation: Organisation;
  handleMutateOrganisations: () => void;
  contentAlign?: "center" | "start" | "end";
  useDropdownMenu?: boolean;
}

export const OrganisationActionsMenu: React.FC<
  OrganisationActionsMenuProps
> = ({
  organisation,
  handleMutateOrganisations,
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
            {organisation.name}{" "}
            <StatusFieldView
              option={organisation.database_status}
              options={DATABASE_STATUS_OPTIONS}
            />
          </div>
        }
      >
        <OrganisationForm
          organisation={organisation}
          handleMutateOrganisations={handleMutateOrganisations}
          setCloseDialog={() => setIsFormDialogOpen(false)}
        />
      </EntityDialog>
    </Fragment>
  );
};
