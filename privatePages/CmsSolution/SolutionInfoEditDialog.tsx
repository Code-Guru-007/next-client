import React, {
  useEffect,
  FC,
  useState,
  ReactElement,
  cloneElement,
  useContext,
} from "react";

import clsx from "clsx";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import { MenuItem, Select } from "@mui/material";
import { PageType, LocaleMap, Locale } from "interfaces/utils";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import { CarouselEditFormInput } from "interfaces/form";
import { OrganizationSolution } from "interfaces/entities";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Tooltip from "@eGroupAI/material/Tooltip";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

import Dialog, { DialogProps } from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import IconButton from "components/IconButton/StyledIconButton";
import DialogCloseButton from "components/DialogCloseButton";
import Box from "@eGroupAI/material/Box";
import DialogConfirmButton from "components/DialogConfirmButton";
import type { Item } from "./typing";
import SolutionInfoManagementContext from "./SolutionInfoManagementContext";

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

export interface SolutionInfoEditDialogProps {
  pageType: PageType | any;
  targetId?: string;
  solutionInfo?: OrganizationSolution;
  selectedLocale: Locale;
  renderForm?: () => ReactElement;
  form?: string;
  title?: string;
  open: DialogProps["open"];
  onClose?: () => void;
  infoMutate?: KeyedMutator<AxiosResponse<OrganizationSolution, any>>;
  onDeleteClick?: (selectedItem?: Item) => void;
  updating?: boolean;
}

const SolutionInfoEditDialog: FC<SolutionInfoEditDialogProps> = function (
  props
) {
  const {
    selectedLocale,
    renderForm,
    form,
    title,
    open,
    onClose,
    infoMutate,
    updating,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { setSelectedLocale } = useContext(SolutionInfoManagementContext);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [formIsBusy, setFormIsBusy] = useState(false);
  const [, setFormValues] = useState<CarouselEditFormInput>();

  const [selectedDesktop, setSelectedDesktop] = useState(true);
  const [, setFile] = useState<File | string | null>(null);
  const [, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!open) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setSelectedDesktop(true);
    setFile(null);
    setSelectedFiles([]);
    setFormValues({
      organizationMediaSliderTitle: "",
      organizationMediaSliderDescription: "",
      organizationMediaSliderLinkURL: "",
    });
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
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <div className={classes.headerActions}>
            <div>
              <Tooltip title="上傳 PC 輪播圖">
                <IconButton
                  className={clsx(classes.device, {
                    [classes.deviceSelected]: selectedDesktop,
                  })}
                  size="large"
                  onClick={() => setSelectedDesktop(true)}
                >
                  <DesktopWindowsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="上傳 Mobile 輪播圖">
                <IconButton
                  className={clsx(classes.device, {
                    [classes.deviceSelected]: !selectedDesktop,
                  })}
                  size="large"
                  onClick={() => setSelectedDesktop(false)}
                  sx={{ marginLeft: 1 }}
                >
                  <PhoneAndroidIcon />
                </IconButton>
              </Tooltip>
            </div>
            <Box flexGrow={1} />
          </div>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            size="small"
            value={selectedLocale}
            onChange={(e: any) => {
              if (setSelectedLocale) setSelectedLocale(e.target.value);
            }}
          >
            <MenuItem value="zh_TW">繁體中文</MenuItem>
            <MenuItem value="en_US">English</MenuItem>
          </Select>
        </DialogActions>
        {renderForm &&
          cloneElement(renderForm(), {
            setFormIsDirty,
            setFormIsBusy,
            infoMutate,
            setFormValues,
            selectedDesktop,
          })}
      </DialogFullPageContainer>
      <DialogActions>
        <Box flexGrow={1} />
        <DialogCloseButton
          onClick={() => closeConfirm()}
          disabled={formIsBusy || updating}
        />
        <DialogConfirmButton
          type="submit"
          form={form}
          disabled={updating || formIsBusy}
          loading={updating || formIsBusy}
        >
          {`儲存${LocaleMap[selectedLocale]}`}
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default SolutionInfoEditDialog;
