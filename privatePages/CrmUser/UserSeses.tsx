import React, { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Typography from "@eGroupAI/material/Typography";
import TableCell from "@eGroupAI/material/TableCell";
import Tooltip from "@eGroupAI/material/Tooltip";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";

import I18nDataTable from "components/I18nDataTable";
import SendCustomSesDialog from "components/SendCustomSesDialog";

import { OrganizationSesSendStatus } from "interfaces/utils";
import { OrganizationUser } from "interfaces/entities";
import useOrgSeses from "utils/useOrgSeses";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { Button } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

export interface UserSesesProps {
  orgUserId?: string;
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserSeses: FC<UserSesesProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    orgUserId,
    orgUser,
    // readable = false,
    writable = false,
    // deletable = false,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    `CrmUserSESDataTable-${orgUserId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating, mutate } = useOrgSeses(
    {
      organizationId,
    },
    {
      ...payload,
      targetId: orgUser?.organizationUserId,
    }
  );

  const {
    isOpen: isCustomSesOpen,
    handleClose: closeCustomSesDialog,
    handleOpen: openCustomSesDialog,
  } = useIsOpen(false);

  const { excute: sendCustomSesToUsers, isLoading: isSendingSesUsers } =
    useAxiosApiWrapper(apis.org.sendCustomSesToUsers, "Create");

  const buttonTools = writable && (
    <Tooltip title="發送Email">
      <Button
        onClick={openCustomSesDialog}
        variant="contained"
        startIcon={<Iconify icon="material-symbols:forward-to-inbox-rounded" />}
        id="send-email-button"
        data-tid="send-email-button"
      >
        {wordLibrary?.["send email"] ?? "發送Email"}
      </Button>
    </Tooltip>
  );

  const emails = useMemo(
    () =>
      orgUser
        ? {
            [orgUser.organizationUserId]: {
              organizationUserEmail: orgUser.organizationUserEmail,
              organizationUserNameZh: orgUser.organizationUserNameZh,
            },
          }
        : {},
    [orgUser]
  );

  const handleCustomSesSubmit = async (values) => {
    try {
      if (orgUser) {
        await sendCustomSesToUsers({
          organizationId,
          organizationSes: {
            organizationSesSubject: values.organizationSesSubject,
            organizationSesContent: values.organizationSesContent,
          },
          organizationUserList: [
            {
              organizationUserId: orgUser.organizationUserId,
              organizationUserEmail:
                values.emails[orgUser.organizationUserId]
                  .organizationUserEmail || "",
            },
          ],
        });
        mutate();
        closeCustomSesDialog();
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleCustomSesSubmit",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  return (
    <>
      <I18nDataTable
        title={wordLibrary?.SES ?? "信件紀錄"}
        rowKey="organizationSesId"
        columns={[
          {
            id: "organizationSesEmail",
            name: wordLibrary?.["electronic mail"] ?? "電子郵件",
            dataKey: "organizationSesEmail",
          },
          // {
          //   id: "organizationSesSendDate",
          //   name: wordLibrary?.["sending time"] ?? "發送時間",
          //   dataKey: "organizationSesSendDate",
          //   format: (val) => formatDate(val as string, "PP pp"),
          // },
          {
            id: "organizationSesCreateDate",
            name: wordLibrary?.["creation time"] ?? "建立時間",
            dataKey: "organizationSesCreateDate",
            format: (val) => formatDate(val as string, "PP pp"),
          },
          {
            id: "organizationSesContent",
            name: wordLibrary?.["ses content"] ?? "SES內容",
            dataKey: "organizationSesContent",
          },
          {
            id: "organizationSesSendStatus",
            name: wordLibrary?.status ?? "狀態",
            dataKey: "organizationSesSendStatus",
            render: (ses) => {
              if (
                ses.organizationSesSendStatus ===
                OrganizationSesSendStatus.SUCCESS
              ) {
                return (
                  <TableCell key="status">
                    <Typography variant="body2" color="success">
                      {wordLibrary?.success ?? "成功"}
                    </Typography>
                  </TableCell>
                );
              }
              return (
                // <TableCell key="status">
                //   <Typography variant="body2" color="error">
                //     {wordLibrary?.failed ?? "失敗"}
                //   </Typography>
                // </TableCell>
                <TableCell key="status">
                  <Typography variant="body2" color="success">
                    {wordLibrary?.success ?? "成功"}
                  </Typography>
                </TableCell>
              );
            },
          },
        ]}
        data={data?.source ?? []}
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
        buttonTools={buttonTools}
      />
      <SendCustomSesDialog
        loading={isSendingSesUsers}
        open={isCustomSesOpen}
        closeDialog={closeCustomSesDialog}
        emails={emails}
        onConfirm={handleCustomSesSubmit}
      />
    </>
  );
};

export default UserSeses;
