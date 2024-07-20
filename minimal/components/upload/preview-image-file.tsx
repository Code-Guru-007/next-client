import { m } from "framer-motion";
// @mui
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { SxProps, Theme, alpha } from "@mui/material/styles";
import { ListItemText, Stack } from "@mui/material";
//
import { fData } from "minimal/utils/format-number";

import Image from "../image";
import Iconify from "../iconify";
import { CustomFile } from "./types";
import FileThumbnail from "../file-thumbnail/file-thumbnail";
import { varFade } from "../animate";
import { fileData } from "../file-thumbnail";

// ----------------------------------------------------------------------

type Props = {
  file: CustomFile | string;
  onRemove?: (file: File | string) => void;
  setSelectedFile?: React.Dispatch<
    React.SetStateAction<string | CustomFile | undefined>
  >;
  imageSx?: SxProps<Theme>;
  imageInfo?: {
    largeWidth: boolean;
    largeHeight: boolean;
    ratio: number;
  };
};

export default function SingleImgPreview({
  file,
  onRemove,
  setSelectedFile,
  imageSx: imageSxProps,
}: Props) {
  if (!file) return <></>;
  const { key, name = "", size = 0, type } = fileData(file);
  const isImageFile =
    type === "png" ||
    type === "jpeg" ||
    type === "jpg" ||
    type === "gif" ||
    type === "webp" ||
    type.startsWith("image/");

  return (
    <Box
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {onRemove && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (setSelectedFile) setSelectedFile(undefined);
            if (onRemove) onRemove(file);
          }}
          sx={{
            top: 16,
            right: 16,
            zIndex: 9,
            position: "absolute",
            color: (theme) => alpha(theme.palette.common.white, 0.8),
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
            },
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>
      )}

      {file && isImageFile && (
        <Image
          alt="file preview"
          src={
            typeof file === "string"
              ? file
              : file?.preview || URL.createObjectURL(file)
          }
          sx={{
            width: 1,
            height: 1,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& > span": {
              width: "auto !important",
              height: "auto !important",
            },
            "& > span > img": {
              ...imageSxProps,
              borderRadius: 1,
            },
          }}
        />
      )}
      {file && !isImageFile && (
        <Stack
          key={key}
          component={m.div}
          {...varFade().inUp}
          spacing={2}
          direction="row"
          alignItems="center"
          sx={{
            my: "auto",
            py: 2.5,
            px: 2.5,
            borderRadius: 1,
          }}
        >
          <FileThumbnail file={file} />

          <ListItemText
            primary={typeof file === "string" ? file : name}
            secondary={typeof file === "string" ? file : fData(size)}
            secondaryTypographyProps={{
              component: "span",
              typography: "caption",
            }}
          />
        </Stack>
      )}
    </Box>
  );
}
