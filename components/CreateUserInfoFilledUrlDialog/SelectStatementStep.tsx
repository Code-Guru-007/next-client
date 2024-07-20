import React, { ChangeEvent, useEffect } from "react";

import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/configureAppStore";
import { ServiceModuleValue } from "interfaces/utils";
import { makeStyles } from "@mui/styles";

import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";

import { getUploadFileTargetList } from "redux/createUserInfoFilledUrlDialog/selectors";
import { setUploadFileTargets } from "redux/createUserInfoFilledUrlDialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { Button, Stack } from "@mui/material";
import Iconify from "minimal/components/iconify";
import useFileEvents from "utils/useFileEvents";
import { ShareReurl, UploadFile } from "interfaces/entities";
import { EntityList } from "@eGroupAI/typings/apis";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";

export interface SelectStatementStepProps {
  setShareEditPreviewValues: React.Dispatch<
    React.SetStateAction<ShareReurl | undefined>
  >;
  uploadFiles: EntityList<UploadFile> | undefined;
}

const useStyles = makeStyles(() => ({
  itemText: {
    textAlign: "center",
  },
}));

const SelectStatementStep = function (props) {
  const { setPreviewData, uploadFiles } = props;

  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);

  const classes = useStyles();
  const dispatch = useAppDispatch();
  const matchMutate = useSwrMatchMutate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uploadFileTargets = useSelector(getUploadFileTargetList) || [];
  const { handleUploadFile } = useFileEvents();

  const checkedAll = uploadFiles?.source.length === uploadFileTargets.length;
  const indeterminate =
    uploadFileTargets.length > 0 &&
    uploadFiles?.source.length !== uploadFileTargets.length;

  useEffect(() => {
    setPreviewData((prev) => ({
      ...prev,
      uploadFileList: uploadFiles?.source.filter((el) =>
        uploadFileTargets.find(
          ({ uploadFile: { uploadFileId } }) => uploadFileId === el.uploadFileId
        )
      ),
    }));
  }, [
    uploadFiles?.source,
    setPreviewData,
    uploadFileTargets,
    uploadFileTargets.length,
  ]);

  const handleToggleAll = () => {
    if (checkedAll) {
      dispatch(setUploadFileTargets([]));
    } else {
      const allUploadFiles =
        uploadFiles?.source.map((el) => ({
          uploadFile: { uploadFileId: el.uploadFileId },
        })) || [];
      dispatch(setUploadFileTargets(allUploadFiles));
    }
  };

  const handleToggle = (uploadFileId: string) => () => {
    const currentIndex = uploadFileTargets?.findIndex(
      (o) => o.uploadFile.uploadFileId === uploadFileId
    );
    const newList = [...uploadFileTargets];

    if (currentIndex === -1) {
      newList.push({
        uploadFile: {
          uploadFileId,
        },
      });
    } else {
      newList.splice(currentIndex, 1);
    }
    dispatch(setUploadFileTargets(newList));
  };

  const handleAgreementUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      handleUploadFile({
        files: Array.from(e.currentTarget.files),
        filePathType: ServiceModuleValue.USER_AGREEMENT,
        onUploadSuccess: () => {
          matchMutate(
            new RegExp(
              `^/organizations/${organizationId}/upload-files\\?filePathType=USER_AGREEMENT`,
              "g"
            )
          );
        },
      });
    }
  };

  return (
    <List>
      <Stack direction="row" justifyContent="end">
        <Button
          component="label"
          variant="contained"
          startIcon={<Iconify icon="eva:cloud-upload-fill" />}
        >
          上傳聲明書
          <input type="file" hidden onChange={handleAgreementUpload} />
        </Button>
      </Stack>
      <ListItem disablePadding>
        {uploadFiles?.source.length === 0 ? (
          <ListItemText primary="沒有數據" className={classes.itemText} />
        ) : (
          <ListItemButton onClick={handleToggleAll}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                disableRipple
                checked={checkedAll}
                indeterminate={indeterminate}
              />
            </ListItemIcon>
            <ListItemText primary={wordLibrary?.all ?? "全部"} />
          </ListItemButton>
        )}
      </ListItem>
      {uploadFiles?.source.map((el) => (
        <ListItem disablePadding key={el.uploadFileId}>
          <ListItemButton onClick={handleToggle(el.uploadFileId)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                disableRipple
                checked={
                  !!uploadFileTargets?.find(
                    (o) => o.uploadFile.uploadFileId === el.uploadFileId
                  )
                }
              />
            </ListItemIcon>
            <ListItemText primary={el.uploadFileName} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SelectStatementStep;
