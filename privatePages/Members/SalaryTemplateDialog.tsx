import React, { FC, useState, useMemo, useCallback } from "react";

import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useOrgSalaryTemplate from "utils/useOrgSalaryTemplate";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import Box from "@eGroupAI/material/Box";
import Button from "@eGroupAI/material/Button";
import Dialog from "@eGroupAI/material/Dialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import SalaryTemplateForm, { FORM } from "./SalaryTemplateForm";

export const DIALOG = "FinanceTemplatesDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));
export interface FinanceTemplatesDialogProps {
  organizationFinanceTemplateId?: string;
  editable?: boolean;
  deletable?: boolean;
}

const FinanceTemplatesDialog: FC<FinanceTemplatesDialogProps> = function (
  props
) {
  const {
    organizationFinanceTemplateId,
    editable = false,
    deletable = false,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { excute: createOrgSalaryTemplate, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgSalaryTemplate, "Create");
  const { excute: deleteOrgSalaryTemplate, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgSalaryTemplate, "Delete");
  const { excute: updateOrgSalaryTemplate, isLoading: isUploading } =
    useAxiosApiWrapper(apis.org.updateOrgSalaryTemplate, "Update");
  const matchMutate = useSwrMatchMutate();
  const { data, mutate } = useOrgSalaryTemplate(
    {
      organizationId,
      organizationFinanceTemplateId,
    },
    undefined,
    undefined,
    !organizationFinanceTemplateId
  );

  const defaultValues = useMemo(
    () =>
      JSON.parse(
        JSON.stringify({
          organizationFinanceTemplateName:
            data?.organizationFinanceTemplateName,
          organizationFinanceTemplateDescription:
            data?.organizationFinanceTemplateDescription,
          organizationFinanceColumnList:
            data?.organizationFinanceColumnList?.map((el) => ({
              organizationFinanceColumnId: el.organizationFinanceColumnId,
              organizationFinanceColumnName: el.organizationFinanceColumnName,
              organizationFinanceType: el.organizationFinanceType,
            })),
        })
      ),
    [data]
  );

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose: closeDialog,
    onConfirm: closeDialog,
  });

  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);

  const handleDeleteTemplate = useCallback(async () => {
    try {
      closeConfirmDeleteDialog();
      await deleteOrgSalaryTemplate({
        organizationId,
        organizationFinanceTemplateId: organizationFinanceTemplateId as string,
      });
      closeDialog();
      matchMutate(
        new RegExp(
          `^/organizations/${organizationId}/search/finance-templates\\?`,
          "g"
        )
      );
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleDeleteTemplate",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  }, [
    closeDialog,
    closeConfirmDeleteDialog,
    deleteOrgSalaryTemplate,
    matchMutate,
    organizationFinanceTemplateId,
    organizationId,
  ]);

  return (
    <Dialog
      scroll="body"
      open={isOpen}
      onClose={() => closeConfirm()}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={() => closeConfirm()}>
        {organizationFinanceTemplateId
          ? `${wordLibrary?.edit ?? "編輯"}`
          : `${wordLibrary?.add ?? "新增"}`}
        {wordLibrary?.["financial template"] ?? "財務範本"}
      </DialogTitle>
      <Stack
        spacing={3}
        sx={{ px: 3, py: 1, maxHeight: 480, overflow: "auto" }}
      >
        <SalaryTemplateForm
          editable={editable}
          defaultValues={defaultValues}
          organizationFinanceTemplateId={organizationFinanceTemplateId}
          setFormIsDirty={setFormIsDirty}
          onSubmit={async (values) => {
            const organizationFinanceColumnList =
              values.organizationFinanceColumnList.map((el) => ({
                organizationFinanceColumnId: el.organizationFinanceColumnId
                  ? el.organizationFinanceColumnId
                  : undefined,
                organizationFinanceColumnName: el.organizationFinanceColumnName,
                organizationFinanceType: el.organizationFinanceType,
                organizationFinanceColumnType: "TEXT",
              }));
            try {
              if (organizationFinanceTemplateId) {
                updateOrgSalaryTemplate({
                  organizationId,
                  organizationFinanceTemplateId,
                  organizationFinanceTemplateName:
                    values.organizationFinanceTemplateName,
                  organizationFinanceTemplateDescription:
                    values.organizationFinanceTemplateDescription,
                  organizationFinanceColumnList,
                });
                closeDialog();
                mutate();
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/search/finance-templates\\?`,
                    "g"
                  )
                );
              } else {
                await createOrgSalaryTemplate({
                  organizationId,
                  organizationFinanceTemplateName:
                    values.organizationFinanceTemplateName,
                  organizationFinanceTemplateDescription:
                    values.organizationFinanceTemplateDescription,
                  organizationFinanceTemplateType: "HRM_MEMBERS",
                  organizationFinanceColumnList,
                });
                closeDialog();
                mutate();
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/search/finance-templates\\?`,
                    "g"
                  )
                );
              }
            } catch (error) {
              apis.tools.createLog({
                function: "createOrgSalaryTemplate: error",
                browserDescription: window.navigator.userAgent,
                jsonData: {
                  data: error,
                  deviceInfo: getDeviceInfo(),
                },
                level: "ERROR",
              });
            }
          }}
        />
      </Stack>
      <DialogActions>
        {organizationFinanceTemplateId && deletable && (
          <Button
            id="salary-open-confirm-delete-dialog-button"
            data-tid="salary-open-confirm-delete-dialog-button"
            variant="contained"
            color="error"
            onClick={() => {
              openConfirmDeleteDialog({
                primary: `確定刪除嗎？`,
                onConfirm: handleDeleteTemplate,
              });
            }}
            loading={isDeleting}
          >
            {wordLibrary?.delete ?? "刪除"}
          </Button>
        )}
        <Box flexGrow={1} />
        <DialogCloseButton
          id="salary-template-close-button"
          data-tid="salary-template-close-button"
          sx={{ mr: 1 }}
          onClick={() => closeConfirm()}
          disabled={isDeleting}
        />
        {editable && (
          <DialogConfirmButton
            id="salary-template-confirm-button"
            data-tid="salary-template-confirm-button"
            type="submit"
            form={FORM}
            disabled={isDeleting}
            loading={isCreating || isUploading}
          >
            {wordLibrary?.save ?? "儲存"}
          </DialogConfirmButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FinanceTemplatesDialog;
