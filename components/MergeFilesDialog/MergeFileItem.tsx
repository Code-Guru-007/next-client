import { Typography } from "@eGroupAI/material";
import { Box, IconButton, Stack } from "@mui/material";
import FileThumbnail from "components/OrgCmsMediaFieldItemComponents/file-thumbnail";
import { UploadFile } from "interfaces/entities";
import Iconify from "minimal/components/iconify";

export interface MergeFileItemProps {
  file: UploadFile;
  onRemove: (file: UploadFile) => void;
}

export default function MergeFileItem({ file, onRemove }: MergeFileItemProps) {
  return (
    <Stack
      sx={{
        width: "auto",
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.card,
        position: "relative",
      }}
    >
      <IconButton
        disableRipple
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          p: 0,
          color: "common.black",
        }}
        onClick={() => onRemove(file)}
      >
        <Iconify icon="solar:close-circle-bold" width={20} />
      </IconButton>
      <Box sx={{ aspectRatio: "1 / 1", p: 1 }}>
        <FileThumbnail
          file={file.uploadFilePath}
          imageView
          imgSx={{ borderRadius: 1.5 }}
        />
      </Box>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="subtitle2" noWrap>
          {file.uploadFileName}.{file.uploadFileExtensionName}
        </Typography>
      </Box>
    </Stack>
  );
}
