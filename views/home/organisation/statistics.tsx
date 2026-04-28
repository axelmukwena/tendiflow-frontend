"use client";

import { Activity, Calendar, Users } from "lucide-react";
import { FC } from "react";

import { LinearLoader } from "@/components/loaders/linear";
import { StatisticsCard } from "@/components/view/statistics-card";
import { useCurrentOrganisationContext } from "@/contexts/current-organisation";
import { useOrganisationStatistics } from "@/hooks/organisations/statistics";

interface OrganisationStatisticsHomeProps {}

export const OrganisationStatisticsHome: FC<
  OrganisationStatisticsHomeProps
> = () => {
  const { currentOrganisation } = useCurrentOrganisationContext();
  const { isLoading, statistics } = useOrganisationStatistics({
    id: currentOrganisation?.id,
  });

  if (isLoading) {
    return <LinearLoader />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatisticsCard
        title="Active Meetings"
        value={statistics?.active_meetings_count || 0}
        icon={Activity}
        description="Currently ongoing"
      />
      <StatisticsCard
        title="Upcoming Meetings"
        value={statistics?.upcoming_meetings_count || 0}
        icon={Calendar}
        description="Scheduled for the future"
      />
      <StatisticsCard
        title="Total Attendees"
        value={statistics?.unique_attendees_count || 0}
        icon={Users}
        description="All unique participants across meetings"
      />
    </div>
  );
};
