import { REST_COUNTRIES } from "./constants";
import { RestCountry } from "./types";

interface GetCountriesFetcherProps {
  search?: string | null;
  codes?: string[] | null;
  searchCodesOrNone?: boolean;
}

/**
 * Fetches countries based on search and iso code using Axios
 * @param search - search string
 * @param codes - list of country ISO codes
 * @param codeOrNone - boolean to check if code is present or not
 * @returns Promise<RestCountry[]>
 */
export const getRestCountriesFetcher = async ({
  search,
  codes,
  searchCodesOrNone,
}: GetCountriesFetcherProps): Promise<RestCountry[]> => {
  if (searchCodesOrNone && !codes?.length && !search) {
    return [];
  }
  try {
    const countries = REST_COUNTRIES;
    if (search) {
      return countries.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.iso.toLowerCase().includes(search.toLowerCase()) ||
          // in aliases
          c.aliases.some((alias) =>
            alias.toLowerCase().includes(search.toLowerCase()),
          ),
      );
    }

    if (codes?.length) {
      return countries.filter((country) =>
        codes.includes(country.iso.toUpperCase()),
      );
    }

    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};
