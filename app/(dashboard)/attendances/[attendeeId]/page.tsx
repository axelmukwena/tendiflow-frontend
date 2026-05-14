import { FC } from "react";

import { ProfileAttendeeOneView } from "@/views/profile/attendees/one";

type Params = Promise<{ attendeeId: string }>;
interface ProfileAttendeePageProps {
  params: Params;
}

const ProfileAttendeePage: FC<ProfileAttendeePageProps> = async (props) => {
  const { attendeeId } = await props.params;
  return <ProfileAttendeeOneView attendeeId={attendeeId} />;
};

export default ProfileAttendeePage;
