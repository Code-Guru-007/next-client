import React, { FC } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useFileEvents from "utils/useFileEvents";
// import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

// import Tooltip from "@eGroupAI/material/Tooltip";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
// import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
// import SendCustomSmsDialog from "components/SendCustomSmsDialog";

import { LineEvent, OrganizationUser } from "interfaces/entities";
import useOrgLines from "utils/useOrgLines";
// import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
// import apis from "utils/apis";
import I18nDataTable from "components/I18nDataTable";
import {
  ServiceModuleValue,
  LineEventTargetTypeMap,
  SourceTargetTypeMap,
  LineMessageTypeMap,
} from "interfaces/utils";
// import { Button } from "@mui/material";
// import Iconify from "minimal/components/iconify/iconify";
import { zhCN } from "date-fns/locale";
import { IconButton, TableCell, Tooltip } from "@mui/material";
import Iconify from "minimal/components/iconify";

export interface UserLinesProps {
  orgUserId?: string;
  orgUser?: OrganizationUser;
  readable?: boolean;
  deletable?: boolean;
}

const lineMessageType = ["IMAGE", "AUDIO", "VIDEO", "FILE"];
const UserLines: FC<UserLinesProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    orgUserId,
    orgUser,
    // readable = false,
    // writable = false,
    // deletable = false,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { handleDownloadFile, handlePreviewFile } = useFileEvents();
  const { query } = useRouter();
  const {
    handleChangePage,
    handleRowsPerPageChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    `CrmUserLineDataTable-${orgUserId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating } = useOrgLines(
    {
      organizationId,
    },
    {
      ...payload,
      targetServiceModule: ServiceModuleValue.CRM_USER,
      targetId: orgUser?.organizationUserId ?? query.organizationUserId,
    }
  );

  // const {
  //   isOpen: isCustomSmsOpen,
  //   handleClose: closeCustomSmsDialog,
  //   handleOpen: openCustomSmsDialog,
  // } = useIsOpen(false);

  // const { excute: sendCustomSmsToUser, isLoading: isSendingSmsUsers } =
  //   useAxiosApiWrapper(apis.org.sendCustomSmsToUser, "Create");

  // const buttonTools = writable && (
  //   <Tooltip title="Send Line">
  //     <Button
  //       onClick={openCustomSmsDialog}
  //       variant="contained"
  //       startIcon={<Iconify icon="material-symbols:send-to-mobile-rounded" />}
  //     >
  //       Send Line
  //     </Button>
  //   </Tooltip>
  // );

  // const handleCustomSmsSubmit = async (values) => {
  //   try {
  //     if (orgUser) {
  //       await sendCustomSmsToUser({
  //         organizationId,
  //         organizationSms: {
  //           organizationSmsSubject: values.organizationSmsSubject,
  //           organizationSmsContent: values.organizationSmsContent,
  //           targetId: orgUser.organizationUserId,
  //         },
  //         organizationUserList: [
  //           {
  //             organizationUserId: orgUser.organizationUserId,
  //             organizationUserPhone:
  //               values.phoneNumbers[orgUser.organizationUserId]
  //                 .organizationUserPhone || "",
  //           },
  //         ],
  //       });
  //       mutate();
  //       closeCustomSmsDialog();
  //     }
  //   } catch (error) {
  //     apis.tools.createLog({
  //       function: "DatePicker: handleCustomSmsSubmit",
  //       browserDescription: window.navigator.userAgent,
  //       jsonData: {
  //         data: error,
  //         deviceInfo: getDeviceInfo(),
  //       },
  //       level: "ERROR",
  //     });
  //   }
  // };

  return (
    <>
      <I18nDataTable
        title={wordLibrary?.LINE ?? "LINE紀錄"}
        rowKey="lineEventId"
        columns={[
          {
            id: "lineEventTargetType",
            name: `${wordLibrary?.behavior ?? "行為"}`,
            dataKey: "lineEventTargetType",
            format: (val) =>
              val ? LineEventTargetTypeMap[val as string] : val,
          },
          {
            id: "sourceTargetType",
            name: wordLibrary?.type ?? "類型",
            dataKey: "sourceTargetType",
            format: (val) => (val ? SourceTargetTypeMap[val as string] : val),
          },
          {
            id: "lineMessage.lineMessageType",
            name: wordLibrary?.["content type"] ?? "內容類型",
            dataKey: "lineMessage.lineMessageType",
            format: (val) => (val ? LineMessageTypeMap[val as string] : val),
          },
          {
            id: "lineMessage.lineMessageText",
            name: wordLibrary?.content ?? "內容",
            dataKey: "lineMessage.lineMessageText",
            render: (el: LineEvent) =>
              lineMessageType.includes(el.lineMessage.lineMessageType) &&
              el.lineMessage?.uploadFile ? (
                <TableCell key="fileName" sx={{ display: "flex" }}>
                  <Tooltip title={wordLibrary?.["download file"] ?? "下載檔案"}>
                    <IconButton
                      onClick={() => {
                        handleDownloadFile(
                          el.lineMessage.uploadFile.uploadFileId
                        );
                      }}
                    >
                      <Iconify icon="ic:round-download" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={wordLibrary?.["preview file"] ?? "預覽檔案"}>
                    <IconButton
                      onClick={() => {
                        handlePreviewFile(
                          el.lineMessage.uploadFile.uploadFileId
                        );
                      }}
                    >
                      <Iconify icon="material-symbols:visibility-rounded" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              ) : (
                <TableCell>{el.lineMessage.lineMessageText}</TableCell>
              ),
          },
          {
            id: "lineEventCreateDate",
            name: wordLibrary?.["creation time"] ?? "建立時間",
            dataKey: "lineEventCreateDate",
            format: (val) =>
              formatDate(val as string, "PP pp", { locale: zhCN }),
          },
        ]}
        data={data?.source || []}
        isEmpty={data?.total === 0}
        serverSide
        loading={isValidating}
        MuiTablePaginationProps={{
          count: data?.total ?? 0,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleRowsPerPageChange,
        }}
        // buttonTools={buttonTools}
      />
    </>
  );
};

export default UserLines;
