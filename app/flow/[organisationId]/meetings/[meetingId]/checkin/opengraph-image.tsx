import { ImageResponse } from "next/og";

import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";
import { getFormattedDateAndTimeInTimezone } from "@/utilities/helpers/date";

import { fetchMeetingForMeta, MeetingForMeta } from "./_meta";

export const runtime = "edge";
export const alt = "Meeting check-in";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_BASE_URL = ENVIRONMENT_VARIABLES.NEXT_PUBLIC_SITE_BASE_URL.replace(
  /\/$/,
  "",
);

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const res = await fetch(`${SITE_BASE_URL}/static/fonts/${filename}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    throw new Error(`Font fetch failed (${filename}): ${res.status}`);
  }
  return res.arrayBuffer();
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

  // Load fonts in parallel. If either fails (e.g. on Edge cold-start before
  // static assets propagate, or a misconfigured base URL) fall back to
  // Satori's system font rather than returning a 5xx — a 5xx response gets
  // cached by Slack/Twitter and poisons the share preview.
  let fonts:
    | { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" }[]
    | undefined;
  try {
    const [interBold, interMedium] = await Promise.all([
      loadFont("Inter-Bold.ttf"),
      loadFont("Inter-Medium.ttf"),
    ]);
    fonts = [
      { name: "Inter", data: interBold, weight: 700, style: "normal" },
      { name: "Inter", data: interMedium, weight: 500, style: "normal" },
    ];
  } catch (err) {
    console.error("[opengraph-image] font load failed:", err);
    fonts = undefined;
  }

  const title = meeting?.title ?? "Meeting check-in";
  const org = meeting?.organisation_name ?? "Tendiflow";
  const date = meeting
    ? getFormattedDateAndTimeInTimezone({
        utc: meeting.start_datetime,
        timezone: meeting.timezone,
      })
    : "";
  const address = meeting?.address ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
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
    fonts ? { ...size, fonts } : { ...size },
  );
}
