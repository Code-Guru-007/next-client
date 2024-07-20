import React, { FC, useState, useCallback, useMemo } from "react";

import { useRouter } from "next/router";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import Stack from "@mui/material/Stack";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getOrgShare } from "redux/createUserInfoFilledUrlDialog/selectors";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { ServiceModuleValue, SmsSendType } from "interfaces/utils";
import { useAppDispatch } from "redux/configureAppStore";
import {
  initializeOrgShareValues,
  setOrgShare,
  setOrgShareEdits,
} from "redux/createUserInfoFilledUrlDialog";
import { SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { OrganizationUser } from "interfaces/entities";
import { useDataTable } from "@eGroupAI/material-module/DataTable";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useOrgShares from "utils/useOrgShares";
import { format as formatDate } from "@eGroupAI/utils/dateUtils";
import { zhCN } from "date-fns/locale";
import { zonedTimeToUtc } from "date-fns-tz";

import { uniqueId } from "lodash";
import Tooltip from "@eGroupAI/material/Tooltip";
import CopyTextField from "@eGroupAI/material/CopyTextField";
import TableCell from "@eGroupAI/material/TableCell";
import Button from "@eGroupAI/material/Button";
import { Button as MuiButton, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { makeStyles } from "@mui/styles";
import I18nDataTable from "components/I18nDataTable";
import CreateUserInfoFilledUrlDialog from "components/CreateUserInfoFilledUrlDialog";
import SendSmsDialog, { PhoneNumbers } from "components/SendSmsDialog";
import { ShareEditValuesType } from "components/CreateUserInfoFilledUrlDialog/typings";
import CopyUrlDialog, { DIALOG as COPY_DIALOG } from "./CopyUrlDialog";
import PreviewUserInfoFilledDialog, {
  DIALOG as PREVIEW_DIALOG,
} from "./PreviewUserInfoFilledDialog";

const useStyles = makeStyles(() => ({
  previewButton: {
    width: 51,
  },
}));

export interface UserSharesProps {
  orgUserId?: string;
  orgUser?: OrganizationUser;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const UserShares: FC<UserSharesProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    orgUserId,
    orgUser,
    // readable = false,
    writable = false,
    // deletable = false,
  } = props;
  const router = useRouter();
  const classes = useStyles(props);
  const dispatch = useAppDispatch();
  const [
    selectedOrganizationShareShortUrl,
    setSelectedOrganizationShareShortUrl,
  ] = useState<string>("");
  const organizationId = useSelector(getSelectedOrgId);
  const orgShare = useSelector(getOrgShare);
  const {
    handleChangePage,
    handleRowsPerPageChange,
    payload,

    page,
    rowsPerPage,
  } = useDataTable(
    `CrmUserSharesDataTable-${orgUserId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );
  const { data, isValidating, mutate } = useOrgShares(
    {
      organizationId,
    },
    {
      targetId: orgUser?.organizationUserId || router.query.userId,
      ...payload,
    }
  );

  const { openDialog: openCopyDialog } = useReduxDialog(COPY_DIALOG);
  const { openDialog: openPreviewDialog } = useReduxDialog(PREVIEW_DIALOG);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const {
    isOpen: isInfoFilledOpen,
    handleClose: closeFilledDialog,
    handleOpen: openFilledDialog,
  } = useIsOpen(false);
  const {
    isOpen: isSendSmsOpen,
    handleClose: closeSendSmsDialog,
    handleOpen: openSendSmsDialog,
  } = useIsOpen(false);
  const { excute: createOrgSms, isLoading: isCreatingSms } = useAxiosApiWrapper(
    apis.org.createOrgSms,
    "Create",
    "發送成功"
  );
  const { excute: createOrgShare, isLoading: isCreatingShare } =
    useAxiosApiWrapper(apis.org.createOrgShare);

  const handleOpenFilledDialog = () => {
    dispatch(initializeOrgShareValues());
    openFilledDialog();
  };

  const buttonTools = writable && (
    <Tooltip title={wordLibrary?.["generate fill in link"] ?? "產生填寫連結"}>
      <MuiButton
        onClick={handleOpenFilledDialog}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
        id="generate-fill-in-link-button"
        data-tid="generate-fill-in-link-button"
      >
        {wordLibrary?.["generate fill in link"] ?? "產生填寫連結"}
      </MuiButton>
    </Tooltip>
  );

  const handleSendSmsConfirm = (values) => {
    if (orgUser && orgShare) {
      const targetSendSmses = values.organizationUserList.map((el) =>
        values.organizationSmsSendDate
          ? createOrgSms({
              organizationId,
              smsSendType_: SmsSendType.SHARE,
              organizationSmsSubject: values.organizationSmsSubject,
              organizationSmsContent: values.organizationSmsContent,
              organizationSmsSendDate: values.organizationSmsSendDate,
              organizationSmsPhone: el.organizationUserPhone || "",
              targetId: orgShare.organizationShareId,
            })
          : createOrgSms({
              organizationId,
              smsSendType_: SmsSendType.SHARE,
              organizationSmsSubject: values.organizationSmsSubject,
              organizationSmsContent: values.organizationSmsContent,
              organizationSmsPhone: el?.organizationUserPhone || "",
              targetId: orgShare.organizationShareId,
            })
      );
      closeSendSmsDialog();
      return Promise.all(targetSendSmses);
    }
    return undefined;
  };

  const phoneNumbers: PhoneNumbers = useMemo(
    () =>
      orgUser
        ? {
            [uniqueId(`${orgUser.organizationUserId}-`)]: {
              organizationUserPhone: orgUser?.organizationUserPhone,
              organizationUserNameZh: orgUser?.organizationUserNameZh,
            },
          }
        : {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgUser, isSendSmsOpen]
  );

  const handleOnSubmit = useCallback(
    async (values: ShareEditValuesType) => {
      if (orgUser) {
        try {
          const res = await createOrgShare({
            organizationId,
            targetId: orgUser.organizationUserId,
            organizationShareEditList: values.organizationShareEditList,
            organizationFinanceTemplateList:
              values.organizationFinanceTemplateList,
            uploadFileTargetList: values.uploadFileTargetList,
            organizationShareEditNeedUpload:
              values.organizationShareEditNeedUpload,
            organizationShareIsOneTime: values.organizationShareIsOneTime,
            organizationShareExpiredDate: values.organizationShareExpiredDate,
            organizationShareUploadDescription:
              values.organizationShareUploadDescription,
            organizationShareWelcomeMessage:
              values.organizationShareWelcomeMessage,
            organizationShareFinishMessage:
              values.organizationShareFinishMessage,
            organizationShareTargetType: ServiceModuleValue.CRM_USER,
          });

          dispatch(setOrgShare(res.data));
          closeFilledDialog();
          openCopyDialog();
          mutate();
          dispatch(setOrgShareEdits([]));
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleOnSubmit",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      }
    },
    [
      closeFilledDialog,
      createOrgShare,
      dispatch,
      mutate,
      openCopyDialog,
      orgUser,
      organizationId,
    ]
  );

  return (
    <>
      <SendSmsDialog
        loading={isCreatingSms}
        open={isSendSmsOpen}
        closeDialog={closeSendSmsDialog}
        phoneNumbers={phoneNumbers}
        orgUserId={orgUser?.organizationUserId}
        orgUserName={orgUser?.organizationUserNameZh}
        onConfirm={handleSendSmsConfirm}
      />
      <CopyUrlDialog
        onConfirm={() => {
          openSendSmsDialog();
        }}
      />
      <CreateUserInfoFilledUrlDialog
        orgUser={orgUser}
        loading={isCreatingShare}
        onSubmit={handleOnSubmit}
        open={isInfoFilledOpen}
        closeDialog={closeFilledDialog}
      />
      <PreviewUserInfoFilledDialog
        organizationShareShortUrl={selectedOrganizationShareShortUrl}
      />
      <I18nDataTable
        title={wordLibrary?.["share editing"] ?? "分享編輯"}
        rowKey="organizationShareId"
        columns={[
          {
            id: "organizationShareShortUrl",
            name: wordLibrary?.["copy link"] ?? "複製連結",
            dataKey: "organizationShareShortUrl",
            render: (el) => (
              <TableCell key="url">
                <Stack direction="row">
                  <CopyTextField
                    margin="dense"
                    value={`https://${window.location.host}/reurl/${el.organizationShareShortUrl}`}
                    onCopy={() => {
                      openSnackbar({
                        message: wordLibrary?.["copy successful"] ?? "複製成功",
                        severity: "success",
                      });
                    }}
                    variant="outlined"
                    fullWidth
                    size="small"
                  />
                  <Tooltip title={wordLibrary?.preview ?? "預覽"}>
                    <IconButton
                      className={classes.previewButton}
                      onClick={() => {
                        setSelectedOrganizationShareShortUrl(
                          el.organizationShareShortUrl
                        );
                        openPreviewDialog();
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            ),
          },
          {
            id: "organizationShareCreatedate",
            name: wordLibrary?.["sharing time"] ?? "分享時間",
            dataKey: "organizationShareCreatedate",
            format: (val) =>
              formatDate(
                zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                "PP pp",
                {
                  locale: zhCN,
                }
              ),
          },
          {
            id: "creator.memberName",
            name: wordLibrary?.creator ?? "建立者",
            dataKey: "creator.memberName",
          },
          {
            id: "organizationShareIsOneTime",
            name: wordLibrary?.["can only be edited once"] ?? "只能編輯一次",
            dataKey: "organizationShareIsOneTime",
            format: (val) => (val === 1 ? "是" : "否"),
          },
          {
            id: "organizationShareExpiredDate",
            name: wordLibrary?.["link expiry"] ?? "連結時效性",
            dataKey: "organizationShareExpiredDate",
            format: (val) =>
              formatDate(
                zonedTimeToUtc(new Date(val), "Asia/Taipei"),
                "PP pp",
                {
                  locale: zhCN,
                }
              ),
          },
          {
            id: "sendSms",
            name: wordLibrary?.["send text message"] ?? "發送簡訊",
            dataKey: "sendSms",
            render: (val) => (
              <TableCell key="sendSms">
                <Button
                  variant="contained"
                  rounded
                  color="primary"
                  onClick={() => {
                    dispatch(setOrgShare(val));
                    openSendSmsDialog();
                  }}
                >
                  {wordLibrary?.["text message sending"] ?? "簡訊發送"}
                </Button>
              </TableCell>
            ),
          },
        ]}
        data={data?.source || []}
        isEmpty={data?.total === 0}
        enableRowCheckbox
        serverSide
        loading={isValidating}
        buttonTools={buttonTools}
        MuiTablePaginationProps={{
          count: data?.total ?? 0,
          page,
          rowsPerPage,
          onPageChange: handleChangePage,
          onRowsPerPageChange: handleRowsPerPageChange,
        }}
      />
    </>
  );
};

export default UserShares;
