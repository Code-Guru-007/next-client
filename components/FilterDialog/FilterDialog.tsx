import React, { FC } from "react";

import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import styled from "@mui/styles/styled";

import Button from "@eGroupAI/material/Button";
import Box from "@eGroupAI/material/Box";
import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import Dialog from "@eGroupAI/material/Dialog";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogFullPageHeader from "components/DialogFullPageHeader";
import DialogConfirmButton from "components/DialogConfirmButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { DialogTitle } from "@eGroupAI/material";

export const DIALOG = "FilterDialog";
export interface FilterDialogProps {
  loading?: boolean;
  onClose?: () => void;
  renderFilterbar?: JSX.Element;
  renderHeader?: JSX.Element;
  filterAllClear?: () => void;
  filterCountTotal?: number;
}

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  pageHeader: {
    display: "flex",
    justifyContent: "center",
    margin: 0,
    padding: 0,
  },
  clearFilter: {
    color: ({ filterCountTotal }: FilterDialogProps) =>
      Number(filterCountTotal) > 0
        ? theme.palette.primary.main
        : theme.palette.grey[300],
  },
}));

const StyledButton = styled(Button)(() => ({
  display: "flex",
  justifyContent: "space-around",
  minWidth: 138,
}));

const FilterDialog: FC<FilterDialogProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles(props);
  const theme = useTheme();
  const { closeDialog, isOpen } = useReduxDialog(DIALOG);
  const {
    renderFilterbar,
    loading,
    onClose,
    filterAllClear,
    filterCountTotal,
  } = props;

  const handleClose = () => {
    closeDialog();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      fullWidth
      maxWidth="sm"
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      onClose={handleClose}
    >
      <DialogTitle onClickClose={handleClose}>
        {" "}
        {wordLibrary?.filter ?? "篩選"}
      </DialogTitle>
      <DialogFullPageContainer sx={{ padding: "0 16px" }}>
        <DialogFullPageHeader className={classes.pageHeader}>
          <Box flexGrow={1} />

          <StyledButton
            disabled={filterCountTotal === 0}
            rounded
            color="inherit"
            onClick={filterAllClear}
          >
            <Typography weight="semiBold" className={classes.clearFilter}>
              {wordLibrary?.["clear filter conditions"] ?? "清除篩選條件"}
            </Typography>
          </StyledButton>
        </DialogFullPageHeader>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderFilterbar}
          </Grid>
        </Grid>
      </DialogFullPageContainer>
      <DialogActions>
        {(filterCountTotal as number) > 0 ? (
          <StyledButton
            rounded
            variant="contained"
            color={theme.palette.info.main}
            textColor={theme.palette.grey[700]}
          >
            <span>
              {filterCountTotal as number}{" "}
              {wordLibrary?.["filter applied"] ?? "篩選器選取"}
            </span>
          </StyledButton>
        ) : (
          <StyledButton
            rounded
            variant="contained"
            color={theme.palette.primary.main}
            textColor={theme.palette.grey[300]}
          >
            <span>0 {wordLibrary?.["filter applied"] ?? "篩選器選取"}</span>
          </StyledButton>
        )}

        <Box flexGrow={1} />
        <DialogConfirmButton
          loading={loading}
          disabled={loading}
          type="submit"
          onClick={() => handleClose()}
        >
          {wordLibrary?.submit ?? "送出"}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
