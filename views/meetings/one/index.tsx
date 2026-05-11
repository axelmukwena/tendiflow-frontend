"use client";

import { Group, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC, Fragment } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeetingById } from "@/hooks/meetings/id";
import { AttendeesContentView } from "@/views/attendees/many/content";
import { AttendeeView } from "@/views/attendees/one";
import { NotFound } from "@/views/not-found";

import { MeetingHeader } from "./header";
import { MeetingPageContent } from "./view";

export const DEFAULT_MEETING_TAB = "meeting";

type MeetingTab = "meeting" | "attendees" | "attendee";

interface MeetingViewProps {
  meetingId: string;
}

export const MeetingView: FC<MeetingViewProps> = ({ meetingId }) => {
  const {
    meeting,
    isLoading,
    mutateMeeting: handleMutateMeeting,
  } = useMeetingById({ meetingId });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get("tab") as MeetingTab | null) ?? null;
  const attendeeId = searchParams.get("attendeeId");
  // "attendee" tab is only valid when an attendeeId is present in the query.
  const activeTab: MeetingTab =
    tabParam === "attendee" && attendeeId
      ? "attendee"
      : tabParam === "attendees"
        ? "attendees"
        : DEFAULT_MEETING_TAB;

  const handleTabChange = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_MEETING_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    // Switching away from the attendee tab drops the attendeeId so we don't
    // leak it back into the URL the next time someone toggles.
    if (value !== "attendee") {
      params.delete("attendeeId");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return <NotFound name="Meeting" />;
  }

  return (
    <Fragment>
      <MeetingHeader meeting={meeting} />
      <div className="flex flex-col gap-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full gap-4 md:gap-6"
        >
          <TabsList
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${attendeeId ? 3 : 2}, minmax(0, 1fr))`,
            }}
          >
            <TabsTrigger value="meeting" className="flex items-center gap-1">
              <Group className="h-4 w-4" />
              <span>Meeting</span>
            </TabsTrigger>
            <TabsTrigger value="attendees" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Attendees</span>
            </TabsTrigger>
            {attendeeId && (
              <TabsTrigger value="attendee" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Attendee</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="meeting">
            <MeetingPageContent
              meeting={meeting}
              handleMutateMeetings={handleMutateMeeting}
            />
          </TabsContent>

          <TabsContent value="attendees">
            <AttendeesContentView
              meetingId={meetingId}
              handleMutateParent={handleMutateMeeting}
            />
          </TabsContent>

          {attendeeId && (
            <TabsContent value="attendee">
              <AttendeeView
                attendeeId={attendeeId}
                meetingId={meeting.id}
                handleMutateParent={handleMutateMeeting}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Fragment>
  );
};
