import React, { FC, useCallback, useEffect, useState } from "react";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { ServiceModuleValue, Table } from "interfaces/utils";
import { FilterSearch } from "@eGroupAI/typings/apis";
import { OrganizationTag } from "interfaces/entities";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { SNACKBAR } from "components/App";

import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import TagAutocomplete from "components/TagAutocomplete";
import spliceIntoArrays from "utils/spliceIntoArrays";

export const DIALOG = "TagDeleteDialog";

export interface TagDeleteDialogProps {
  filterSearch: FilterSearch;
  tableModule: Table;
  serviceModuleValue: ServiceModuleValue;
  isCheckedAllPageRows: boolean;
  selectedTargetIds: string[];
  excludeSelectedTargetIds: string[];
  onSuccess?: () => void;
  selectedTagIdList?: (string | undefined)[];
}

const TagDeleteDialog: FC<TagDeleteDialogProps> = function (props) {
  const {
    filterSearch,
    tableModule,
    serviceModuleValue,
    selectedTargetIds,
    isCheckedAllPageRows,
    excludeSelectedTargetIds,
    onSuccess,
    selectedTagIdList,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(
    `${serviceModuleValue}_${DIALOG}`
  );
  const [tags, setTags] = useState<OrganizationTag[]>([]);
  const { excute: deleteOrgTargetsTags, isLoading } = useAxiosApiWrapper(
    apis.org.deleteOrgTargetsTags,
    "Delete"
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const handleDeleteOrgTargetsTags = useCallback(() => {
    const nestArray = spliceIntoArrays(selectedTargetIds, 10);
    let finish = 0;
    const promises = nestArray.reduce(
      (a, b) =>
        a.then(() =>
          deleteOrgTargetsTags({
            organizationId,
            isSelected: 1,
            serviceModulValue: tableModule,
            organizationTagList: tags.map((el) => ({ tagId: el.tagId })),
            targetIdList: b,
          }).then(() => {
            finish += 5;
            openSnackbar({
              message: `${wordLibrary?.["please wait"] ?? "請稍候"}(${finish}/${
                selectedTargetIds.length
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
        message: `標記完成共${selectedTargetIds.length}筆`,
        severity: "success",
        autoHideDuration: 4000,
      });
    });
  }, [
    deleteOrgTargetsTags,
    openSnackbar,
    organizationId,
    selectedTargetIds,
    tableModule,
    tags,
    wordLibrary,
  ]);

  useEffect(() => {
    if (isOpen) setTags([]);
  }, [isOpen]);

  const handleOnConfirm = useCallback(() => {
    if (isCheckedAllPageRows) {
      const { ...filterObject } = filterSearch as FilterSearch;
      deleteOrgTargetsTags({
        organizationId,
        isSelected: 0,
        serviceModulValue: tableModule,
        filterObject,
        organizationTagList: tags.map((el) => ({ tagId: el.tagId })),
        excludedTargetIdList: excludeSelectedTargetIds,
      })
        .then(() => {
          setTags([]);
          closeDialog();
          if (onSuccess) onSuccess();
        })
        .catch(() => {});
    } else if (selectedTargetIds.length > 0) {
      handleDeleteOrgTargetsTags()
        .then(() => {
          setTags([]);
          closeDialog();
          if (onSuccess) onSuccess();
        })
        .catch(() => {});
    }
  }, [
    isCheckedAllPageRows,
    selectedTargetIds.length,
    filterSearch,
    deleteOrgTargetsTags,
    organizationId,
    tableModule,
    tags,
    excludeSelectedTargetIds,
    closeDialog,
    onSuccess,
    handleDeleteOrgTargetsTags,
  ]);

  const handleCloseDialog = () => {
    setTags([]);
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
      <DialogTitle onClickClose={handleCloseDialog}>
        {wordLibrary?.["batch tagging delete"] ?? "批次標註刪除"}
      </DialogTitle>
      <DialogContent>
        <TagAutocomplete
          serviceModuleValue={serviceModuleValue}
          id={`del-${serviceModuleValue?.toLowerCase()}-batch-tag-select`}
          data-tid={`del-${serviceModuleValue?.toLowerCase()}-batch-tag-select`}
          onChange={(e, value) => {
            setTags(value);
          }}
          value={tags}
          selectedTagIdList={selectedTagIdList}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={handleCloseDialog} />
        <DialogConfirmButton loading={isLoading} onClick={handleOnConfirm}>
          {wordLibrary?.delete ?? "刪除"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default TagDeleteDialog;
