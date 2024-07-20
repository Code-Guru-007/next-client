import React, { FC, useState, useMemo, useCallback } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgFinanceTemplate from "utils/useOrgFinanceTemplate";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Box from "@eGroupAI/material/Box";
import Button from "@eGroupAI/material/Button";
import Dialog from "@eGroupAI/material/Dialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { DIALOG as DELETE_DIALOG } from "components/ConfirmDeleteDialog";
import apis from "utils/apis";
import FinanceTemplatesForm, { FORM } from "./FinanceTemplatesForm";

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
  const classes = useStyles();
  const theme = useTheme();
  const organizationId = useSelector(getSelectedOrgId);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const { excute: createOrgFinanceTemplate, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgFinanceTemplate, "Create");
  const { excute: deleteOrgFinanceTemplate, isLoading: isDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgFinanceTemplate, "Delete");
  const { excute: updateOrgFinanceTemplate, isLoading: isUploading } =
    useAxiosApiWrapper(apis.org.updateOrgFinanceTemplate, "Update");
  const matchMutate = useSwrMatchMutate();
  const { data, mutate } = useOrgFinanceTemplate(
    {
      organizationId,
      organizationFinanceTemplateId,
    },
    undefined,
    undefined,
    !organizationFinanceTemplateId
  );

  const defaultValues = useMemo(
    // remove undefined value
    // https://stackoverflow.com/questions/25421233/javascript-removing-undefined-fields-from-an-object
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
      await deleteOrgFinanceTemplate({
        organizationId,
        organizationFinanceTemplateId: organizationFinanceTemplateId as string,
      });
      closeDialog();
      matchMutate(
        new RegExp(
          `^/organizations/${organizationId}/finance-templates\\?`,
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
    deleteOrgFinanceTemplate,
    matchMutate,
    organizationFinanceTemplateId,
    organizationId,
  ]);

  return (
    <Dialog
      scroll="body"
      open={isOpen}
      onClose={() => closeConfirm()}
      fullWidth
      maxWidth="sm"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={() => closeConfirm()}>
        {organizationFinanceTemplateId ? "編輯" : "新增"}
        {wordLibrary?.["financial template"] ?? "財務範本"}
      </DialogTitle>
      <DialogFullPageContainer>
        <FinanceTemplatesForm
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
                updateOrgFinanceTemplate({
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
                    `^/organizations/${organizationId}/finance-templates\\?`,
                    "g"
                  )
                );
              } else {
                await createOrgFinanceTemplate({
                  organizationId,
                  organizationFinanceTemplateName:
                    values.organizationFinanceTemplateName,
                  organizationFinanceTemplateDescription:
                    values.organizationFinanceTemplateDescription,
                  organizationFinanceColumnList,
                });
                closeDialog();
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/finance-templates\\?`,
                    "g"
                  )
                );
              }
            } catch (error) {
              apis.tools.createLog({
                function: "updateOrgFinanceTemplate: error",
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
      </DialogFullPageContainer>
      <DialogActions>
        {organizationFinanceTemplateId && deletable && (
          <Button
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
          sx={{ mr: 1 }}
          onClick={() => closeConfirm()}
          disabled={isDeleting}
        />
        {editable && (
          <DialogConfirmButton
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
