"use client";

import { Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, Fragment, useState } from "react";

import { EntityDialog } from "@/components/dialogs/entity";
import { LinearLoader } from "@/components/loaders/linear";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { useCurrentUserContext } from "@/contexts/current-user";
import { useAttendeeUserStatistics } from "@/hooks/profile/attendee/statistics";
import { getTimeBasedGreeting } from "@/utilities/helpers/date";
import { OrganisationForm } from "@/views/organisations/one/form";

import { UserAttendeeStatisticsHome } from "./statistics";

interface UserHomeProps {}

export const UserHome: FC<UserHomeProps> = () => {
  const { currentUser } = useCurrentUserContext();
  const { currentOrganisation } = useCurrentOrganisationContext();
  const { isLoading: statsLoading, statistics } = useAttendeeUserStatistics({});

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { mutateCurrentOrganisation } = useCurrentOrganisationContext();
  const router = useRouter();

  const handleClose = (): void => {
    router.refresh();
  };

  if (statsLoading || !currentUser || !statistics) {
    return <LinearLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-semibold mb-2">
          {getTimeBasedGreeting()}, {currentUser.first_name}! 👋
        </h2>
        <p className="text-muted-foreground text-sm">
          Track your meeting attendance and view your participation history.
        </p>
      </div>

      <UserAttendeeStatisticsHome />

      {!currentOrganisation && (
        <Fragment>
          <Separator className="my-6" />

          <Button
            size="lg"
            onClick={() => setIsFormDialogOpen(true)}
            className="h-auto p-4 justify-start"
          >
            Set Up My Organisation
          </Button>
          <EntityDialog
            open={isFormDialogOpen}
            setOpen={setIsFormDialogOpen}
            title={
              <div className="flex flex-row items-center gap-4">
                <Building className="h-10 w-10" />
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    Set Up Your Organisation
                  </span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Create or manage your organisation settings.
                  </span>
                </div>
              </div>
            }
          >
            <OrganisationForm
              handleMutateOrganisations={mutateCurrentOrganisation}
              setCloseDialog={handleClose}
            />
          </EntityDialog>
        </Fragment>
      )}
    </div>
  );
};
