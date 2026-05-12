import useSWR from "swr";

import { getRestCountriesFetcher } from "@/api/services/tendiflow/country/fetchers";
import { RestCountry } from "@/api/services/tendiflow/country/types";
import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";
import { getErrorMessage } from "@/utilities/helpers/errors";

interface UseCountries {
  countries: RestCountry[];
  isLoading: boolean;
  error?: string;
}

interface UseCountriesProps {
  search?: string | null;
  codes?: string[] | null;
  searchCodesOrNone?: boolean;
}

/**
 * Hook to fetch countries based on search and iso code
 * @param search - search string
 * @param countryIsoCode - the country iso code
 * @param codeOrNone - boolean to check if code is present or not
 * @returns UseCountries
 */
export const useCountries = ({
  search,
  codes,
  searchCodesOrNone,
}: UseCountriesProps): UseCountries => {
  const fetcher = async (): Promise<RestCountry[]> =>
    getRestCountriesFetcher({ search, codes, searchCodesOrNone });

  const { data, error, isLoading } = useSWR(
    `${ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_BASE_URL}/api/countries?search=${search}` +
      `&codes=${codes?.join(",")}&searchCodesOrNone=${searchCodesOrNone}`,
    fetcher,
  );

  return {
    countries: data || [],
    isLoading,
    error: getErrorMessage(error),
  };
};
