/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { forwardRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
// @mui
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
// assets
import { UploadIllustration } from "minimal/assets/illustrations";
//

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import Iconify from "minimal/components/iconify/iconify";

//
import { CustomFile, UploadProps } from "./types";
import RejectionFiles from "./errors-rejection-files";
import MultiFilePreview from "./preview-multi-file";
import SingleImgPreview from "./preview-image-file";
import SingleFilePreview from "./preview-single-file";

const useStyles = makeStyles(() => ({
  remove: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1,
  },
}));

// ----------------------------------------------------------------------
const Upload = forwardRef<HTMLDivElement, UploadProps>((props, ref) => {
  const {
    disabled,
    multiple = false,
    error,
    helperText,
    //
    file: fileProp,
    onDelete,
    imgUrl,
    //
    files,
    thumbnail,
    onUpload,
    onRemove,
    onRemoveAll,
    sx,
    name,
    required = false,
    isHover,
    setIsHover,
    isWaitingUpload = false,
    deleteIconBtnType = "delete",
    isSlider = false,
    ...other
  } = props;

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    multiple,
    disabled,
    ...other,
  });
  const classes = useStyles();

  const [selectedFile, setSelectedFile] = useState<
    CustomFile | string | undefined | null
  >();
  const [file, setFile] = useState<CustomFile | string | undefined | null>();

  useEffect(() => {
    if (files?.length) {
      setFile(files[files?.length - 1]);
      setSelectedFile(files[files?.length - 1]);
    } else {
      setFile(undefined);
      setSelectedFile(undefined);
    }
    if (fileProp) {
      setFile(fileProp);
      setSelectedFile(fileProp);
    }
  }, [fileProp, files, files?.length]);

  function isImageType(file: CustomFile | string | null) {
    return typeof file === "string" ? true : file?.type.startsWith("image/");
  }

  const hasFile = !multiple && !!file;

  const hasFiles = multiple && !!files && !!files.length;

  const hasOneNotImgFile = hasFile && !isImageType(file!);

  const hasOneImgFile = hasFile && isImageType(file!);

  const hasError = isDragReject || !!error;

  const wordLibrary = useSelector(getWordLibrary);

  const renderPlaceholder = (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
    >
      <UploadIllustration sx={{ width: 1, maxWidth: 200 }} />
      <Stack spacing={1} sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ color: "text.primary" }}>
          {wordLibrary?.["delete or select files"] ?? "上傳檔案"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          {wordLibrary?.["drag and drop files here or click"] ??
            "將檔案拖放到此處或單擊"}
          <Box
            component="span"
            sx={{
              mx: 0.5,
              color: "primary.main",
              textDecoration: "underline",
            }}
          >
            {wordLibrary?.browse ?? "瀏覽"}
          </Box>
          {wordLibrary?.["your computer"] ?? "您的電腦"}
        </Typography>
      </Stack>
    </Stack>
  );

  const renderSingleFilePreview = hasFile && (
    <SingleFilePreview file={file} thumbnail={thumbnail} onRemove={onRemove} />
  );

  const renderImgPreview = (hasOneImgFile || hasFiles) && (
    <SingleImgPreview file={selectedFile! || file!} onRemove={onRemove} />
  );

  const renderMultiPreview = hasFiles && (
    <>
      <Box sx={{ my: 3 }}>
        <MultiFilePreview
          files={files}
          thumbnail={thumbnail}
          onRemove={onRemove}
          onSelectFile={setSelectedFile}
        />
      </Box>

      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        {onRemoveAll && (
          <Button
            color="inherit"
            variant="outlined"
            size="small"
            onClick={onRemoveAll}
          >
            Remove All
          </Button>
        )}

        {onUpload && (
          <Button
            size="small"
            variant="contained"
            onClick={onUpload}
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          >
            Upload
          </Button>
        )}
      </Stack>
    </>
  );

  return (
    <Box
      component={"div"}
      onMouseEnter={() => {
        if (setIsHover) setIsHover(true);
      }}
      onMouseLeave={() => {
        if (setIsHover) setIsHover(false);
      }}
      sx={{
        position: "relative",
        // width: "100%",
        // maxWidth: 400,
        // aspectRatio: "1 / 1",
        ...sx,
      }}
    >
      <Box
        {...getRootProps()}
        ref={ref}
        sx={{
          p: 5,
          outline: "none",
          borderRadius: 1,
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          border: (theme) =>
            `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          transition: (theme) =>
            theme.transitions.create(["opacity", "padding"]),
          "&:hover": {
            opacity: 0.8,
          },
          ...(isDragActive && {
            opacity: 0.72,
          }),
          ...(disabled && {
            opacity: 0.48,
            pointerEvents: "none",
          }),
          ...(hasError && {
            color: "error.main",
            bgcolor: "error.lighter",
            borderColor: "error.light",
          }),
          ...((hasOneImgFile || hasFiles) && {
            padding: "24% 0",
          }),
          ...(hasOneNotImgFile && {
            display: "none",
          }),
          height: 400,
          width: "100%",
          aspectRatio: isSlider ? "unset" : "1 / 1",
          maxWidth: isSlider ? "unset" : 400,
          maxHeight: 400,
        }}
      >
        {!isWaitingUpload && isHover && onDelete && (
          <IconButton
            className={classes.remove}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
          >
            {deleteIconBtnType === "delete" && (
              <Iconify icon="solar:trash-bin-2-bold" width={24} height={24} />
            )}
            {deleteIconBtnType === "cancel" && (
              <Iconify icon="basil:cancel-solid" width={30} height={30} />
            )}
          </IconButton>
        )}
        <input
          required={required}
          name={name}
          {...getInputProps()}
          style={{
            display: "block",
            visibility: "visible",
            position: !error ? "relative" : "absolute",
            top: !error ? "0px" : "30px",
            left: !error ? "0px" : "20px",
            maxWidth: !error ? "auto" : "140px",
            zIndex: -1,
            opacity: 0,
          }}
        />
        {(isHover || isWaitingUpload) &&
          !hasFile &&
          !hasFiles &&
          renderPlaceholder}
        {isHover && (hasOneImgFile || hasFiles) && renderImgPreview}
      </Box>
      {isHover && helperText}
      <RejectionFiles fileRejections={fileRejections} />
      {isHover && hasOneNotImgFile && renderSingleFilePreview}
      {isHover && renderMultiPreview}
    </Box>
  );
});

export default Upload;
