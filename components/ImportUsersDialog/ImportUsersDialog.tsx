import React from "react";

import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { useAppDispatch } from "redux/configureAppStore";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import {
  getErrorUsers,
  getSelectedSimilarUser,
  getIndex,
  getDuplicateUsers,
} from "redux/importUsersDialog/selectors";
import {
  setIndex,
  setAddIndex,
  setSelectedSimilarUser,
} from "redux/importUsersDialog";

import Iconify from "minimal/components/iconify";
import Image from "next/legacy/image";
import { Button, Stack, Typography } from "@mui/material";

import ImportUsersTable from "./ImportUsersTable";
import ImportUsersCompare from "./ImportUsersCompare";

export const DIALOG = "ImportUsersDialog";

const ImportUsersDialog = function () {
  const dispatch = useAppDispatch();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const errorUsers = useSelector(getErrorUsers);
  const selectedSimilarUser = useSelector(getSelectedSimilarUser);
  const index = useSelector(getIndex);
  const duplicateUsers = useSelector(getDuplicateUsers);

  const wordLibrary = useSelector(getWordLibrary);
  const comparedImportUser = duplicateUsers[index];
  const hasError = errorUsers.length > 0;
  const { excute: createOrgUser, isLoading: isCreating } = useAxiosApiWrapper(
    apis.org.createOrgUser,
    "Create"
  );
  const { excute: updateOrgUser, isLoading: isUpdating } = useAxiosApiWrapper(
    apis.org.updateOrgUser,
    "Update"
  );
  const matchMutate = useSwrMatchMutate();

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullScreen
      sx={{ "& .MuiDialogContent-root": { p: 0 } }}
    >
      <DialogContent
        sx={{ fontFamily: (theme) => theme.typography.fontFamily }}
      >
        <Stack
          direction={"row"}
          sx={{
            pl: { lg: 5, xs: 3 },
            py: { lg: 3, xs: 1 },
            width: "100%",
            borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          <Image src="/events/logo.svg" width="60" height="60" />
        </Stack>
        <Stack
          direction={"row"}
          justifyContent={"flex-start"}
          sx={{
            ml: { lg: 5, xs: 3 },
            my: { lg: 3, xs: 1 },
            width: "50%",
          }}
        >
          <Button
            variant={"text"}
            startIcon={<Iconify icon="ion:chevron-back" />}
            onClick={closeDialog}
          >
            返回
          </Button>
        </Stack>
        <Stack
          sx={{
            pl: { lg: 5, xs: 3 },
            pt: { lg: 2, xs: 1 },
            width: "100%",
          }}
        >
          <Typography variant="h4">
            {hasError ? "匯入資料格式錯誤" : "重複客戶匯入資料確認"}
          </Typography>
        </Stack>
        {hasError ? <ImportUsersTable /> : <ImportUsersCompare />}
      </DialogContent>
      <DialogActions>
        <Box flexGrow={1} />
        {!hasError && <DialogCloseButton onClick={closeDialog} />}
        <DialogConfirmButton
          loading={isCreating || isUpdating}
          onClick={async () => {
            if (hasError) {
              closeDialog();
              return;
            }
            if (!comparedImportUser) return;
            try {
              if (selectedSimilarUser) {
                const {
                  organizationUserId,
                  similarOrganizationUserList,
                  importStatus,
                  organizationUserGender,
                  ...data
                } = comparedImportUser;
                await updateOrgUser({
                  organizationId,
                  organizationUserId: selectedSimilarUser?.organizationUserId,
                  organizationUserGender:
                    organizationUserGender !== undefined
                      ? `${organizationUserGender}`
                      : undefined,
                  ...data,
                  isFromImport: 1,
                });
                if (index + 1 < duplicateUsers.length) {
                  dispatch(setAddIndex());
                  dispatch(setSelectedSimilarUser());
                } else {
                  dispatch(setIndex(0));
                  closeDialog();
                  matchMutate(
                    new RegExp(
                      `^/organizations/${organizationId}/search/users\\?`,
                      "g"
                    )
                  );
                }
              } else {
                const {
                  organizationUserId,
                  similarOrganizationUserList,
                  importStatus,
                  organizationUserGender,
                  ...data
                } = comparedImportUser;
                await createOrgUser({
                  organizationId,
                  organizationUserGender:
                    organizationUserGender !== undefined
                      ? `${organizationUserGender}`
                      : undefined,
                  ...data,
                  isFromImport: 1,
                });
                if (index + 1 < duplicateUsers.length) {
                  dispatch(setAddIndex());
                  dispatch(setSelectedSimilarUser());
                } else {
                  dispatch(setIndex(0));
                  closeDialog();
                  matchMutate(
                    new RegExp(
                      `^/organizations/${organizationId}/search/users\\?`,
                      "g"
                    )
                  );
                }
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              apis.tools.createLog({
                function: "DatePicker: handleDelete",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          }}
        >
          {hasError && (wordLibrary?.close ?? "關閉")}
          {!hasError && selectedSimilarUser && "是同一人"}
          {!hasError && !selectedSimilarUser && "不是同一人"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default ImportUsersDialog;
