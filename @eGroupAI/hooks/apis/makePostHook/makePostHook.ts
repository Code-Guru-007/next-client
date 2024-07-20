import { useCallback, useEffect } from "react";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import queryString, { StringifiableRecord } from "query-string";
import useSWR, { SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteApiStack,
  destroyApi,
  egApiRequest,
} from "@eGroupAI/redux-modules";
import {
  PathParams as DefaultPathParamsType,
  ReturnedValues,
} from "@eGroupAI/typings/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import apis from "utils/apis";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { SnackbarProps } from "@eGroupAI/material";
import { LogApiPayload } from "interfaces/payloads";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";

import useKey from "./useKey";

const SNACKBAR = "globalSnackbar";
const statusToMessageKey = {
  422: "incomplete data input, please double-check",
  403: "you do not have access permission",
  400: "system error, please contact the administrator",
  404: "no data found",
  500: "server error, we will fix it as soon as possible",
  502: "bad gateway, retrying ...",
};

export default function makePostHook<
  Data = unknown,
  PathParams = DefaultPathParamsType,
  Body = unknown,
  ErrorData = unknown
>(
  urlPattern: string,
  fetcherArg: AxiosInstance,
  defaultPathParams?: PathParams,
  defaultBody?: Body,
  defaultQueryParams?: StringifiableRecord,
  defaultConfig?: SWRConfiguration<AxiosResponse<Data>, AxiosError<ErrorData>>,
  immutable?: boolean
) {
  const useSelectedSWR = immutable ? useSWRImmutable : useSWR;

  return function useItem(
    pathParams?: PathParams,
    body?: Body,
    queryParams?: StringifiableRecord,
    customConfig?: SWRConfiguration<AxiosResponse<Data>, AxiosError<ErrorData>>,
    disableFetch?: boolean
  ): ReturnedValues<Data, ErrorData> {
    const dispatch = useDispatch();
    const wordLibrary = useSelector(getWordLibrary);
    const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

    const fetcher = useCallback(
      (urlArg) => {
        const {
          url,
          query: { payload, ...query },
        } = queryString.parseUrl(urlArg);
        const postUrl = `${url}?${queryString.stringify(query)}`;

        return fetcherArg.post<Data>(postUrl, {
          ...defaultBody,
          ...body,
        });
      },
      [body]
    );

    const getKey = useKey({
      defaultPathParams,
      defaultQueryParams,
      pathParams,
      queryParams,
      disableFetch,
      urlPattern,
      body,
    });

    const key = getKey();

    const { error, data, mutate, isValidating } = useSelectedSWR(key, fetcher, {
      ...defaultConfig,
      ...customConfig,
    });

    useEffect(() => {
      if (isValidating) dispatch(egApiRequest({ leafs: [urlPattern] }));
      return () => {
        if (isValidating) {
          dispatch(destroyApi([urlPattern]));
          dispatch(deleteApiStack([urlPattern]));
        }
      };
    }, [dispatch, isValidating]);

    const getLocalizedMessage = useCallback(
      (status, defaultMessage) => {
        const key = statusToMessageKey[status];
        return wordLibrary?.[key] ?? defaultMessage;
      },
      [wordLibrary]
    );

    useEffect(() => {
      if (!error || !error.response || isValidating) return;

      let defaultErrMsgWithStatus = getLocalizedMessage(null, "");
      if (error?.response?.status && !isValidating) {
        switch (error?.response.status) {
          case 422:
            defaultErrMsgWithStatus = getLocalizedMessage(
              422,
              "輸入資料不完整，請再次確認"
            );
            break;
          case 403:
            defaultErrMsgWithStatus = getLocalizedMessage(
              403,
              "您沒有存取權限"
            );
            break;
          case 400:
            defaultErrMsgWithStatus = getLocalizedMessage(
              400,
              "系統異常，請稍後再試。"
            );
            break;
          case 404:
            defaultErrMsgWithStatus = getLocalizedMessage(404, "找不到資料");
            break;
          case 500:
            defaultErrMsgWithStatus = getLocalizedMessage(
              500,
              "伺服器出現問題，技術團隊正在處理中。"
            );
            break;
          case 502:
            defaultErrMsgWithStatus = getLocalizedMessage(
              502,
              `重新嘗試中... ${(error.config as any).__retryCount}`
            );
            break;
          default:
            defaultErrMsgWithStatus = "發生未知錯誤，請稍後再試。";
            break;
        }
      }
      // show error msg
      openSnackbar({
        message: defaultErrMsgWithStatus,
        severity: "error",
        action: null,
      });
      // send error log
      let logPayload: LogApiPayload = {
        function: "makePostHook",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          deviceInfo: getDeviceInfo(),
          data: error?.response,
        },
        level: "ERROR",
      };
      if (!error?.response) {
        logPayload = {
          ...logPayload,
          message: error?.message,
        };
      }
      if (
        error &&
        error.response &&
        error.response.status !== 404 &&
        error.response.status !== 403 &&
        error.response.status !== 422 &&
        error.response.status !== 401
      ) {
        apis.tools.createLog(logPayload);
        // throw new Error(String(error.response?.status));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error, isValidating]);

    return {
      data: data?.data,
      isError: !!error,
      mutate,
      response: data,
      error,
      key,
      isValidating,
    };
  };
}
