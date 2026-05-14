import { ImageResponse } from "next/og";

import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";

import { fetchMeetingForMeta, MeetingForMeta } from "./_meta";

export const runtime = "edge";
export const alt = "Meeting check-in";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const baseUrl = ENVIRONMENT_VARIABLES.NEXT_PUBLIC_SITE_BASE_URL.replace(
    /\/$/,
    "",
  );
  const res = await fetch(`${baseUrl}/static/fonts/${filename}`, {
    next: { revalidate: 86400 },
  });
  return res.arrayBuffer();
}

function formatDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateFmt.format(start)} · ${timeFmt.format(start)} – ${timeFmt.format(end)}`;
}

interface ImageProps {
  params: Promise<{ organisationId: string; meetingId: string }>;
}

export default async function Image({ params }: ImageProps): Promise<Response> {
  const { organisationId, meetingId } = await params;
  const meeting: MeetingForMeta | null = await fetchMeetingForMeta(
    organisationId,
    meetingId,
  );

  const [interBold, interMedium] = await Promise.all([
    loadFont("Inter-Bold.ttf"),
    loadFont("Inter-Medium.ttf"),
  ]);

  const title = meeting?.title ?? "Meeting check-in";
  const org = meeting?.organisation_name ?? "Tendiflow";
  const date =
    meeting != null
      ? formatDateRange(meeting.start_datetime, meeting.end_datetime)
      : "";
  const address = meeting?.address ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#a3a3a3",
          }}
        >
          Tendiflow
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            marginTop: 48,
            lineHeight: 1.1,
            maxWidth: 1020,
            display: "flex",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: "#d4d4d4",
            marginTop: 24,
            display: "flex",
          }}
        >
          {org}
        </div>

        <div
          style={{
            marginTop: "auto",
            color: "#a3a3a3",
            fontSize: 28,
            fontWeight: 500,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {date ? <div>{date}</div> : null}
          {address ? <div>{address}</div> : null}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 64,
            background: "#16a34a",
            color: "white",
            padding: "12px 28px",
            borderRadius: 9999,
            fontSize: 28,
            fontWeight: 700,
            display: "flex",
          }}
        >
          Check in →
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
      ],
    },
  );
}
