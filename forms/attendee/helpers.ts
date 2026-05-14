import { AttendeeCheckinLocation } from "@/api/services/tendiflow/attendees/types";
import { Meeting } from "@/api/services/tendiflow/meetings/types";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";

export interface CheckinValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TimingValidationResult {
  canCheckin: boolean;
  isEarly: boolean;
  isLate: boolean;
  message: string | null;
}

export interface LocationValidationResult {
  isWithinRadius: boolean;
  distanceMeters: number | null;
  requiredRadiusMeters: number | null;
  message: string | null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Validate check-in timing against meeting schedule
 */
export function validateCheckinTiming(
  meeting: Meeting,
): TimingValidationResult {
  const now = new Date();
  const startDateTime = new Date(meeting.start_datetime);
  const endDateTime = new Date(meeting.end_datetime);

  // Check if checkin window is configured
  const checkinWindowSeconds = meeting.settings.checkin_window_seconds;
  const lateCheckinSeconds = meeting.settings.late_checkin_seconds;

  if (!checkinWindowSeconds) {
    // No timing restrictions
    return {
      canCheckin: true,
      isEarly: false,
      isLate: false,
      message: null,
    };
  }

  // Calculate check-in window
  const checkinStart = new Date(
    startDateTime.getTime() - checkinWindowSeconds * 1000,
  );

  // Check if it's too early
  if (now < checkinStart) {
    const minutesUntilOpen = Math.ceil(
      (checkinStart.getTime() - now.getTime()) / (1000 * 60),
    );
    return {
      canCheckin: false,
      isEarly: true,
      isLate: false,
      message: `Check-in opens ${minutesUntilOpen} minute${minutesUntilOpen !== 1 ? "s" : ""} before the meeting starts. Please try again at ${getFormattedDateAndTime({ utc: meeting.start_datetime })}.`,
    };
  }

  // Check if it's too late (if late check-in is configured)
  if (lateCheckinSeconds) {
    const checkinEnd = new Date(
      endDateTime.getTime() + lateCheckinSeconds * 1000,
    );

    if (now > checkinEnd) {
      return {
        canCheckin: false,
        isEarly: false,
        isLate: true,
        message: `Check-in period has ended. Late check-in was allowed until ${getFormattedDateAndTime({ utc: meeting.end_datetime })}.`,
      };
    }
  }

  // Check if meeting has already ended (and no late check-in allowed)
  if (!lateCheckinSeconds && now > endDateTime) {
    return {
      canCheckin: false,
      isEarly: false,
      isLate: true,
      message:
        "This meeting has already ended and late check-in is not allowed.",
    };
  }

  return {
    canCheckin: true,
    isEarly: false,
    isLate: false,
    message: null,
  };
}

/**
 * Validate location against meeting requirements
 */
export function validateCheckinLocation(
  meeting: Meeting,
  userLocation: AttendeeCheckinLocation,
): LocationValidationResult {
  // If location verification is not required, always pass
  if (!meeting.settings.require_location_verification) {
    return {
      isWithinRadius: true,
      distanceMeters: null,
      requiredRadiusMeters: null,
      message: null,
    };
  }

  // If meeting has no coordinates, can't validate location
  if (!meeting.coordinates) {
    return {
      isWithinRadius: true,
      distanceMeters: null,
      requiredRadiusMeters: meeting.settings.checkin_radius_meters,
      message: "Meeting location coordinates not available for verification.",
    };
  }

  // If user location is not available
  if (!userLocation.latitude || !userLocation.longitude) {
    return {
      isWithinRadius: false,
      distanceMeters: null,
      requiredRadiusMeters: meeting.settings.checkin_radius_meters,
      message:
        "Your location is required for check-in verification. Please enable location services.",
    };
  }

  const requiredRadiusMeters = meeting.settings.checkin_radius_meters;

  // No radius configured = no radius check (matches backend's
  // is_within_checkin_radius which returns True when radius is null/0).
  // The location is still captured for record-keeping by the caller.
  if (!requiredRadiusMeters) {
    return {
      isWithinRadius: true,
      distanceMeters: null,
      requiredRadiusMeters: null,
      message: null,
    };
  }

  // Calculate distance
  const distanceMeters = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    meeting.coordinates.latitude,
    meeting.coordinates.longitude,
  );

  const isWithinRadius = distanceMeters <= requiredRadiusMeters;

  return {
    isWithinRadius,
    distanceMeters: Math.round(distanceMeters),
    requiredRadiusMeters,
    message: isWithinRadius
      ? null
      : `You are ${Math.round(distanceMeters)}m away from the meeting location. You must be within ${requiredRadiusMeters}m to check in.`,
  };
}

/**
 * Comprehensive check-in validation
 */
export function validateCheckin(
  meeting: Meeting,
  email: string,
  firstName: string,
  lastName: string,
  userLocation?: AttendeeCheckinLocation,
): CheckinValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!firstName.trim()) {
    errors.push("First name is required.");
  }

  if (!lastName.trim()) {
    errors.push("Last name is required.");
  }

  if (!email.trim()) {
    errors.push("Email is required.");
  } else if (!validateEmail(email)) {
    errors.push("Please enter a valid email address.");
  }

  // Validate timing
  const timingResult = validateCheckinTiming(meeting);
  if (!timingResult.canCheckin && timingResult.message) {
    errors.push(timingResult.message);
  }

  // Validate location if user location is provided
  if (userLocation) {
    const locationResult = validateCheckinLocation(meeting, userLocation);
    if (!locationResult.isWithinRadius && locationResult.message) {
      if (meeting.settings.require_location_verification) {
        errors.push(locationResult.message);
      } else {
        warnings.push(locationResult.message);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
