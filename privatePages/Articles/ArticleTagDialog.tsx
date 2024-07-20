import React, { FC, useCallback, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { FilterSearch } from "@eGroupAI/typings/apis";
import { OrganizationTag } from "interfaces/entities";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR } from "components/App";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import TagAutocomplete from "components/TagAutocomplete";
import spliceIntoArrays from "utils/spliceIntoArrays";

import { getWordLibrary } from "redux/wordLibrary/selectors";

export const DIALOG = "ArticleTagDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface ArticleTagDialogProps {
  filterSearch: FilterSearch;
  isCheckedAllPageRows: boolean;
  selectedArticleIds: string[];
  excludeSelectedArticleIds: string[];
  setSuccess: (e: boolean) => void;
}

const ArticleTagDialog: FC<ArticleTagDialogProps> = function (props) {
  const {
    filterSearch,
    selectedArticleIds,
    isCheckedAllPageRows,
    excludeSelectedArticleIds,
    setSuccess,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const organizationId = useSelector(getSelectedOrgId);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [tags, setTags] = useState<OrganizationTag[]>([]);
  const { excute: createOrgTargetsTags, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgTargetsTags,
    "Create"
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const wordLibrary = useSelector(getWordLibrary);

  const handleCreateOrgTargetsTags = useCallback(() => {
    const nestArray = spliceIntoArrays(selectedArticleIds, 10);
    let finish = 0;
    const promises = nestArray.reduce(
      (a, b) =>
        a.then(() =>
          createOrgTargetsTags({
            organizationId,
            isSelected: 1,
            organizationTagList: tags.map((el) => ({ tagId: el.tagId })),
            targetIdList: b,
            serviceModulValue: Table.ARTICLES,
          }).then(() => {
            finish += 5;
            openSnackbar({
              message: `${wordLibrary?.["please wait"] ?? "請稍候"}(${finish}/${
                selectedArticleIds.length
              })`,
              severity: "warning",
              autoHideDuration: 999999,
            });
          })
        ),
      Promise.resolve()
    );
    return promises.then(() => {
      openSnackbar({
        message: `標記完成共${selectedArticleIds.length}筆`,
        severity: "success",
        autoHideDuration: 4000,
      });
    });
  }, [
    createOrgTargetsTags,
    openSnackbar,
    organizationId,
    selectedArticleIds,
    tags,
    wordLibrary,
  ]);

  const handleOnConfirm = useCallback(() => {
    if (isCheckedAllPageRows) {
      const { startIndex, size, ...filterObject } =
        filterSearch as FilterSearch;
      createOrgTargetsTags({
        organizationId,
        isSelected: 0,
        filterObject,
        organizationTagList: tags.map((el) => ({ tagId: el.tagId })),
        excludedTargetIdList: excludeSelectedArticleIds,
        serviceModulValue: Table.ARTICLES,
      })
        .then(() => {
          closeDialog();
          setSuccess(true);
        })
        .catch(() => {});
    } else if (selectedArticleIds.length > 0) {
      handleCreateOrgTargetsTags()
        .then(() => {
          closeDialog();
          setSuccess(true);
        })
        .catch(() => {});
    }
  }, [
    closeDialog,
    setSuccess,
    createOrgTargetsTags,
    filterSearch,
    handleCreateOrgTargetsTags,
    isCheckedAllPageRows,
    organizationId,
    selectedArticleIds.length,
    tags,
    excludeSelectedArticleIds,
  ]);

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        {" "}
        {wordLibrary?.["batch tagging"] ?? "批次標註"}
      </DialogTitle>
      <DialogContent>
        <TagAutocomplete
          serviceModuleValue={ServiceModuleValue.ARTICLE}
          onChange={(e, value) => {
            setTags(value);
          }}
          value={tags}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={closeDialog} />
        <DialogConfirmButton
          loading={isLoading}
          disabled={isLoading}
          onClick={handleOnConfirm}
        >
          {wordLibrary?.cancel ?? "取消"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleTagDialog;
