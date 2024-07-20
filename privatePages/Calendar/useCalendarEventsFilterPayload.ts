import { useEffect, useState, useCallback } from "react";
import Cache from "@eGroupAI/utils/Cache/Cache";
import { FilterValues } from "@eGroupAI/material-lab/FilterView";

const cache = new Cache();

export interface Options {
  queryKey?: string;
  enableLocalStorageCache?: boolean;
}

export interface DefaultPayload {
  query?: string;
  [key: string]: any;
}

export default function useCalendarEventsFilterPayload<Payload = unknown>(
  key: string,
  defaultPayloadProp?: Payload & DefaultPayload,
  options?: Options
) {
  const { queryKey = "query", enableLocalStorageCache } = options || {};

  const getCachePayload = useCallback(() => {
    if (enableLocalStorageCache && typeof window !== "undefined") {
      const val = window.localStorage.getItem(
        `useCalendarEventsFilterPayload-${key}`
      );
      return val ? JSON.parse(val) : cache.get(key);
    }
    return cache.get(key);
  }, [enableLocalStorageCache, key]);

  const defaultPayload: Payload & DefaultPayload = getCachePayload() || {
    ...defaultPayloadProp,
  };
  const [payload, setPayload] = useState<Payload & DefaultPayload>(
    defaultPayload
  );
  const [submitedPayload, setSubmitedPayload] = useState<
    Payload & DefaultPayload
  >(defaultPayload);

  useEffect(() => {
    cache.set(key, payload);
    if (enableLocalStorageCache && typeof window !== "undefined") {
      window.localStorage.setItem(
        `useCalendarEventsFilterPayload-${key}`,
        JSON.stringify(payload)
      );
    }
  }, [enableLocalStorageCache, key, payload]);

  const handleSearchChange = useCallback(
    (v) => {
      if (typeof v === "string") {
        setPayload((value) => ({
          ...value,
          [queryKey]: v,
        }));
      } else if (typeof v === "object") {
        setPayload((value) => ({
          ...value,
          [queryKey]: v.target.value,
        }));
      }
    },
    [queryKey]
  );

  const handleFilterValuesChange = useCallback((filterValues: FilterValues) => {
    setPayload((value) => ({
      ...value,
      filterValues,
    }));
  }, []);

  const handleFilterValuesSubmit = useCallback((filterValues: FilterValues) => {
    setPayload((value) => ({
      ...value,
      filterValues,
    }));
    setSubmitedPayload((value) => ({
      ...value,
      filterValues,
    }));
  }, []);

  const handleFilterValuesClear = useCallback(
    (filterValues: FilterValues) => {
      setPayload((value) => ({
        ...value,
        filterValues,
      }));
      if (submitedPayload.filterValues) {
        setSubmitedPayload((value) => ({
          ...value,
          filterValues,
        }));
      }
    },
    [submitedPayload.filterValues]
  );

  const handleSelectFilterView = useCallback(
    ({ startIndex, size, equal, range, filterValues }) => {
      setPayload((value) => ({
        ...value,
        startIndex,
        size,
        equal,
        range,
        filterValues,
      }));
      setSubmitedPayload((value) => ({
        ...value,
        startIndex,
        size,
        equal,
        range,
        filterValues,
      }));
    },
    []
  );

  return {
    handleSearchChange,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    handleSelectFilterView,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
  };
}
