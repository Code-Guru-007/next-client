import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import {
  Box,
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Theme,
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
import CloseIcon from "@mui/icons-material/Close";

import { useSelector } from "react-redux";

import EditableFieldActions from "../EditableFieldActions";

const styles = (theme: Theme) =>
  createStyles({
    closeButton: {
      marginLeft: theme.spacing(1),
    },
  });

export interface EditableFieldEditingProps
  extends HTMLAttributes<HTMLDivElement> {
  /**
   * Props applied to the Mui `Button` element.
   */
  MuiButtonProps?: ButtonProps;
  /**
   * Props applied to the Mui `IconButton` element.
   */
  MuiIconButtonProps?: IconButtonProps;
  /**
   * The content of the EditableField actions.
   */
  actions?: ReactNode;
  /**
   * Save Button text
   */
  saveButtonText?: string;
  /**
   * Handle save button click.
   */
  onSaveClick?: ButtonProps["onClick"];
  /**
   * Handle close button click.
   */
  onCloseClick?: IconButtonProps["onClick"];
}

const EditableFieldEditing = forwardRef<
  HTMLDivElement,
  EditableFieldEditingProps & WithStyles<typeof styles>
>((props, ref) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    children,
    classes,
    onSaveClick,
    onCloseClick,
    MuiButtonProps,
    MuiIconButtonProps,
    actions,
    saveButtonText = `${wordLibrary?.save ?? "儲存"}`,
    ...other
  } = props;

  return (
    <div ref={ref} {...other}>
      {children}
      <EditableFieldActions>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          onClick={onSaveClick}
          {...MuiButtonProps}
        >
          {saveButtonText}
        </Button>
        <IconButton
          size="small"
          className={classes.closeButton}
          onClick={onCloseClick}
          {...MuiIconButtonProps}
        >
          <CloseIcon />
        </IconButton>
        <Box flexGrow={1} />
        {actions}
      </EditableFieldActions>
    </div>
  );
});

export default withStyles(styles, {
  name: "MuiEgEditableFieldEditing",
})(EditableFieldEditing);
