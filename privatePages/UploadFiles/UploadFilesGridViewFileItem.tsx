// @mui
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import { CardProps } from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// hooks
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useBoolean } from "minimal/hooks/use-boolean";
// utils
import useFileEvents from "utils/useFileEvents";
import { fDateTime } from "minimal/utils/format-time";
import { fData } from "minimal/utils/format-number";
// types
import { UploadFile } from "interfaces/entities";
// components
import Iconify from "minimal/components/iconify";
import CustomPopover, { usePopover } from "minimal/components/custom-popover";
import TextMaxLine from "minimal/components/TextMaxLine";
import FileThumbnail from "minimal/components/file-thumbnail";
import { ConfirmDialog } from "minimal/components/custom-dialog";
import PermissionValid from "components/PermissionValid/PermissionValid";
//

// ----------------------------------------------------------------------

interface Props extends Omit<CardProps, "onSelect"> {
  file: UploadFile;
  openDialog: () => void;
  setSelectedFile: React.Dispatch<React.SetStateAction<UploadFile | undefined>>;
  selected?: boolean;
  onSelect?: (file: UploadFile) => void;
  onDelete?: VoidFunction;
}

export default function UploadFileGridViewFileItem({
  file,
  openDialog,
  setSelectedFile,
  selected,
  onSelect,
  onDelete,
  sx,
  ...other
}: Props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { handleDownloadFile, handlePreviewFile } = useFileEvents();

  const checkbox = useBoolean();
  const confirm = useBoolean();
  const details = useBoolean();
  const popover = usePopover();

  const handleClick = () => {
    if (onSelect) onSelect(file);
  };

  const renderIcon =
    (checkbox.value || selected) && onSelect ? (
      <Checkbox
        size="medium"
        checked={selected}
        onClick={handleClick}
        icon={<Iconify icon="eva:radio-button-off-fill" />}
        checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        sx={{ p: 0.75 }}
      />
    ) : (
      <FileThumbnail
        file={file.uploadFileExtensionName}
        sx={{ width: 36, height: 36 }}
      />
    );

  const renderAction = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ top: 8, right: 8, position: "absolute" }}
    >
      <IconButton
        color={popover.open ? "inherit" : "default"}
        onClick={(e) => {
          popover.onOpen(e);
          e.stopPropagation();
        }}
      >
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Stack>
  );

  const renderText = (
    <>
      <TextMaxLine
        persistent
        variant="subtitle2"
        onClick={details.onTrue}
        sx={{ width: 1, mt: 2, mb: 0.5 }}
      >
        {file.uploadFileName}
      </TextMaxLine>

      <Stack
        direction="row"
        alignItems="center"
        sx={{
          maxWidth: 0.99,
          whiteSpace: "nowrap",
          typography: "caption",
          color: "text.disabled",
        }}
      >
        {fData(file.uploadFileSize)}

        <Box
          component="span"
          sx={{
            mx: 0.75,
            width: 2,
            height: 2,
            flexShrink: 0,
            borderRadius: "50%",
            bgcolor: "currentColor",
          }}
        />
        <Typography noWrap component="span" variant="caption">
          {fDateTime(file.uploadFileCreateDate)}
        </Typography>
      </Stack>
    </>
  );

  return (
    <>
      <Stack
        component={Paper}
        variant="outlined"
        alignItems="flex-start"
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: "unset",
          cursor: "pointer",
          position: "relative",
          ...((checkbox.value || selected) && {
            bgcolor: "background.paper",
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...sx,
        }}
        {...other}
        onClick={handleClick}
      >
        <Box onMouseEnter={checkbox.onTrue} onMouseLeave={checkbox.onFalse}>
          {renderIcon}
        </Box>

        {renderText}

        {renderAction}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
          <MenuItem
            onClick={() => {
              popover.onClose();
              openDialog();
              setSelectedFile(file);
            }}
          >
            <Iconify icon="ant-design:edit-filled" />
            {wordLibrary?.edit ?? "編輯"}
          </MenuItem>
        </PermissionValid>
        <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
          <MenuItem
            onClick={() => {
              popover.onClose();
              handlePreviewFile(file.uploadFileId);
            }}
          >
            <Iconify icon="material-symbols:visibility-rounded" />
            {wordLibrary?.preview ?? "預覽"}
          </MenuItem>
        </PermissionValid>

        <Divider sx={{ borderStyle: "dashed" }} />

        <PermissionValid shouldBeOrgOwner modulePermissions={["READ"]}>
          <MenuItem
            onClick={() => {
              handleDownloadFile(file.uploadFileId);
              popover.onClose();
            }}
            // sx={{ color: "error.main" }}
          >
            <Iconify icon="ic:round-download" />
            {wordLibrary?.download ?? "下載"}
          </MenuItem>
        </PermissionValid>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            {wordLibrary?.delete ?? "刪除"}
          </Button>
        }
      />
    </>
  );
}
