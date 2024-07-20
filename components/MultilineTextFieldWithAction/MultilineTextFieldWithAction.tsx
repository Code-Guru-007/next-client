import React, { FC, useState, useEffect, MouseEventHandler } from "react";

import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import { SNACKBAR } from "components/App";
import ButtonNestedTextArea from "components/ButtonNestedTextArea";
import FroalaEditor from "components/FroalaEditor";
import FroalaEditorView from "components/FroalaEditorView";
import IconButton from "@mui/material/IconButton";

import { ServiceModuleValue } from "interfaces/utils";
import { DynamicValueType } from "interfaces/form";
import clsx from "clsx";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { DIALOG as OUTSIDE_CLICK_DIALOG } from "components/ConfirmOutsideClickDialog";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const useStyles = makeStyles({
  typographyWrapper: {
    height: "100%",
    width: "fit-content",
    minHeight: "21px",
    minWidth: "200px",
    display: "flex",
    position: "relative",
    alignItems: "center",
  },
  pointer: {
    cursor: "pointer",
  },
  multilineTextWrapper: {
    padding: "0px 10px 0px 0px",
    width: "100%",
  },
  froalaEditor: {
    padding: "0px 10px",
    width: "100%",
    position: "relative",
  },
  editorAction: {
    position: "absolute",
    bottom: "5px",
    right: "15px",
    zIndex: 3,
  },
  historyIcon: {
    padding: "7px 8px 7px 7px",
    position: "absolute",
    right: "-30px",
  },
  wordBreak: {
    whiteSpace: "break-spaces",
  },
});

interface MultilineTextFieldWithActionProps {
  isEditor?: boolean;
  boldText?: boolean;
  value: string;
  name: string;
  handleOnChange: (
    name: string,
    value?: DynamicValueType
  ) => void | Promise<void | string>;
  onClickHistory?: MouseEventHandler<HTMLButtonElement>;
  required?: boolean;
  writable?: boolean;
  hideMultiTextBorder?: boolean;
}

const MultilineTextFieldWithAction: FC<MultilineTextFieldWithActionProps> = (
  props
) => {
  const {
    isEditor,
    boldText = false,
    value,
    name,
    handleOnChange,
    onClickHistory,
    required = false,
    writable = false,
    hideMultiTextBorder,
  } = props;
  const classes = useStyles();
  const [isEditMode, setIsEditMode] = useState(false);
  const [content, setContent] = useState(value);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const wordLibrary = useSelector(getWordLibrary);
  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const {
    openDialog: openConfirmDialog,
    closeDialog: closeConfirmDialog,
    setDialogStates: setConfirmDialogStates,
  } = useReduxDialog(OUTSIDE_CLICK_DIALOG);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleSetEditMode = (e) => {
    if (e.nativeEvent.srcElement.nodeName !== "A") {
      if (!writable) return;
      setIsEditMode(true);
    }
  };

  const hanldeUnsetEditMode = () => {
    setIsEditMode(false);
    setContent(value);
  };

  const handleChangeContent = () => {
    if (required && !content) {
      openSnackbar({
        message: "The field must be required.",
        severity: "error",
      });
      return;
    }
    if (value === content) {
      setIsEditMode(false);
      closeConfirmDialog();
      return;
    }
    const promise = handleOnChange(name, { value: content });
    if (promise) {
      setLoading(true);
      promise
        .then((result) => {
          if (result === "success") {
            setLoading(false);
            setIsEditMode(false);
            closeConfirmDialog();
          } else {
            setLoading(false);
            closeConfirmDialog();
          }
        })
        .catch(() => {});
    } else {
      setIsEditMode(false);
    }
  };

  const handleInputChange = (e) => {
    setContent(e.target.value);
  };

  const handleOutsideClick = () => {
    openConfirmDialog({
      primary: "您想儲存變更嗎？",
      isLoading: loading,
      onConfirm: () => {
        setConfirmDialogStates({ isLoading: true });
        handleChangeContent();
      },
      onClose: () => {
        hanldeUnsetEditMode();
        closeConfirmDialog();
      },
    });
  };

  return (
    <>
      {!isEditor && (
        <>
          {!isEditMode && (
            <Box
              className={clsx(
                classes.typographyWrapper,
                writable && classes.pointer
              )}
              onClick={handleSetEditMode}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              {content ? (
                <Typography
                  weight={boldText ? "bold" : "regular"}
                  sx={{
                    minWidth: "200px",
                    minHeight: "35px",
                    fontSize: 14,
                  }}
                  variant="paragraph"
                  className={classes.wordBreak}
                >
                  {content}
                </Typography>
              ) : (
                <Typography
                  weight={boldText ? "bold" : "regular"}
                  sx={{
                    minWidth: "200px",
                    minHeight: "35px",
                    fontSize: 14,
                    border: writable ? "1px solid gray" : "none",
                    borderRadius: "5px",
                    margin: 0,
                  }}
                  variant="paragraph"
                  className={classes.wordBreak}
                >
                  {content}
                </Typography>
              )}
              {isHover && (
                <IconButton
                  onClick={onClickHistory}
                  className={classes.historyIcon}
                >
                  <HistoryRoundedIcon fontSize="medium" />
                </IconButton>
              )}
            </Box>
          )}
          {isEditMode && (
            <ClickAwayListener onClickAway={handleOutsideClick}>
              <Box className={classes.multilineTextWrapper}>
                <ButtonNestedTextArea
                  value={content}
                  onChange={handleInputChange}
                  cancelButtonProps={{
                    rounded: true,
                    variant: "contained",
                    sx: {
                      marginRight: "8px",
                    },
                  }}
                  okayButtonProps={{
                    color: "primary",
                    rounded: true,
                    variant: "contained",
                    loading,
                    disabled: loading || (!content && required),
                  }}
                  onCancel={hanldeUnsetEditMode}
                  onOkay={handleChangeContent}
                />
              </Box>
            </ClickAwayListener>
          )}
        </>
      )}
      {isEditor && (
        <>
          {isEditMode && (
            <ClickAwayListener onClickAway={handleOutsideClick}>
              <Box className={classes.froalaEditor}>
                <FroalaEditor
                  filePathType={ServiceModuleValue.DYNAMIC_COLUMN}
                  model={content}
                  onModelChange={(model) => {
                    setContent(model);
                  }}
                  config={{
                    toolbarSticky: true,
                    heightMin: 300,
                    placeholderText:
                      wordLibrary?.["edit description"] ?? "編輯說明",
                  }}
                />
                <Box className={classes.editorAction}>
                  <Button
                    variant="contained"
                    rounded
                    sx={{
                      marginRight: "8px",
                    }}
                    onClick={hanldeUnsetEditMode}
                  >
                    {wordLibrary?.cancel ?? "取消"}
                  </Button>
                  <Button
                    variant="contained"
                    rounded
                    color="primary"
                    onClick={handleChangeContent}
                    loading={loading}
                    disabled={loading || (!content && required)}
                  >
                    {wordLibrary?.save ?? "儲存"}
                  </Button>
                </Box>
              </Box>
            </ClickAwayListener>
          )}
          <>
            {!isEditMode && (
              <Box
                className={clsx(
                  classes.typographyWrapper,
                  writable && classes.pointer
                )}
                onClick={handleSetEditMode}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                sx={{
                  border:
                    writable && !hideMultiTextBorder && !content
                      ? "1px solid gray"
                      : "none",
                  minWidth: "200px",
                  minHeight: "35px",
                  width: "67px",
                  height: "35px",
                  borderRadius: "5px",
                }}
              >
                {!content && (
                  <Typography
                    sx={{
                      minWidth: "200px",
                      minHeight: "35px",
                      wordBreak: "break-word",
                      // border: writable ? "1px solid gray" : "none",
                      borderRadius: "5px",
                      padding: "6px",
                      fontSize: 14,
                    }}
                  >
                    {String(" ")}
                  </Typography>
                )}
                {content && <FroalaEditorView model={content} />}
                {isHover && (
                  <IconButton
                    onClick={onClickHistory}
                    className={classes.historyIcon}
                  >
                    <HistoryRoundedIcon fontSize="medium" />
                  </IconButton>
                )}
              </Box>
            )}
          </>
        </>
      )}
    </>
  );
};

export default MultilineTextFieldWithAction;
