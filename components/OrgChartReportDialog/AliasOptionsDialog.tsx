import React, { useContext, useMemo } from "react";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import { Grid, IconButton, Stack, Typography } from "@mui/material";

import { makeStyles, useTheme } from "@mui/styles";
import { useSelector } from "react-redux";

import { ReportVariable } from "interfaces/form";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Iconify from "minimal/components/iconify";

import useFilterConditionGroup from "@eGroupAI/material-module/DataTable/useFilterConditionGroup";
import { Option } from "@eGroupAI/material-lab/FilterDropDown";

import OrgChartReportDialogContext from "./OrgChartReportDialogContext";
import { DIALOG as ALIAS_EDIT_DIALOG } from "./AliasEditDialog";

export const DIALOG = "AliasOptionsDialog";

export interface AliasOptionsDialogProps {
  selectedVariable?: ReportVariable;
  selectedIndex: number;
}

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
}));

const AliasOptionsDialog = (props: AliasOptionsDialogProps) => {
  const { selectedVariable } = props;
  const classes = useStyles();
  const theme = useTheme();

  const wordLibrary = useSelector(getWordLibrary);
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);
  const { openDialog: openAliasEditDialog } = useReduxDialog(ALIAS_EDIT_DIALOG);

  const { filterConditionGroups } = useContext(OrgChartReportDialogContext);
  const filterConditionGroup = useFilterConditionGroup(filterConditionGroups);
  const filterConditionsList = useMemo(
    () =>
      filterConditionGroup?.reduce<Option[]>(
        (a, b) => [...a, ...b.filterConditionList],
        []
      ),
    [filterConditionGroup]
  );
  const foundItems = useMemo(
    () =>
      filterConditionsList?.find(
        (item) => item.columnId === selectedVariable?.value
      )?.items || [],
    [filterConditionsList, selectedVariable?.value]
  );

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      fullWidth
      maxWidth={"sm"}
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle
        onClickClose={closeDialog}
        sx={{
          p: 3,
          "& .MuiTypography-root ~ .MuiBox-root": {
            position: "relative",
            top: 0,
            right: 0,
          },
        }}
      >
        {wordLibrary?.["option alias"] ?? "選項別名"}
        <IconButton
          onClick={() => {
            closeDialog();
            openAliasEditDialog();
          }}
          sx={{ ml: 1 }}
        >
          <Iconify icon="fluent:edit-20-filled" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ position: "relative" }}>
        <Stack spacing={3}>
          {foundItems.length !== 0 && (
            <Grid container sx={{ alignItems: "center" }} rowSpacing={2.5}>
              {foundItems.map((_, index) => (
                <>
                  <Grid item xs={6}>
                    <Typography color={"text.secondary"}>
                      {selectedVariable?.valueMapping?.[index]?.label}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color={"text.primary"}>
                      {selectedVariable?.valueMapping?.[index]?.alias}
                    </Typography>
                  </Grid>
                </>
              ))}
            </Grid>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {/* <DialogCloseButton onClick={closeDialog} disabled={false} rounded />
        <Box flexGrow={1} />
        <DialogCloseButton disabled={false} onClick={closeDialog} rounded>
          {wordLibrary?.store ?? "儲存"}
        </DialogCloseButton>

        <DialogConfirmButton
          loading={false}
          disabled={false}
          rounded
          onClick={() => {
            closeDialog();
          }}
        >
          {wordLibrary?.apply ?? "套用"}
        </DialogConfirmButton> */}
      </DialogActions>
    </Dialog>
  );
};

export default AliasOptionsDialog;
