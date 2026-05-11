"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

import { Meeting } from "@/api/services/weaver/meetings/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface MeetingHeaderProps {
  meeting: Meeting;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({ meeting }) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const attendeeId = searchParams.get("attendeeId");

  const meetingHref = `/meetings/${meeting.id}`;
  const attendeesHref = `${meetingHref}?tab=attendees`;

  const showAttendeesCrumb = tab === "attendees" || tab === "attendee";
  const showAttendeeCrumb = tab === "attendee" && attendeeId;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-1">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/meetings"
                className="flex items-center gap-1"
              >
                Meetings
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {showAttendeesCrumb ? (
                <BreadcrumbLink
                  href={meetingHref}
                  className="flex items-center gap-1"
                >
                  {meeting.title}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center gap-1">
                  {meeting.title}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {showAttendeesCrumb && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {showAttendeeCrumb ? (
                    <BreadcrumbLink
                      href={attendeesHref}
                      className="flex items-center gap-1"
                    >
                      Attendees
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="flex items-center gap-1">
                      Attendees
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}
            {showAttendeeCrumb && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1">
                    Attendee
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};
