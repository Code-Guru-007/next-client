import React, {
  useEffect,
  useContext,
  FC,
  useState,
  ReactElement,
  cloneElement,
} from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import { MenuItem, Select } from "@mui/material";
import { PageType, LocaleMap, Locale } from "interfaces/utils";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import useUploadFilesHandler from "utils/useUploadFilesHandler";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import Dialog, { DialogProps } from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import Box from "@eGroupAI/material/Box";
import DialogConfirmButton from "components/DialogConfirmButton";
import CarouselManagementContext from "components/CarouselManagement/CarouselManagementContext";
import type { Item } from "components/CarouselManagement/typing";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "flex-end",
  },
  headerWrapper: {
    padding: "20px 0",
  },
  headerActions: {
    display: "flex",
  },
  device: {
    background: theme.palette.grey[200],
    color: theme.palette.grey[500],
    "&:hover": {
      background: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
  deviceSelected: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

export interface CarouselEditDialogProps {
  pageType: PageType | any;
  targetId?: string;
  renderForm: (selectedLocale: Locale) => ReactElement;
  form?: string;
  title?: string;
  open: DialogProps["open"];
  onClose?: () => void;
  onDeleteClick?: (selectedItem?: Item) => void;
  updating?: boolean;
}

const CarouselEditDialog: FC<CarouselEditDialogProps> = function (props) {
  const { renderForm, form, title, open, onClose, updating } = props;
  const theme = useTheme();
  const { isOrgUploading, setCompleted, clearValue } = useUploadFilesHandler();
  const classes = useStyles();
  const { selectedItem, setSelectedLocale, selectedLocale } = useContext(
    CarouselManagementContext
  );
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [formIsBusy, setFormIsBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close dialog and clear states
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setCompleted(0);
    clearValue();
  };

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose,
    onConfirm: handleClose,
  });

  return (
    <Dialog
      open={open}
      onClose={() => closeConfirm()}
      maxWidth="md"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={onClose}>
        <div>
          <Typography variant="h3" gutterBottom>
            {title}
          </Typography>
        </div>
      </DialogTitle>
      <DialogFullPageContainer>
        <DialogActions>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={selectedLocale}
            onChange={(e: any) => setSelectedLocale(e.target.value)}
          >
            <MenuItem value="zh_TW">繁體中文</MenuItem>
            <MenuItem value="en_US">English</MenuItem>
          </Select>
        </DialogActions>
        {cloneElement(renderForm(selectedLocale), {
          setFormIsDirty,
          setFormIsBusy,
        })}
      </DialogFullPageContainer>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton
          onClick={() => closeConfirm()}
          disabled={isOrgUploading || updating || formIsBusy}
        />
        <DialogConfirmButton
          type="submit"
          form={form}
          disabled={isOrgUploading || !formIsDirty || formIsBusy}
          loading={updating || formIsBusy}
        >
          {selectedItem
            ? `儲存${LocaleMap[selectedLocale]}`
            : `新增${LocaleMap[selectedLocale]}`}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default CarouselEditDialog;
