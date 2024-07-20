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

export const DIALOG = "TagAddDialog";

export interface TagAddDialogProps {
  filterSearch: FilterSearch;
  tableModule: Table;
  serviceModuleValue: ServiceModuleValue;
  isCheckedAllPageRows: boolean;
  selectedTargetIds: string[];
  excludeSelectedTargetIds: string[];
  onSuccess?: () => void;
}

const TagAddDialog: FC<TagAddDialogProps> = function (props) {
  const {
    filterSearch,
    tableModule,
    serviceModuleValue,
    selectedTargetIds,
    isCheckedAllPageRows,
    excludeSelectedTargetIds,
    onSuccess,
  } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(
    `${serviceModuleValue}_${DIALOG}`
  );
  const [tags, setTags] = useState<OrganizationTag[]>([]);
  const { excute: createOrgTargetsTags, isLoading } = useAxiosApiWrapper(
    apis.org.createOrgTargetsTags,
    "Create"
  );
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);

  const handleCreateOrgTargetsTags = useCallback(() => {
    const nestArray = spliceIntoArrays(selectedTargetIds, 10);
    let finish = 0;
    const promises = nestArray.reduce(
      (a, b) =>
        a.then(() =>
          createOrgTargetsTags({
            organizationId,
            isSelected: 1,
            organizationTagList: tags.map((el) => ({ tagId: el.tagId })),
            targetIdList: b,
            serviceModulValue: tableModule,
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
    createOrgTargetsTags,
    openSnackbar,
    organizationId,
    selectedTargetIds,
    tableModule,
    tags,
    wordLibrary,
  ]);

  const handleOnConfirm = useCallback(() => {
    if (isCheckedAllPageRows) {
      const { ...filterObject } = filterSearch as FilterSearch;
      createOrgTargetsTags({
        organizationId,
        isSelected: 0,
        filterObject,
        organizationTagList: tags.map((el) => ({ tagId: el.tagId })),
        excludedTargetIdList: excludeSelectedTargetIds,
        serviceModulValue: tableModule,
      })
        .then(() => {
          setTags([]);
          closeDialog();
          if (onSuccess) onSuccess();
        })
        .catch(() => {});
    } else if (selectedTargetIds.length > 0) {
      handleCreateOrgTargetsTags()
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
    createOrgTargetsTags,
    organizationId,
    tags,
    excludeSelectedTargetIds,
    tableModule,
    closeDialog,
    onSuccess,
    handleCreateOrgTargetsTags,
  ]);

  useEffect(() => {
    if (isOpen) setTags([]);
  }, [isOpen]);

  const handleCloseDialog = () => {
    setTags([]);
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle onClickClose={closeDialog}>
        {wordLibrary?.["batch tagging"] ?? "批次標註"}
      </DialogTitle>
      <DialogContent>
        <TagAutocomplete
          id={`add-${serviceModuleValue?.toLowerCase()}-batch-tag-select`}
          data-tid={`add-${serviceModuleValue?.toLowerCase()}-batch-tag-select`}
          serviceModuleValue={serviceModuleValue}
          onChange={(e, value) => {
            setTags(value);
          }}
          value={tags}
          sx={{ py: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <DialogCloseButton onClick={handleCloseDialog} />
        <DialogConfirmButton loading={isLoading} onClick={handleOnConfirm}>
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default TagAddDialog;
