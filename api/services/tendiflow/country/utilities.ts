import { REST_COUNTRIES } from "./constants";
import { RestCountry } from "./types";

/**
 * Find country based on query
 * @param query - query to search for
 * @returns RestCountry | null
 */
export const findRestCountry = (
  query: unknown,
): RestCountry | null | undefined => {
  if (typeof query !== "string" || !query.trim()) {
    return null;
  }
  const lowerQuery = query.trim().toLowerCase();

  // 1. First, check for an **exact match** in ISO, name, or aliases
  return REST_COUNTRIES.find(
    (c) =>
      c.iso.toLowerCase() === lowerQuery ||
      c.name.toLowerCase() === lowerQuery ||
      (c.aliases &&
        c.aliases.some((alias) => alias.toLowerCase() === lowerQuery)),
  );
};

/**
 * Find currency based on currency code
 * @param currencyCode - currency code to search for
 * @returns RestCountry | null
 */
export const findRestCurrency = (currencyCode: unknown): RestCountry | null => {
  if (typeof currencyCode !== "string" || !currencyCode.trim()) {
    return null;
  }
  const lowerCode = currencyCode.trim().toUpperCase();
  const country = REST_COUNTRIES.find(
    (c) =>
      c.currency_code === lowerCode ||
      (c.aliases &&
        c.aliases.some((alias) => alias.toUpperCase() === lowerCode)),
  );
  return country || null;
};

/**
 * Find country based on iso code
 * @param iso - iso code to search for
 * @returns RestCountry | null
 */
export const findRestCountryByIso = (iso: string): RestCountry | null =>
  REST_COUNTRIES.find((c) => c.iso === iso) || null;
