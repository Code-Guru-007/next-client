import React, { useCallback, useEffect, useState } from "react";

import { DIALOG as IMPORT_DIALOG } from "components/ImportUsersDialog";
import { getIsImporting } from "redux/importUsersDialog/selectors";
import useStateRef from "@eGroupAI/hooks/useStateRef";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import websocketRegister from "utils/websocketRegister";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { OrganizationColumn, OrganizationUser } from "interfaces/entities";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { ServiceModuleValue } from "interfaces/utils";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useAppDispatch } from "redux/configureAppStore";
import useInputRefActions from "@eGroupAI/hooks/useInputRefActions";
import {
  setTotalUsers,
  setDuplicateUsers,
  setUniqueUsers,
  setErrorUsers,
  setIsImporting,
} from "redux/importUsersDialog";
import log from "utils/devLog";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import ImportUsersDialog from "components/ImportUsersDialog/ImportUsersDialog";

import { Button } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import spliceIntoArrays from "./spliceIntoArrays";

import UserUploadFileImportDialog from "./UserUploadFileImportDialog";

const ImportIconButton = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const isImporting = useSelector(getIsImporting);
  const dispatch = useAppDispatch();
  const { inputEl, clearValue } = useInputRefActions();
  const { uploadOrgFiles, isOrgUploading } = useUploadFilesHandler();
  const { openDialog: openImportDialog } = useReduxDialog(IMPORT_DIALOG);
  const {
    isOpen,
    handleOpen: openUploadDialog,
    handleClose: closeUploadDialog,
  } = useIsOpen(false);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);
  const { excute: createOrgUsers } = useAxiosApiWrapper(
    apis.org.createOrgUsers,
    "None"
  );
  const [dynamicColumnList, setDynamicColumnList] = useState<
    OrganizationColumn[]
  >([]);
  const matchMutate = useSwrMatchMutate();
  const [, setUsers, usersRef] = useStateRef<OrganizationUser[]>([]);
  const [isDone, setIsDone] = useState(false);

  const handleCreateOrgUsers = useCallback(
    (organizationUserList: OrganizationUser[]) => {
      const nestArray = spliceIntoArrays(organizationUserList, 10);
      let finish = 0;
      const promises = nestArray.reduce(
        (a, b) =>
          a.then(() =>
            createOrgUsers({
              organizationId,
              dynamicColumnList,
              organizationUserList: b,
            }).then(() => {
              finish += 5;
              openSnackbar({
                message: `${
                  wordLibrary?.["please wait"] ?? "請稍候"
                }(${finish}/${organizationUserList.length})`,
                severity: "warning",
                autoHideDuration: 999999,
              });
              matchMutate(
                new RegExp(
                  `^/organizations/${organizationId}/search/users\\?`,
                  "g"
                )
              );
            })
          ),
        Promise.resolve()
      );
      return promises.then(() => {
        closeSnackbar({
          autoHideDuration: 4000,
        });
      });
    },
    [
      createOrgUsers,
      dynamicColumnList,
      matchMutate,
      closeSnackbar,
      openSnackbar,
      organizationId,
      wordLibrary,
    ]
  );

  useEffect(() => {
    if (isDone) {
      setIsDone(false);
      const duplicateUsers = usersRef.current.filter(
        (el) => el.importStatus === "DB_DUPLICATE"
      );
      const uniqueUsers = usersRef.current.filter(
        (el) => el.importStatus === "DB_UNIQUE"
      );
      const errorUsers = usersRef.current.filter(
        (el) => el.importStatus === "FORMAT_ERROR"
      );
      dispatch(setTotalUsers(usersRef.current));
      dispatch(setDuplicateUsers(duplicateUsers));
      dispatch(setUniqueUsers(uniqueUsers));
      dispatch(setErrorUsers(errorUsers));
      log("errorUsers");
      log(errorUsers);
      log("uniqueUsers");
      log(uniqueUsers);
      log("duplicateUsers");
      log(duplicateUsers);
      if (errorUsers.length > 0) {
        openImportDialog();
      }
      if (uniqueUsers.length === 0 && duplicateUsers.length > 0) {
        openImportDialog();
      } else if (uniqueUsers.length > 0 && duplicateUsers.length > 0) {
        handleCreateOrgUsers(uniqueUsers)
          .then(() => {
            openImportDialog();
          })
          .catch(() => {});
      } else if (uniqueUsers.length > 0 && duplicateUsers.length === 0) {
        handleCreateOrgUsers(uniqueUsers);
      }
    }
  }, [dispatch, handleCreateOrgUsers, isDone, openImportDialog, usersRef]);

  useEffect(() => {
    fetch("/api/socket/import-user")
      .then(() => {
        websocketRegister.register("importSocket");

        let showProgress;
        websocketRegister
          .get("importSocket")
          ?.on("receive-user-data", (data) => {
            if (!showProgress) {
              showProgress = setInterval(() => {
                const latestUser =
                  usersRef.current[usersRef.current.length - 1];
                if (latestUser) {
                  openSnackbar({
                    message: `匯入中請稍候(${latestUser.number}/${latestUser.total})`,
                    severity: "warning",
                    autoHideDuration: 999999,
                  });
                }
              }, 1000);
            }

            const handleFinish = () => {
              setIsDone(true);
              dispatch(setIsImporting(false));
              clearInterval(showProgress);
              clearValue();
              showProgress = undefined;
              websocketRegister.get("importSocket")?.disconnect();
              closeSnackbar({
                autoHideDuration: 4000,
              });
            };
            log(data);
            if (data === "done") {
              handleFinish();
            } else {
              const user: OrganizationUser = JSON.parse(data);
              setUsers((v) => [...v, user]);
              if (user.importStatus === "FORMAT_ERROR") {
                handleFinish();
                websocketRegister.get("importSocket")?.disconnect();
              }
            }
          });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadFile = async (uploadFiles: File[]) => {
    if (uploadFiles) {
      websocketRegister.get("importSocket")?.connect();
      const uploadFileId = await uploadOrgFiles({
        organizationId,
        files: Array.from(uploadFiles),
        filePathType: ServiceModuleValue.FILES,
      })
        .then((res) => (res ? res.data[0]?.uploadFileId : undefined))
        .catch(() => {});
      if (!uploadFileId) return;
      openSnackbar({
        message: "匯入中請稍候...",
        severity: "warning",
        autoHideDuration: 9999,
      });
      dispatch(setIsImporting(true));
      apis.org
        .getImportDynamicColumns({
          organizationId,
          uploadFileId,
        })
        .then((res) => {
          setDynamicColumnList(res.data.dynamicColumnList);
          // clear previous data
          setUsers([]);
          websocketRegister.get("importSocket")?.emit(
            "import-user-data",
            JSON.stringify({
              uploadFileId,
              organization: {
                organizationId,
              },
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })
          );
          closeUploadDialog();
        })
        .catch(() => {});
    }
  };

  return (
    <>
      <Button
        onClick={openUploadDialog}
        variant="contained"
        startIcon={<Iconify icon="ic:round-publish" width={18} />}
        disabled={isImporting}
        id="table-import-button"
        data-tid="table-import-button"
      >
        {wordLibrary?.["list import"] ?? "名單匯入"}
      </Button>
      <UserUploadFileImportDialog
        isOpen={isOpen}
        inputEl={inputEl}
        uploading={isOrgUploading}
        handleUpload={handleUploadFile}
        closeDialog={closeUploadDialog}
      />
      <ImportUsersDialog />
    </>
  );
};

export default ImportIconButton;
