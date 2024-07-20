import React, { useMemo, useState } from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgCalendar from "utils/useOrgCalendar";
import { CreateOrgCalendarFormInput } from "interfaces/form";

import DialogFullPageCloseButton from "components/DialogFullPageCloseButton";
import DialogFullPageHeader from "components/DialogFullPageHeader";
import DialogFullPageActions from "components/DialogFullPageActions";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import DialogFullPagePaper from "components/DialogFullPagePaper";
import Dialog from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import Box from "@eGroupAI/material/Box";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import CalendarForm, { FORM } from "./CalendarForm";

export const DIALOG = "CalendarDialog";

export interface CalendarDialogProps {
  editingMode?: "create" | "update";
  /**
   * The calendar id for updateing.
   */
  organizationCalendarId?: string;
  /**
   * Event fired after submit success.
   */
  onSubmitSuccess?: () => void;
}

const CalendarDialog = (props: CalendarDialogProps) => {
  const {
    editingMode = "create",
    organizationCalendarId,
    onSubmitSuccess,
    ...other
  } = props;
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);
  const { data: orgCalendar } = useOrgCalendar(
    {
      organizationId,
      organizationCalendarId,
    },
    undefined,
    undefined,
    !organizationCalendarId
  );
  const { excute: createOrgCalendar, isLoading: isCreating } =
    useAxiosApiWrapper(apis.org.createOrgCalendar, "Create");
  const { excute: updateOrgCalendar, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgCalendar, "Update");
  const isCreate = editingMode === "create";

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose: closeDialog,
    onConfirm: closeDialog,
  });

  const handleSubmit = (values: CreateOrgCalendarFormInput) => {
    if (isCreate) {
      createOrgCalendar({
        organizationId,
        organizationCalendarName: values.organizationCalendarName,
        organizationCalendarBackgroundColor:
          values.organizationCalendarBackgroundColor,
        organizationCalendarTimeZone: values.organizationCalendarTimeZone,
        organizationCalendarServiceModuleValue:
          values.organizationCalendarServiceModuleValue,
        organizationCalendarStartDateColumnType:
          values.organizationCalendarStartDateColumnType,
        organizationCalendarEndDateColumnType:
          values.organizationCalendarEndDateColumnType,
      })
        .then(() => {
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
        })
        .finally(() => {
          closeDialog();
        });
    } else if (!isCreate && organizationCalendarId) {
      updateOrgCalendar({
        organizationId,
        organizationCalendarId,
        organizationCalendarName: values.organizationCalendarName,
        organizationCalendarBackgroundColor:
          values.organizationCalendarBackgroundColor,
        organizationCalendarTimeZone: values.organizationCalendarTimeZone,
        organizationCalendarServiceModuleValue:
          values.organizationCalendarServiceModuleValue,
        organizationCalendarStartDateColumnType:
          values.organizationCalendarStartDateColumnType,
        organizationCalendarEndDateColumnType:
          values.organizationCalendarEndDateColumnType,
      })
        .then(() => {
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
        })
        .finally(() => {
          closeDialog();
        });
    }
  };

  const defaultValues = useMemo(() => {
    if (orgCalendar) {
      return {
        organizationCalendarName: orgCalendar.organizationCalendarName,
        organizationCalendarBackgroundColor:
          orgCalendar.organizationCalendarBackgroundColor,
        organizationCalendarTimeZone: orgCalendar.organizationCalendarTimeZone,
        organizationCalendarServiceModuleValue:
          orgCalendar.organizationCalendarServiceModuleValue,
        organizationCalendarStartDateColumnType:
          orgCalendar.organizationCalendarStartDateColumnType,
        organizationCalendarEndDateColumnType:
          orgCalendar.organizationCalendarEndDateColumnType,
      };
    }
    return undefined;
  }, [orgCalendar]);

  return (
    <Dialog
      open={isOpen}
      maxWidth="sm"
      onClose={closeDialog}
      fullWidth
      PaperComponent={DialogFullPagePaper}
      {...other}
    >
      <DialogFullPageHeader>
        <Typography variant="h4" color="text">
          {isCreate
            ? `${wordLibrary?.add ?? "新增"}`
            : `${wordLibrary?.edit ?? "編輯"}`}
          日曆
        </Typography>
        <Box flexGrow={1} />
        <div>
          <DialogFullPageCloseButton onClick={() => closeConfirm()} />
        </div>
      </DialogFullPageHeader>
      <CalendarForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        setFormIsDirty={setFormIsDirty}
      />
      <DialogFullPageActions>
        <DialogCloseButton
          sx={{ mr: 1 }}
          onClick={() => closeConfirm()}
          disabled={isCreating || isUpdating}
        />
        <DialogConfirmButton
          type="submit"
          form={FORM}
          loading={isCreating || isUpdating}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogFullPageActions>
    </Dialog>
  );
};

export default CalendarDialog;
