import React, { ChangeEvent, useEffect } from "react";

import { useSelector } from "react-redux";
import { useAppDispatch } from "redux/configureAppStore";
import useOrgUploadFiles from "utils/useOrgUploadFiles";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { FilePathType, ServiceModuleValue } from "interfaces/utils";
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

const useStyles = makeStyles(() => ({
  itemText: {
    textAlign: "center",
  },
}));

const SelectStatementStep = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { setPreviewData } = props;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const dispatch = useAppDispatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uploadFileTargets = useSelector(getUploadFileTargetList) || [];
  const { handleUploadFile } = useFileEvents();
  const { data, mutate } = useOrgUploadFiles(
    {
      organizationId,
    },
    {
      filePathType: FilePathType.USER_AGREEMENT,
    }
  );

  const checkedAll =
    uploadFileTargets && data?.source.length === uploadFileTargets.length;
  const indeterminate =
    (uploadFileTargets.length || 0) > 0 &&
    data?.source.length !== uploadFileTargets.length;

  useEffect(() => {
    setPreviewData((prev) => ({
      ...prev,
      uploadFileList: data?.source.filter((el) =>
        uploadFileTargets.find(
          ({ uploadFile: { uploadFileId } }) => uploadFileId === el.uploadFileId
        )
      ),
    }));
  }, [
    data?.source,
    setPreviewData,
    uploadFileTargets,
    uploadFileTargets.length,
  ]);

  const handleToggleAll = () => {
    if (checkedAll) {
      dispatch(setUploadFileTargets([]));
    } else {
      const allUploadFiles =
        data?.source.map((el) => ({
          uploadFile: { uploadFileId: el.uploadFileId },
        })) || [];
      dispatch(setUploadFileTargets(allUploadFiles));
    }
  };

  const handleToggle = (uploadFileId: string) => () => {
    const currentIndex = uploadFileTargets.findIndex(
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
        onUploadSuccess: () => mutate(),
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
        {data?.source.length === 0 ? (
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
      {data?.source.map((el) => (
        <ListItem disablePadding key={el.uploadFileId}>
          <ListItemButton onClick={handleToggle(el.uploadFileId)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                disableRipple
                checked={
                  !!uploadFileTargets.find(
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
