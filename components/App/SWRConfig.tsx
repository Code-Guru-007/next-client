import React, { FC } from "react";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import EgSWRConfig from "@eGroupAI/hooks/apis/EgSWRConfig";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const SWRConfig: FC = function ({ children }) {
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>("globalSnackbar");
  const wordLibrary = useSelector(getWordLibrary);

  return (
    <EgSWRConfig
      value={{
        onError: (error, key) => {
          if (!error?.response?.status) {
            return;
          }
          switch (error.response.status) {
            case 403:
              openSnackbar({
                message:
                  wordLibrary?.[
                    "you do not have permission to perform this operation"
                  ] ?? "您沒有操作權限",
                severity: "error",
              });
              break;
            case 404:
              openSnackbar({
                message: wordLibrary?.["no data found"] ?? "找不到資料",
                severity: "error",
              });
              break;
            case 401:
              openSnackbar({
                message: wordLibrary?.unauthorized ?? "未經授權",
                severity: "error",
              });
              break;
            default:
              apis.tools.createLog({
                function: "SWRConfig",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  action: key,
                  data: error.response,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
              break;
          }
        },
      }}
    >
      {children}
    </EgSWRConfig>
  );
};

export default SWRConfig;
