import {
  DialogTitle as MuiDialogTitle,
  IconButton,
  Stack,
  Typography,
  Box,
  SxProps,
  Theme,
} from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";

export interface DialogTitleProps {
  children?: React.ReactNode;
  onClickClose?: () => void;
  isCenter?: boolean;
  isFlex?: boolean;
  onClickHelper?: () => void;
  sx?: SxProps<Theme>;
}

const DialogTitle = (props: DialogTitleProps) => {
  const {
    children,
    onClickClose,
    isCenter = false,
    isFlex = false,
    onClickHelper,
    sx,
  } = props;
  return (
    <MuiDialogTitle sx={sx}>
      <Stack direction="row" alignItems="center" justifyContent="center">
        <Typography
          variant="h6"
          sx={{
            flexGrow: isCenter ? 0 : 1,
            display: isFlex ? "flex" : "initial",
            justifyContent: isFlex ? "space-between" : "initial",
          }}
        >
          {children}
        </Typography>

        {(onClickHelper || onClickClose) && (
          <Box position="absolute" sx={{ right: 10, top: 10 }}>
            {onClickHelper && (
              <IconButton onClick={onClickHelper} id="dialog-help-btn">
                <Iconify icon="ion:help-circle-outline" />
              </IconButton>
            )}
            {onClickClose && (
              <IconButton onClick={onClickClose} id="dialog-close-btn">
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            )}
          </Box>
        )}
      </Stack>
    </MuiDialogTitle>
  );
};

export default DialogTitle;
