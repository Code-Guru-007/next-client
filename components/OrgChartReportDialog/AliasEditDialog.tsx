import React, { useContext, useMemo } from "react";

import Dialog from "@eGroupAI/material/Dialog";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogActions from "@eGroupAI/material/DialogActions";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogCloseButton from "components/DialogCloseButton";
import DialogConfirmButton from "components/DialogConfirmButton";
import { Box, Grid, Stack, TextField, Typography } from "@mui/material";

import { makeStyles, useTheme } from "@mui/styles";
import { useSelector } from "react-redux";

import { OrgChartReportFormInput, ReportVariable } from "interfaces/form";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import EditSection from "components/EditSection";
import { Controller, useFormContext } from "react-hook-form";
import EditSectionHeader from "components/EditSectionHeader";

import useFilterConditionGroup from "@eGroupAI/material-module/DataTable/useFilterConditionGroup";
import { Option } from "@eGroupAI/material-lab/FilterDropDown";

import OrgChartReportDialogContext from "./OrgChartReportDialogContext";

export const DIALOG = "AliasEditDialog";

export interface AliasEditDialogProps {
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

const AliasEditDialog = (props: AliasEditDialogProps) => {
  const { selectedVariable, selectedIndex } = props;
  const classes = useStyles();
  const theme = useTheme();

  const wordLibrary = useSelector(getWordLibrary);
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);

  const { control, register } = useFormContext<OrgChartReportFormInput>();

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
        {wordLibrary?.["edit alias"] ?? "編輯別名"}
      </DialogTitle>
      <DialogContent sx={{ position: "relative" }}>
        <Stack spacing={3} sx={{ marginTop: 2, marginBottom: 2 }}>
          <EditSection>
            <EditSectionHeader
              primary={wordLibrary?.selectedVariable ?? "維度"}
              sx={{
                fontSize: `${theme.typography.h5.fontSize} !important`,
              }}
            />
            <Grid container sx={{ alignItems: "center" }} spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography>{selectedVariable?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  control={control}
                  name={`reportVariables.${selectedIndex}.axisName`}
                  render={({ field: { onChange, value } }) => (
                    <TextField fullWidth onChange={onChange} value={value} />
                  )}
                />
              </Grid>
            </Grid>
          </EditSection>
          {foundItems.length !== 0 && (
            <EditSection>
              <EditSectionHeader
                primary={wordLibrary?.options ?? "選項"}
                sx={{
                  fontSize: `${theme.typography.h5.fontSize} !important`,
                }}
              />
              <Grid container sx={{ alignItems: "center" }} spacing={2}>
                {foundItems.map((option, index) => (
                  <>
                    <input
                      type="hidden"
                      value={option.label}
                      {...register(
                        `reportVariables.${selectedIndex}.valueMapping.${index}.label`
                      )}
                    />
                    <input
                      type="hidden"
                      value={option.value}
                      {...register(
                        `reportVariables.${selectedIndex}.valueMapping.${index}.value`
                      )}
                    />
                    <Grid item xs={12} sm={6}>
                      <Typography>{option?.label}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        control={control}
                        name={`reportVariables.${selectedIndex}.valueMapping.${index}.alias`}
                        render={({ field: { onChange, value } }) => (
                          <TextField
                            fullWidth
                            onChange={onChange}
                            value={value}
                          />
                        )}
                      />
                    </Grid>
                  </>
                ))}
              </Grid>
            </EditSection>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton disabled={false} onClick={closeDialog} rounded>
          {wordLibrary?.cancel ?? "取消"}
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
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default AliasEditDialog;
