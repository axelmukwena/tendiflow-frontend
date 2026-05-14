import { useEffect, useState } from "react";

import { AttendeeSortBy } from "@/api/services/tendiflow/attendees/types";
import { OrderBy } from "@/api/services/tendiflow/types/general";
import { useDebounce } from "@/hooks/utilities/debounce";
import { useQueryParam } from "@/hooks/utilities/query-param";
import { QueryParamKey } from "@/types/general";

interface UseAttendeeUserPagination {
  search?: string;
  sortBy?: AttendeeSortBy;
  orderBy?: OrderBy;
  limit: number;
  page: number;
  total: number;
  handlePageChange: (event: { selected: number }) => void;
  handleLimitChange: (value: string) => void;
  handleSort: (sortBy: AttendeeSortBy, orderBy: OrderBy) => void;
  setTotal: (total: number) => void;
}

export const useAttendeeUserPagination = (): UseAttendeeUserPagination => {
  const [searchRaw] = useQueryParam<string>(QueryParamKey.SEARCH);
  const debouncedSearch = useDebounce(searchRaw || "", 1000);
  const [sortBy, , setSortAndOrderQuery] = useQueryParam<AttendeeSortBy>(
    QueryParamKey.SORT_BY,
  );
  const [orderBy] = useQueryParam<OrderBy>(QueryParamKey.ORDER_BY);
  const [limitQuery] = useQueryParam<string>(QueryParamKey.LIMIT);
  const [pageQuery, setPageQuery, setLimitPageQuery] = useQueryParam<string>(
    QueryParamKey.PAGE,
  );
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const parsePageLimitQueries = (): void => {
    const currentLimit = limitQuery ? Number(limitQuery) : limit;
    setLimit(currentLimit || 10);
    const currentPage = Number(pageQuery) ? Number(pageQuery) - 1 : 0;
    setPage(currentPage);
  };

  useEffect(() => {
    parsePageLimitQueries();
  }, [limitQuery, pageQuery]);

  const handlePageChange = (event: { selected: number }): void => {
    const { selected } = event;
    setPageQuery(event.selected > 0 ? `${selected + 1}` : "");
  };

  const handleLimitChange = (value: string): void => {
    setLimitPageQuery({
      [QueryParamKey.LIMIT]: value,
      [QueryParamKey.PAGE]: "",
    });
  };

  // Sorting updates `sort_by` + `order_by` in the URL and resets the page
  // so the user lands on page 1 of the new ordering (rather than the
  // now-misaligned slice of a different sort).
  const handleSort = (
    newSortBy: AttendeeSortBy,
    newOrderBy: OrderBy,
  ): void => {
    setSortAndOrderQuery({
      [QueryParamKey.SORT_BY]: newSortBy,
      [QueryParamKey.ORDER_BY]: newOrderBy,
      [QueryParamKey.PAGE]: "",
    });
  };

  useEffect(() => {
    const activeItems = document.querySelectorAll(".page-item:not(.disabled)");
    if (activeItems.length) {
      activeItems[0].classList.remove("last-active");
      activeItems[0].classList.add("first-active");
      activeItems[activeItems.length - 1].classList.add("last-active");
    }
  }, [page, total, limit]);

  return {
    search: debouncedSearch || undefined,
    sortBy: sortBy || undefined,
    orderBy: orderBy || undefined,
    limit,
    page,
    total,
    handlePageChange,
    handleLimitChange,
    handleSort,
    setTotal,
  };
};
