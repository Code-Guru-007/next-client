import React, { useContext, useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";

import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemButton from "@eGroupAI/material/ListItemButton";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import Checkbox from "@eGroupAI/material/Checkbox";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { UserExportDialogContext } from "./UserExportDialogContext";
import { ExtendedUploadFile, SelectStatementStepProps } from "./typings";

const useStyles = makeStyles(() => ({
  itemText: {
    textAlign: "center",
  },
}));

const SelectStatementStep = function (props: SelectStatementStepProps) {
  const { uploadFiles } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const { exportAgreementFileList, setExportAgreementFileList } = useContext(
    UserExportDialogContext
  );

  const [agreementFiles, setAgreementFiles] = useState<ExtendedUploadFile[]>(
    uploadFiles?.map((el) => ({
      ...el,
      checked: Boolean(
        exportAgreementFileList.find((f) => f.uploadFileId === el.uploadFileId)
          ?.checked
      ),
    })) || []
  );

  const checkedAll = uploadFiles?.length === exportAgreementFileList.length;
  const indeterminate =
    (exportAgreementFileList.length || 0) > 0 &&
    uploadFiles?.length !== exportAgreementFileList.length;

  const handleToggleAll = () => {
    if (checkedAll) {
      const allUploadFiles =
        uploadFiles?.map((el) => ({
          ...el,
          checked: false,
        })) || [];
      setAgreementFiles(allUploadFiles);
    } else {
      const allUploadFiles =
        uploadFiles?.map((el) => ({
          ...el,
          checked: true,
        })) || [];
      setAgreementFiles(allUploadFiles);
    }
  };

  const handleToggle = (uploadFileId: string) => () => {
    setAgreementFiles((prevList) =>
      prevList.map((el) => {
        if (el.uploadFileId === uploadFileId)
          return { ...el, checked: !el.checked };
        return { ...el };
      })
    );
  };

  useEffect(() => {
    setExportAgreementFileList(agreementFiles.filter((f) => f.checked));
  }, [agreementFiles, setExportAgreementFileList]);

  return (
    <List>
      <ListItem disablePadding>
        {uploadFiles?.length === 0 ? (
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
      {uploadFiles?.map((el) => (
        <ListItem disablePadding key={el.uploadFileId}>
          <ListItemButton onClick={handleToggle(el.uploadFileId)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                disableRipple
                checked={Boolean(
                  agreementFiles.find((o) => o.uploadFileId === el.uploadFileId)
                    ?.checked
                )}
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
