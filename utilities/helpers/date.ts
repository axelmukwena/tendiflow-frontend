import { DateTime } from "luxon";

/**
 * Convert string or number date input to Luxon DateTime object with local conversion handling
 * @param rawDate - date input as string or timestamp
 * @returns {DateTime | null} - converted DateTime object
 */
export const stringToDate = (rawDate: string | number): DateTime | null => {
  try {
    if (typeof rawDate === "number" || /^\d+$/.test(rawDate)) {
      const timestamp = Number(rawDate);
      const isSeconds = timestamp.toString().length === 10;
      return isSeconds
        ? DateTime.fromSeconds(timestamp)
        : DateTime.fromMillis(timestamp);
    }
    if (typeof rawDate === "string") {
      let date = DateTime.fromISO(rawDate);
      if (!date.isValid) {
        date = DateTime.fromRFC2822(rawDate);
      }
      if (!date.isValid) {
        date = DateTime.fromHTTP(rawDate);
      }
      if (!date.isValid) {
        date = DateTime.fromSQL(rawDate);
      }
      if (!date.isValid) {
        const jsDate = new Date(rawDate);
        if (!Number.isNaN(jsDate.getTime())) {
          date = DateTime.fromJSDate(jsDate);
        }
      }
      return date.isValid ? date : null;
    }
    return null;
  } catch {
    return null;
  }
};

interface GetFormattedDateProps {
  utc?: string | number | null;
  monthFormat?: "long" | "short";
  resetTime?: boolean;
}

/**
 * Format date to locale in "1 September 2021" format
 * @param {GetFormattedDateProps} props - the props object
 * @returns {string} - the formatted date
 */
export const getFormattedDate = ({
  utc: utcRaw,
  monthFormat = "long",
  resetTime,
}: GetFormattedDateProps): string => {
  if (!utcRaw) return "";
  let utc = utcRaw;
  if (resetTime) {
    utc = `${utc.toString().split("T")[0]}T00:00:00Z`;
  }
  const date = stringToDate(utc);
  if (!date) return "";
  const formatString = monthFormat === "long" ? "d MMMM yyyy" : "d MMM yyyy";
  return date.setLocale("en-GB").toFormat(formatString);
};

/**
 * Format time to locale in "12:00" format
 * @param inputDate - date to format
 * @returns {string} - the formatted time
 */
export const getFormattedTime = (inputDate: string | number | null): string => {
  if (!inputDate) return "";
  const date = stringToDate(inputDate);
  if (!date) return "";
  return date.toFormat("HH:mm");
};

/**
 * Format date and time to locale in "1 September 2021 at 12:00" format
 * @param {GetFormattedDateProps} props - the props object
 * @returns {string} - the formatted date and time
 */
export const getFormattedDateAndTime = ({
  utc,
  monthFormat,
}: GetFormattedDateProps): string => {
  if (!utc) return "";
  const formattedDate = getFormattedDate({ utc, monthFormat });
  const formattedTime = getFormattedTime(utc);
  return `${formattedDate} at ${formattedTime}`;
};

/**
 * Format date and time to locale in "1 September 2021 at 12:00" format,
 * rendered in the supplied IANA timezone (e.g. "Africa/Windhoek"). Mirrors
 * `getFormattedDateAndTime` but respects the timezone of the underlying
 * event rather than the runtime's local zone — important for server-rendered
 * metadata (Vercel Edge / serverless runtime defaults to UTC).
 *
 * @param {GetFormattedDateProps & { timezone: string }} props - the props object
 * @returns {string} - the formatted date and time in the given timezone, "" on invalid input
 */
export const getFormattedDateAndTimeInTimezone = ({
  utc,
  timezone,
  monthFormat = "long",
}: GetFormattedDateProps & { timezone: string }): string => {
  if (!utc) return "";
  const date = stringToDate(utc);
  if (!date) return "";
  const zoned = date.setZone(timezone || "utc");
  if (!zoned.isValid) return "";
  const monthToken = monthFormat === "short" ? "MMM" : "MMMM";
  return zoned.setLocale("en-GB").toFormat(`d ${monthToken} yyyy 'at' HH:mm`);
};

/**
 * Get time ago from date
 * @param inputDate - date to format
 * @returns {string} - the formatted time ago
 * @example "1 day ago"
 */
export const getTimeAgo = (inputDate: string | number): string => {
  const date = stringToDate(inputDate);
  if (!date) return "";
  return date.toRelative({ locale: "en", numberingSystem: "auto" }) || "";
};

// get the given date plus number of months
export const addMonths = (
  stringDate: string | number,
  months: number,
): DateTime | null => {
  const date = stringToDate(stringDate);
  if (!date) {
    return null;
  }
  return date.plus({ months });
};

interface GetUTCDateStringProps {
  date: DateTime;
  hours?: number;
  minutes?: number;
  timezone?: string;
}

/**
 * Get the UTC date string
 * @param {GetUTCDateStringProps} props - the props object
 * @returns {string} - the UTC date string
 * @example 2021-09-01T00:00:00Z
 */
export const getUTCDateString = ({
  date,
  hours,
  minutes,
  timezone,
}: GetUTCDateStringProps): string | null => {
  if (!date.isValid) {
    return null;
  }
  const dateInTimezone = date.setZone(timezone || "utc");
  const adjustedDate = dateInTimezone.set({
    hour: hours ?? 12,
    minute: minutes ?? 0,
  });
  return adjustedDate.toUTC().toISO({ suppressMilliseconds: true });
};

interface GetDayMonthYearResponse {
  weekday: string;
  day: string;
  month: string;
  year: string;
}

/**
 * Get the day, month, year and week day from a Luxon DateTime
 * @param date - the Luxon DateTime to get the day, month, year and week day
 * @returns {GetDayMonthYearResponse} - the day, month, year and week day
 * @example { weekday: "Wednesday", day: "01", month: "September", year: "2021" }
 */
export const getWeekDayMonthYear = (
  date: DateTime,
): GetDayMonthYearResponse => {
  const localizedDate = date.setLocale("en-GB");
  return {
    weekday: localizedDate.toFormat("EEEE"),
    day: localizedDate.toFormat("dd"),
    month: localizedDate.toFormat("MMMM"),
    year: localizedDate.toFormat("yyyy"),
  };
};

interface GetDayMonthYearNumericResponse {
  weekday: number;
  day: number;
  month: number;
  year: number;
}

/**
 * Get the day, month, year and week day as numbers from a Luxon DateTime
 * @param date - the Luxon DateTime to get the day, month, year and week day as numbers
 * @returns {GetDayMonthYearNumericResponse} - the day, month, year and week day as numbers
 * @example { weekday: 3, day: 1, month: 9, year: 2021 }
 */
export const getWeekDayMonthYearNumber = (
  date: DateTime,
): GetDayMonthYearNumericResponse => ({
  weekday: date.weekday,
  day: date.day,
  month: date.month,
  year: date.year,
});

interface FormatUTCToTimezoneProps {
  utc: string;
  timezone: string;
}

interface FormattedDateTime {
  weekday: string;
  day: string;
  month: string;
  year: string;
  hours: string;
  minutes: string;
  seconds: string;
}

/**
 * Converts an ISO UTC string to a provided timezone and returns formatted components.
 * @param {FormatUTCToTimezoneProps} props - the props object containing ISO string and timezone.
 * @returns {FormattedDateTime | null} - the formatted date components.
 * @example { weekday: "Wednesday", day: "01", month: "September", year: "2021", hours: "14", minutes: "30", seconds: "00" }
 */
export const formatUTCToTimezone = ({
  utc,
  timezone,
}: FormatUTCToTimezoneProps): FormattedDateTime | null => {
  try {
    // Parse the ISO UTC string and set it to the specified timezone
    const dateInTimezone = DateTime.fromISO(utc, { zone: "utc" }).setZone(
      timezone || "utc",
    );

    if (!dateInTimezone.isValid) {
      return null;
    }

    return {
      weekday: dateInTimezone.toFormat("cccc"), // Full weekday name
      day: dateInTimezone.toFormat("dd"), // Two-digit day
      month: dateInTimezone.toFormat("LLLL"), // Full month name
      year: dateInTimezone.toFormat("yyyy"), // Four-digit year
      hours: dateInTimezone.toFormat("HH"), // Two-digit hours
      minutes: dateInTimezone.toFormat("mm"), // Two-digit minutes
      seconds: dateInTimezone.toFormat("ss"), // Two-digit seconds
    };
  } catch (error) {
    console.error("Error converting UTC string to timezone:", error);
    return null;
  }
};

/**
 * Check if a date is older than a given number of hours
 * @param date - the date to check
 * @param hours - the number of hours
 * @returns {boolean} - true if the date is older than the given number of hours
 */
export const isOlderThanHours = (
  date: string | number,
  hours: number,
): boolean => {
  const dateObject = stringToDate(date);
  if (!dateObject) {
    return false;
  }

  const now = DateTime.now();
  const diffInHours = now.diff(dateObject, "hours").hours;
  return diffInHours > hours;
};

/**
 * Get the number of months between two dates
 * @param startDate - the start date
 * @param endDate - the end date
 * @returns {number} - the number of months between two dates
 */
export const getNumberOfMonths = (
  startDate?: string | number,
  endDate?: string | number,
): number => {
  if (!startDate || !endDate) {
    return 0;
  }
  const start = stringToDate(startDate);
  const end = stringToDate(endDate);
  if (!start || !end) {
    return 0;
  }

  const diffInMonths = end.diff(start, "months").months;
  return Math.round(diffInMonths);
};

/**
 * Get the depreciation date in the format "1 September 2021"
 * @param date - the date to format
 * @returns {string | undefined} - the formatted depreciation date
 * @example 1 September 2021
 */
export const getDepreciationDate = (
  date?: string | null,
): string | undefined => {
  if (!date) {
    return undefined;
  }
  const dateObject = stringToDate(date);
  if (!dateObject) {
    return undefined;
  }
  const { day, month, year } = getWeekDayMonthYear(dateObject);
  return `${day} ${month} ${year}`;
};

/**
 * Checks if the given UTC date string is expired.
 * @param {string} utcDateString - The UTC date string to check.
 * @returns {boolean} - Returns true if the date is expired, false otherwise.
 */
export const isDateExpired = (utcDateString?: string | null): boolean => {
  if (!utcDateString) {
    return false;
  }
  try {
    const dateToCheck = DateTime.fromISO(utcDateString, { zone: "utc" });
    const currentDate = DateTime.utc();
    if (!dateToCheck.isValid) {
      throw new Error("Invalid date string");
    }
    return dateToCheck < currentDate;
  } catch (error) {
    console.error("Error checking date expiration:", error);
    return false;
  }
};

/**
 * Checks if the given UTC date string will expire in `n` minutes or less.
 * @param {string} utcDateString - The UTC date string to check.
 * @param {number} minutes - The number of minutes threshold.
 * @returns {boolean} - Returns true if the date will expire in `n` minutes or less, false otherwise.
 */
export const willDateExpireInMinutes = (
  utcDateString: string,
  minutes: number,
): boolean => {
  try {
    const dateToCheck = DateTime.fromISO(utcDateString, { zone: "utc" });
    const currentDate = DateTime.utc();
    if (!dateToCheck.isValid) {
      throw new Error("Invalid date string");
    }
    const timeDifference = dateToCheck.diff(currentDate, "minutes").minutes;
    return timeDifference > 0 && timeDifference <= minutes;
  } catch (error) {
    console.error("Error checking if date will expire in minutes:", error);
    return false;
  }
};

interface IsDateExpiringSoonProps {
  utcDateString?: string | null;
  minutes: number;
}
/**
 * Checks if the given UTC date string is expired or expiring in `n` minutes.
 * @param {IsDateExpiringSoonProps} props - The props object.
 * @returns {boolean} - Returns true if the date is expired or will expire soon, if falsy or false otherwise.
 */
export const isDateExpiringSoon = ({
  utcDateString,
  minutes,
}: IsDateExpiringSoonProps): boolean => {
  if (!utcDateString) {
    return true;
  }
  const isExpired = isDateExpired(utcDateString);
  const willExpireSoon = willDateExpireInMinutes(utcDateString, minutes);
  return isExpired || willExpireSoon;
};

interface IsValidMonthDayProps {
  month: number;
  day: number;
}

/**
 * Checks if the given month and day are valid.
 * @param {IsValidMonthDayProps} props - The props object.
 * @returns {boolean} - Returns true if the month and day are valid, false otherwise.
 */
export const isValidMonthDay = ({
  month,
  day,
}: IsValidMonthDayProps): boolean => {
  const date = DateTime.local(2024, month, day);
  return date.isValid && date.month === month && date.day === day;
};

interface GetFiscalDatesProps {
  startMonth?: number;
  startDay?: number;
  endMonth?: number;
  endDay?: number;
}

interface FiscalDates {
  start?: string | null;
  end?: string | null;
}

/**
 * Get the fiscal start and end dates for an organisation.
 * @param {GetFiscalDatesProps} props - The props object.
 * @returns {FiscalDates} - The fiscal start and end dates.
 */
export const getFiscalDates = ({
  startMonth,
  startDay,
  endMonth,
  endDay,
}: GetFiscalDatesProps): FiscalDates => {
  if (!startMonth || !startDay || !endMonth || !endDay) {
    return {};
  }

  const currentYear = DateTime.now().year;

  // Start date in the current year
  const startDate = DateTime.utc(currentYear, startMonth, startDay);
  const start = getUTCDateString({ date: startDate });

  // Determine the correct year for the end date
  const endYear =
    startMonth > endMonth || (startMonth === endMonth && startDay > endDay)
      ? currentYear + 1
      : currentYear;

  // End date might be in the next year
  const endDate = DateTime.utc(endYear, endMonth, endDay);
  const end = getUTCDateString({ date: endDate });

  return { start, end };
};

interface DayMonth {
  day: number;
  month: number;
}

/**
 * Get day and month from a string in the format "day/month".
 * @param {string} dateString - The date string to extract day and month from.
 * @returns {DayMonth} - The day and month object.
 */
export const getDayMonthFromString = (dateString: string): DayMonth => {
  const split = dateString.split("/");
  const day = Number(split[0]) || 0;
  const month = Number(split[1]) || 0;
  return { day, month };
};

interface TimezoneWithGMT {
  timezone: string;
  timezones: string[];
}

/**
 * Get the current browser's time zone and list of supported time zones.
 * If a specific time zone is provided, it validates and uses that time zone.
 * @param timezone - optional time zone string to use instead of the browser's current time zone
 * @returns {timezone: string, timezones: string[]} - object containing the time zone and supported time zones
 */
export const getTimezoneWithGMT = (timezone?: string): TimezoneWithGMT => {
  const supportedTimeZones = Intl.supportedValuesOf("timeZone");
  const currentTimezone =
    timezone && supportedTimeZones.includes(timezone)
      ? timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!supportedTimeZones.includes(currentTimezone)) {
    throw new Error(`Unsupported time zone: ${currentTimezone}`);
  }
  return {
    timezone: currentTimezone,
    timezones: supportedTimeZones,
  };
};

/**
 * Get the current date in the format "YYYY-MM-DD"
 * @returns {string} - the current date
 */
export const getCurrentDateForFileName = (): string =>
  new Date()
    .toLocaleString("en-GB", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
    .replace(/[/,: ]/g, "-");

/**
 * Converts seconds to a human-readable time format
 * @param seconds - The number of seconds to convert
 * @returns A formatted string representing the time in a human-readable format
 */
export function formatSeconds(rawSeconds: unknown): string {
  let seconds = rawSeconds;
  // Check if the input is a string and convert it to a number
  if (typeof seconds === "string") {
    seconds = parseFloat(seconds);
  } else if (typeof seconds === "number") {
    seconds = Math.floor(seconds);
  } else {
    return "";
  }
  // Check if the input is a number
  if (typeof seconds !== "number") {
    return "";
  }
  // Handle invalid input
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "";
  }

  // Handle zero seconds
  if (seconds === 0) {
    return "0 seconds";
  }

  // Time unit definitions in seconds
  const timeUnits = [
    { unit: "year", seconds: 31536000 }, // 365 days
    { unit: "month", seconds: 2592000 }, // 30 days
    { unit: "week", seconds: 604800 }, // 7 days
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  // Calculate time parts
  const parts: string[] = [];
  let remainingSeconds = Math.floor(seconds);

  for (const { unit, seconds: unitSeconds } of timeUnits) {
    if (remainingSeconds >= unitSeconds) {
      const count = Math.floor(remainingSeconds / unitSeconds);
      remainingSeconds %= unitSeconds;

      // Add plural 's' if count is not 1
      const unitName = count === 1 ? unit : `${unit}s`;
      parts.push(`${count} ${unitName}`);
    }
  }

  // Handle special case - if no full units were found but we have fractional seconds
  if (parts.length === 0 && seconds > 0) {
    return `${seconds.toFixed(2)} seconds`;
  }

  // Format the output based on how many parts we have
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }
  // For more than 2 parts, use commas and 'and' for the last part
  const lastPart = parts.pop();
  return `${parts.join(", ")} and ${lastPart}`;
}

export const millisecondsToDays = (milliseconds: number): number =>
  Math.floor(milliseconds / (1000 * 60 * 60 * 24));

export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
