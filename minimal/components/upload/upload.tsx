/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { forwardRef, useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
// @mui
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// assets
import { UploadIllustration } from "minimal/assets/illustrations";
//

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";
import Iconify from "../iconify";
//
import { CustomFile, UploadProps } from "./types";
import RejectionFiles from "./errors-rejection-files";
import MultiFilePreview from "./preview-multi-file";
import SingleImgPreview from "./preview-image-file";
import SingleFilePreview from "./preview-single-file";

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
    isItemImage = false,
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

  const [imageInfo, setImageInfo] = useState<{
    largeWidth: boolean;
    largeHeight: boolean;
    ratio: number;
  }>({ largeWidth: false, largeHeight: false, ratio: 1 });

  const checkImageSize = useCallback(
    (imageUrl, containerWidth, containerHeight) => {
      const img = new Image();
      img.onload = () => {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        setImageInfo((prev) => ({
          ...prev,
          ratio: imageWidth / imageHeight,
        }));
        if (imageWidth > containerWidth) {
          setImageInfo((prev) => ({ ...prev, largeWidth: true }));
        }
        if (imageHeight > containerHeight) {
          setImageInfo((prev) => ({ ...prev, largeHeight: true }));
        }
      };
      img.onerror = () => {
        // eslint-disable-next-line no-console
        console.error("There was an error loading the image.");
      };
      img.src = imageUrl;
    },
    []
  );

  // Usage
  const containerWidth = 400; // The fixed width of your container
  const containerHeight = 400; // The fixed height of your container

  useEffect(() => {
    if (file && typeof file !== "string")
      checkImageSize(
        URL.createObjectURL(file as File),
        containerWidth,
        containerHeight
      );
  }, [checkImageSize, file]);

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
          {wordLibrary?.["select files"] ?? "上傳檔案"}
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
    <SingleImgPreview
      file={selectedFile! || file!}
      onRemove={onRemove}
      imageInfo={imageInfo}
      imageSx={{
        ...(isItemImage
          ? {
              maxWidth: containerWidth,
              maxHeight: containerHeight,
              aspectRatio: 16 / 9,
            }
          : {}),
      }}
    />
  );

  const renderMultiPreview = hasFiles && (
    <>
      <Box sx={{ my: 3 }}>
        <MultiFilePreview
          files={files}
          thumbnail={thumbnail}
          onRemove={onRemove}
          onSelectFile={setSelectedFile}
          disabled={disabled}
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
      sx={{
        // maxWidth: 560,
        // maxHeight: 312,
        position: "relative",
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
            opacity: 0.72,
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
          ...(isItemImage
            ? {
                maxWidth: containerWidth,
                maxHeight: containerHeight,
                aspectRatio: "1 / 1",
              }
            : {}),
        }}
        id="upload-file-dropzone"
      >
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
        {!hasFile && !hasFiles && renderPlaceholder}
        {(hasOneImgFile || hasFiles) && renderImgPreview}
      </Box>

      {helperText}

      <RejectionFiles fileRejections={fileRejections} />
      {hasOneNotImgFile && renderSingleFilePreview}
      {renderMultiPreview}
    </Box>
  );
});

export default Upload;
