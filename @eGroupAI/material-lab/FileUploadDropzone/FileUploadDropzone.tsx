import React, { FC, HTMLAttributes } from "react";
import { useSelector } from "react-redux";

import { makeStyles } from "@mui/styles";
import { DropzoneOptions, useDropzone } from "react-dropzone";

import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import ForwardRoundedIcon from "@mui/icons-material/ForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Button from "@mui/material/Button";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import clsx from "clsx";

const useStyles = makeStyles(
  (theme) => ({
    // https://jsfiddle.net/prafuitu/vmL0ys1u/
    root: {
      "--border-color": theme.palette.grey[300],
      "--border-weight": "2px",
      "--dash-size": "8px",
      "--gap-size": "8px",

      position: "relative",
      width: "100%",
      height: "100%",
      minHeight: 300,
      minWidth: 300,
      [theme.breakpoints.down("sm")]: {
        minHeight: 200,
        minWidth: 200,
      },
      outline: "none",
      margin: "auto",
      cursor: (props: FileUploadDropzoneProps) =>
        props.uploading ? "auto" : "pointer",
      "& svg": {
        color: "#3DA5D9",
      },

      "&::after": {
        content: '""',
        transition: "all .6s ease",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
      linear-gradient(90deg, var(--border-color) 100%, transparent 100%) top left no-repeat,
      linear-gradient(90deg, transparent calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2 + var(--dash-size)), transparent calc(var(--gap-size) / 2 + var(--dash-size))) top center repeat-x,
      linear-gradient(90deg, var(--border-color) 100%, transparent 100%) top right no-repeat,

      linear-gradient(0deg, var(--border-color) 100%, transparent 100%) top left no-repeat,
      linear-gradient(0deg, transparent calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2 + var(--dash-size)), transparent calc(var(--gap-size) / 2 + var(--dash-size))) center left repeat-y,
      linear-gradient(0deg, var(--border-color) 100%, transparent 100%) bottom left no-repeat,

      linear-gradient(90deg, var(--border-color) 100%, transparent 100%) bottom left no-repeat,
      linear-gradient(90deg, transparent calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2 + var(--dash-size)), transparent calc(var(--gap-size) / 2 + var(--dash-size))) bottom center repeat-x,
      linear-gradient(90deg, var(--border-color) 100%, transparent 100%) bottom right no-repeat,

      linear-gradient(0deg, var(--border-color) 100%, transparent 100%) top right no-repeat,
      linear-gradient(0deg, transparent calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2), var(--border-color) calc(var(--gap-size) / 2 + var(--dash-size)), transparent calc(var(--gap-size) / 2 + var(--dash-size))) center right repeat-y,
      linear-gradient(0deg, var(--border-color) 100%, transparent 100%) bottom right no-repeat;
      background-size: var(--dash-size) var(--border-weight), calc(var(--dash-size) + var(--gap-size)) var(--border-weight), var(--dash-size) var(--border-weight), var(--border-weight) var(--dash-size), var(--border-weight) calc(var(--dash-size) + var(--gap-size)), var(--border-weight) var(--dash-size)`,
      },
    },
    dragActive: {},
    center: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1,
    },
    iconWrapper: {
      display: "inline",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
    },
    icon: {
      width: "44px",
      height: "44px",
      top: "50%",
    },
    progressBack: {
      "& svg": {
        color: theme.palette.grey[500],
      },
    },
    progress: {
      position: "absolute",
      top: 0,
      left: 0,
    },
    description: {
      fontFamily: "Poppins",
      fontStyle: "normal",
      fontWeight: 500,
      fontSize: "15px",
      lineHeight: "22px",
      textAlign: "center",
      color: theme.palette.grey[300],
      [theme.breakpoints.down("sm")]: {
        fontSize: "13px",
      },
    },
    uploadButton: {
      borderRadius: "1000px",
      backgroundColor: "#3DA5D9",
      fontFamily: "Poppins",
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "15px",
      [theme.breakpoints.down("sm")]: {
        fontSize: "13px",
        marginTop: "0",
        padding: "4px 15px",
      },
      lineHeight: "22px",
      padding: "9px 19px",
      textTransform: "none",
      boxShadow: "none",
      marginTop: "16px",
      "&:hover": {
        backgroundColor: "#3DA5D9",
        boxShadow: "none",
      },
    },
  }),
  {
    name: "MuiEgFileUploadDropzone",
  }
);

export interface FileUploadDropzoneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> {
  accept?: DropzoneOptions["accept"];
  minSize?: DropzoneOptions["minSize"];
  maxSize?: DropzoneOptions["maxSize"];
  maxFiles?: DropzoneOptions["maxFiles"];
  multiple?: DropzoneOptions["multiple"];
  preventDropOnDocument?: DropzoneOptions["preventDropOnDocument"];
  noClick?: DropzoneOptions["noClick"];
  noKeyboard?: DropzoneOptions["noKeyboard"];
  noDrag?: DropzoneOptions["noDrag"];
  noDragEventsBubbling?: DropzoneOptions["noDragEventsBubbling"];
  disabled?: DropzoneOptions["disabled"];
  onDrop?: DropzoneOptions["onDrop"];
  onDropAccepted?: DropzoneOptions["onDropAccepted"];
  onDropRejected?: DropzoneOptions["onDropRejected"];
  getFilesFromEvent?: DropzoneOptions["getFilesFromEvent"];
  onFileDialogCancel?: DropzoneOptions["onFileDialogCancel"];
  validator?: DropzoneOptions["validator"];
  uploading?: boolean;
  completed?: number;
  inputRef?:
    | ((instance: HTMLInputElement | null) => void)
    | React.MutableRefObject<HTMLInputElement | null>
    | null;
  required?: boolean;
  name?: string;
}

const FileUploadDropzone: FC<FileUploadDropzoneProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    className,
    accept,
    minSize,
    maxSize,
    maxFiles,
    multiple = false,
    preventDropOnDocument,
    noClick,
    noKeyboard,
    noDrag,
    noDragEventsBubbling,
    disabled,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onFileDialogCancel,
    validator,
    uploading,
    completed,
    inputRef,
    required = false,
    name,
    ...other
  } = props;
  const classes = useStyles(props);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    minSize,
    maxSize,
    maxFiles,
    multiple,
    preventDropOnDocument,
    noClick,
    noKeyboard,
    noDrag,
    noDragEventsBubbling,
    disabled: disabled ?? uploading,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onFileDialogCancel,
    validator,
  });

  const { onClick, ...otherRootProps } = getRootProps();

  const renderContent = () => (
    <div className={classes.center}>
      <Box
        position="relative"
        display="inline-flex"
        justifyContent="center"
        marginBottom="12px"
      >
        <CircularProgress
          className={classes.progressBack}
          variant="determinate"
          size={78}
          thickness={1}
          value={100}
        />
        <CircularProgress
          className={classes.progress}
          variant="determinate"
          color="inherit"
          value={completed}
          size={78}
          thickness={1}
        />
        <Box className={classes.iconWrapper}>
          {completed === 100 && !uploading ? (
            <CheckRoundedIcon className={classes.icon} fontSize="large" />
          ) : (
            <ForwardRoundedIcon
              className={classes.icon}
              sx={{
                transform: "rotate(270deg)",
              }}
              fontSize="large"
            />
          )}
        </Box>
      </Box>
      <Typography className={classes.description} align="center" gutterBottom>
        拖放檔案
      </Typography>
      <Typography className={classes.description} align="center" gutterBottom>
        或點擊按鈕
      </Typography>
      <Button
        className={classes.uploadButton}
        variant="contained"
        onClick={(e) => {
          if (onClick) {
            onClick(e);
          }
          e.stopPropagation();
        }}
      >
        {wordLibrary?.upload ?? "上傳"}
      </Button>
    </div>
  );

  const inputProps = getInputProps();

  return (
    <div
      className={clsx(className, classes.root, {
        [classes.dragActive]: isDragActive,
      })}
      {...otherRootProps}
      {...other}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-hidden
    >
      <input
        {...inputProps}
        required={required}
        name={name}
        style={{ display: "block", position: "absolute", zIndex: -1 }}
      />
      {renderContent()}
    </div>
  );
};

export default FileUploadDropzone;
