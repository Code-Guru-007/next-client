import React, { FC, useState, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { OrganizationColumn } from "interfaces/entities";
import { ColumnTable } from "interfaces/utils";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";

import Box from "@eGroupAI/material/Box";
import Dialog from "@eGroupAI/material/Dialog";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import DynamicColumnDragDrop from "./DynamicColumnDragDrop";

export const DIALOG = "DynamicColumnsSortDialog";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

export interface DynamicColumnsSortDialogProps {
  columnTable: ColumnTable;
}

const DynamicColumnsSortDialog: FC<DynamicColumnsSortDialogProps> = function (
  props
) {
  const { columnTable } = props;
  const classes = useStyles();
  const theme = useTheme();
  const wordLibrary = useSelector(getWordLibrary);
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const organizationId = useSelector(getSelectedOrgId);
  const matchMutate = useSwrMatchMutate();
  const { excute: sortOrgDynamicColumn, isLoading } = useAxiosApiWrapper(
    apis.org.sortOrgDynamicColumn,
    "Update"
  );

  const { data } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable,
    }
  );

  const [items, setItems] = useState<OrganizationColumn[]>([]);

  useEffect(() => {
    if (data?.source) setItems(data?.source);
  }, [data?.source]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => closeDialog()}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>排序動態欄位</DialogTitle>
      <DialogFullPageContainer>
        <DynamicColumnDragDrop
          defaultItems={items}
          organizationId={organizationId}
          columnTable={columnTable}
          onItemOrderChange={(next) => {
            setItems(next);
          }}
          dialogIsOpen={isOpen}
        />
      </DialogFullPageContainer>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton onClick={() => closeDialog()} />
        <DialogConfirmButton
          loading={isLoading}
          disabled={isLoading}
          onClick={async () => {
            if (items.length > 0) {
              try {
                await sortOrgDynamicColumn({
                  organizationId,
                  columnTable,
                  organizationColumnList: items.map((el) => ({
                    columnId: el.columnId,
                  })),
                });
                matchMutate(
                  new RegExp(
                    `^/organizations/${organizationId}/search/columns\\?columnTable=${columnTable}`,
                    "g"
                  )
                );
                setItems([]);
                closeDialog();
              } catch (error) {
                apis.tools.createLog({
                  function: "DatePicker: handleDelete",
                  browserDescription: window.navigator.userAgent,
                  jsonData: {
                    data: error,
                    deviceInfo: getDeviceInfo(),
                  },
                  level: "ERROR",
                });
              }
            }
          }}
        >
          {wordLibrary?.save ?? "儲存"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default DynamicColumnsSortDialog;
