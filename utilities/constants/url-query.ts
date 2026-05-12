import { OrderBy } from "@/api/services/tendiflow/types/general";
import { QueryParamKey, SelectOptionType } from "@/types/general";
import { PAGE_LIMIT_OPTIONS } from "@/utilities/constants/options";

export const QUERY_ORDER_BY_OPTIONS: SelectOptionType[] = [
  { name: "None", value: "" },
  { name: "Ascending", value: OrderBy.ASC },
  { name: "Descending", value: OrderBy.DESC },
];

// Combine and deduplicate sorting options
const combinedSortByOptions: SelectOptionType[] = [];

// Create a Set to filter out duplicate options based on their value
const uniqueSortByOptions = Array.from(
  new Map(
    combinedSortByOptions.map((option) => [option.value, option]),
  ).values(),
);

type AllQueryOptions = {
  [K in QueryParamKey]: SelectOptionType[] | null;
};

export const ALL_QUERY_OPTIONS: AllQueryOptions = {
  [QueryParamKey.SORT_BY]: uniqueSortByOptions,
  [QueryParamKey.ORDER_BY]: QUERY_ORDER_BY_OPTIONS,
  [QueryParamKey.PAGE]: null,
  [QueryParamKey.LIMIT]: PAGE_LIMIT_OPTIONS,
  [QueryParamKey.SEARCH]: null,
  [QueryParamKey.NUMBER]: null,
  [QueryParamKey.SESSION_ID]: null,
  [QueryParamKey.ORIGIN]: null,
  [QueryParamKey.SUBDOMAIN]: null,
};
