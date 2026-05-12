import {
  AttendeeCheckinDevice,
  AttendeeCheckinLocation,
} from "@/api/services/tendiflow/attendees/types";

export interface CheckInMetadata {
  locationInfo: AttendeeCheckinLocation;
  deviceInfo: AttendeeCheckinDevice;
}

/**
 * Get screen resolution information
 */
function getScreenResolution(): string | null {
  if (typeof window !== "undefined" && window.screen) {
    return `${window.screen.width}x${window.screen.height}`;
  }
  return null;
}

/**
 * Get user's timezone
 */
function getTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error("Error getting timezone:", error);
    return null;
  }
}

/**
 * Get information about the user's browser and device
 */
function getDeviceInfo(userAgent: string): AttendeeCheckinDevice {
  let browser: string | null = null;
  let os: string | null = null;
  let device: string | null = null;

  // Browser detection
  if (userAgent.includes("Firefox/")) {
    browser = "Firefox";
  } else if (userAgent.includes("Chrome/")) {
    browser = "Chrome";
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    browser = "Safari";
  } else if (userAgent.includes("Edg/")) {
    browser = "Edge";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
    browser = "Internet Explorer";
  }

  // OS detection
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS X")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
  }

  // Device type detection
  if (userAgent.includes("Mobile")) {
    device = "Mobile";
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    device = "Tablet";
  } else {
    device = "Desktop";
  }

  return {
    browser,
    os,
    device,
    user_agent: userAgent,
    screen_resolution: getScreenResolution(),
    timezone: getTimezone(),
  };
}

/**
 * Probe the browser's geolocation permission without invoking a prompt.
 *
 * Returns "granted" when the site already has permission (we can call
 * getCurrentPosition silently with no gesture), "prompt" when the
 * browser will show the native dialog on the next call, "denied" when
 * the user has refused, and "unknown" when the Permissions API isn't
 * available (very old browsers).
 */
export async function getGeolocationPermissionState(): Promise<
  "granted" | "prompt" | "denied" | "unknown"
> {
  if (typeof navigator === "undefined" || !navigator.permissions) {
    return "unknown";
  }
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch {
    return "unknown";
  }
}

interface CollectCheckInMetadataOptions {
  /**
   * Whether to call navigator.geolocation. Defaults to true.
   *
   * Set to false from non-gesture contexts (e.g. a useEffect on mount):
   * iOS Safari often refuses to show the permission prompt outside a
   * user tap, leaving the call to time out for nothing. Skip it there
   * and call again from a button handler when a real gesture is available.
   */
  requestLocation?: boolean;
}

/**
 * Collect all browser-side check-in metadata.
 *
 * Intentionally has zero third-party network calls — these used to hang
 * indefinitely on slow/blocked free APIs (ipify, Nominatim). The backend
 * now stamps the request IP from X-Forwarded-For and reverse-geocodes
 * lat/lng via the Google Maps key, so the client only contributes what
 * it alone knows: GPS coords + the user agent.
 */
export async function collectCheckInMetadata(
  { requestLocation = true }: CollectCheckInMetadataOptions = {},
): Promise<CheckInMetadata> {
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "Unknown";

  // Backend will populate ip_address and address.
  const locationInfo: AttendeeCheckinLocation = {
    latitude: 0,
    longitude: 0,
    address: "",
    ip_address: "",
    accuracy: 0,
    timestamp: new Date().toISOString(),
  };

  const deviceInfo = getDeviceInfo(userAgent);

  if (
    requestLocation &&
    typeof navigator !== "undefined" &&
    navigator.geolocation
  ) {
    try {
      // The Geolocation API's `timeout` option only counts time spent
      // acquiring a fix AFTER the permission prompt has been resolved. On
      // Safari the prompt can sit indefinitely (e.g. user ignores it), so
      // we race against a wall-clock deadline to keep the flow moving.
      const position = await Promise.race<GeolocationPosition>([
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }),
        new Promise<GeolocationPosition>((_, reject) =>
          setTimeout(
            () => reject(new Error("geolocation_wall_timeout")),
            12_000,
          ),
        ),
      ]);

      locationInfo.latitude = position.coords.latitude;
      locationInfo.longitude = position.coords.longitude;
      locationInfo.accuracy = position.coords.accuracy || 0;
    } catch (error) {
      console.error("Error getting geolocation:", error);
      locationInfo.latitude = 0;
      locationInfo.longitude = 0;
      locationInfo.accuracy = 0;
    }
  }

  return {
    locationInfo,
    deviceInfo,
  };
}
