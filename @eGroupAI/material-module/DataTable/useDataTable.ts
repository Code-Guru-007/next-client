import { useEffect, useState, useMemo, useCallback } from "react";
import { ChartReportResult } from "interfaces/entities";
import cache from "./cache";
import { FilterValues } from "./typing";

export interface Options {
  fromKey?: string;
  sizeKey?: string;
  queryKey?: string;
  enableLocalStorageCache?: boolean;
}

export interface DefaultPayload {
  from?: number;
  size?: number;
  query?: string;
  [key: string]: any;
}

export interface TableConfig {
  density?: boolean;
}

export type TableReportResult = ChartReportResult;

export default function useDataTable<
  Config = TableConfig,
  ReportResult = TableReportResult,
  Payload = unknown
>(
  key: string,
  defaultPayloadProp?: Payload & DefaultPayload,
  options?: Options,
  defaultConfigProp?: Config,
  defaultReportResult?: ReportResult
) {
  const {
    fromKey = "startIndex",
    sizeKey = "size",
    queryKey = "query",
    enableLocalStorageCache,
  } = options || {};

  const { density = false } = (defaultConfigProp || {}) as TableConfig;

  const getCachedInfo = useCallback(() => {
    if (enableLocalStorageCache && typeof window !== "undefined") {
      const val = window.localStorage.getItem(`useDataTable-${key}`);
      return val ? JSON.parse(val) : cache.get(key);
    }
    return cache.get(key);
  }, [enableLocalStorageCache, key]);

  const defaultPayload: Payload & DefaultPayload = getCachedInfo()?.payload || {
    [fromKey]: 0,
    [sizeKey]: 10,
    ...defaultPayloadProp,
  };
  const [payload, setPayload] = useState<Payload & DefaultPayload>(
    defaultPayload
  );
  const [submitedPayload, setSubmitedPayload] = useState<
    Payload & DefaultPayload
  >(defaultPayload);

  // table config get and set
  const defaultConfig: Config = getCachedInfo()?.configs || {
    density,
  };
  const [configs, setConfigs] = useState<Config>(defaultConfig);

  // table report result get and set
  const reportResult: TableReportResult = getCachedInfo()?.reports ||
    defaultReportResult || {
      reportColumnList: {},
      reportDataList: [],
    };
  const [reports] = useState<TableReportResult>(reportResult);

  useEffect(() => {
    cache.set(key, { payload, configs, reports });
    if (enableLocalStorageCache && typeof window !== "undefined") {
      window.localStorage.setItem(
        `useDataTable-${key}`,
        JSON.stringify({ payload, configs, reports })
      );
    }
  }, [enableLocalStorageCache, key, payload, configs, reports]);

  const handleSearchChange = useCallback(
    (v) => {
      if (typeof v === "string") {
        setPayload((value) => ({
          ...value,
          [fromKey]: 0,
          [queryKey]: v,
        }));
      } else if (typeof v === "object") {
        setPayload((value) => ({
          ...value,
          [fromKey]: 0,
          [queryKey]: v.target.value,
        }));
      }
    },
    [fromKey, queryKey]
  );

  const handleChangePage = useCallback(
    (_, { page, rowsPerPage }) => {
      setPayload((value) => ({
        ...value,
        [fromKey]: page * rowsPerPage,
      }));
    },
    [fromKey]
  );

  const handleRowsPerPageChange = useCallback(
    (_, { rowsPerPage }) => {
      setPayload((value) => ({
        ...value,
        [fromKey]: 0,
        [sizeKey]: rowsPerPage,
      }));
    },
    [fromKey, sizeKey]
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
      startIndex: 0,
      filterValues,
    }));
    setSubmitedPayload((value) => ({
      ...value,
      startIndex: 0,
      filterValues,
    }));
  }, []);

  const handleFilterValuesClear = useCallback(
    (filterValues: FilterValues, clearState: number | string) => {
      if (clearState === "all") {
        setPayload((value) => ({
          ...value,
          equal: {},
          filterValues,
        }));
        if (submitedPayload.filterValues) {
          setSubmitedPayload((value) => ({
            ...value,
            equal: {},
            filterValues,
          }));
        }
      } else {
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

  const handleSetDensity = useCallback(({ density }) => {
    setConfigs((prev) => ({ ...prev, density }));
  }, []);

  const page = useMemo(
    () => Math.ceil(Number(payload[fromKey]) / Number(payload[sizeKey])),
    [fromKey, payload, sizeKey]
  );
  const rowsPerPage = useMemo(
    () => parseInt(payload[sizeKey] as string, 10),
    [payload, sizeKey]
  );

  return {
    handleSearchChange,
    handleChangePage,
    handleRowsPerPageChange,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    handleSelectFilterView,
    configs,
    setConfigs,
    handleSetDensity,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  };
}
