import React, { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Tooltip from "@eGroupAI/material/Tooltip";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";

import SendCustomSmsDialog from "components/SendCustomSmsDialog";

import { OrganizationUser } from "interfaces/entities";
import useOrgSmses from "utils/useOrgSmses";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import I18nDataTable from "components/I18nDataTable";
import { ServiceModuleValue } from "interfaces/utils";
import { Button } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import { zhCN } from "date-fns/locale";

export interface UserSmsesProps {
  orgUserId?: string;
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserSmses: FC<UserSmsesProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    orgUserId,
    orgUser,
    // readable = false,
    writable = false,
    // deletable = false,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { query } = useRouter();
  const {
    handleChangePage,
    handleRowsPerPageChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    `CrmUserSMSDataTable-${orgUserId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating, mutate } = useOrgSmses(
    {
      organizationId,
    },
    {
      ...payload,
      organizationShareTargetType: ServiceModuleValue.CRM_USER,
      targetId: orgUser?.organizationUserId || query?.userId,
    }
  );

  const {
    isOpen: isCustomSmsOpen,
    handleClose: closeCustomSmsDialog,
    handleOpen: openCustomSmsDialog,
  } = useIsOpen(false);

  const { excute: sendCustomSmsToUser, isLoading: isSendingSmsUsers } =
    useAxiosApiWrapper(apis.org.sendCustomSmsToUser, "Create");

  const buttonTools = writable && (
    <Tooltip title="Send SMS">
      <Button
        onClick={openCustomSmsDialog}
        variant="contained"
        startIcon={<Iconify icon="material-symbols:send-to-mobile-rounded" />}
        id="send-sms-button"
        data-tid="send-sms-button"
      >
        Send SMS
      </Button>
    </Tooltip>
  );

  const phoneNumbers = useMemo(
    () =>
      orgUser
        ? {
            [orgUser.organizationUserId]: {
              organizationUserPhone: orgUser.organizationUserPhone,
              organizationUserNameZh: orgUser.organizationUserNameZh,
            },
          }
        : {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgUser, isCustomSmsOpen]
  );

  const handleCustomSmsSubmit = async (values) => {
    try {
      if (orgUser) {
        if (values.organizationSmsSendDate)
          await sendCustomSmsToUser({
            organizationId,
            organizationSms: {
              organizationSmsSubject: values.organizationSmsSubject,
              organizationSmsContent: values.organizationSmsContent,
              targetId: orgUser.organizationUserId,
              organizationSmsSendDate: values.organizationSmsSendDate,
            },
            organizationUserList: values?.organizationUserList,
          });
        else
          await sendCustomSmsToUser({
            organizationId,
            organizationSms: {
              organizationSmsSubject: values.organizationSmsSubject,
              organizationSmsContent: values.organizationSmsContent,
              targetId: orgUser.organizationUserId,
            },
            organizationUserList: values?.organizationUserList,
          });
        mutate();
        closeCustomSmsDialog();
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleCustomSmsSubmit",
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
        title={wordLibrary?.SMS ?? "簡訊紀錄"}
        rowKey="organizationSmsId"
        columns={[
          {
            id: "organizationSmsSubject",
            name: `${wordLibrary?.subject ?? "主旨"}`,
            dataKey: "organizationSmsSubject",
            sortkey: "organizationSmsSubject",
          },
          {
            id: "organizationSmsContent",
            name: wordLibrary?.content ?? "內容",
            dataKey: "organizationSmsContent",
          },
          {
            id: "organizationSmsPhone",
            name: wordLibrary?.phone ?? "電話",
            dataKey: "organizationSmsPhone",
          },
          // {
          //   id: "organizationSmsSendDate",
          //   name: wordLibrary?.["sending time"] ?? "發送時間",
          //   dataKey: "organizationSmsSendDate",
          //   format: (val) => formatDate(val as string, "PP pp"),
          // },
          {
            id: "creatorMemberName",
            name: wordLibrary?.creator ?? "建立者",
            dataKey: "creator.memberName",
          },
          {
            id: "organizationSmsSendDate",
            name: wordLibrary?.["send date"] ?? "發送日期",
            dataKey: "organizationSmsSendDate",
            format: (val) =>
              formatDate(val as string, "PP pp", { locale: zhCN }),
          },
          {
            id: "organizationSmsSendStatusMessage",
            name: wordLibrary?.["sms send status message"] ?? "簡訊發送狀態",
            dataKey: "organizationSmsSendStatusMessage",
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
        buttonTools={buttonTools}
      />
      <SendCustomSmsDialog
        loading={isSendingSmsUsers}
        open={isCustomSmsOpen}
        closeDialog={closeCustomSmsDialog}
        phoneNumbers={phoneNumbers}
        onConfirm={handleCustomSmsSubmit}
      />
    </>
  );
};

export default UserSmses;
