import React, {
  ReactNode,
  FC,
  useState,
  ReactElement,
  cloneElement,
} from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import Typography from "@eGroupAI/material/Typography";
import DialogActions from "@mui/material/DialogActions";
import useConfirmLeaveDialog from "utils/useConfirmLeaveDialog";
import { Locale, LocaleMap } from "interfaces/utils";

import Dialog, { DialogProps } from "@eGroupAI/material/Dialog";
import Box from "@eGroupAI/material/Box";
import DialogFullPageContainer from "components/DialogFullPageContainer";
import DialogCloseButton from "components/DialogCloseButton";
import I18nTabs from "components/I18nTabs";
import DialogConfirmButton from "components/DialogConfirmButton";

import { Button, MenuItem, Select } from "@mui/material";
import useCmsContentForm from "components/OrgCmsContentEditor/editors/useCmsContentForm";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
      [theme.breakpoints.up("md")]: {
        minWidth: "600px",
      },
    },
  },
}));

export interface EditSectionDialogProps {
  renderForm: (selectedLocale: Locale) => ReactElement;
  primary?: ReactNode;
  form?: string;
  open: DialogProps["open"];
  onClose?: () => void;
  updating?: boolean;
  disableSelectLocale?: boolean;
  hideSubmitButton?: boolean;
  useLocaleTabs?: boolean;
  tableSelectedLocale?: Locale;
  sortOpenDialog?: boolean;
  sortItems?: any[];
  cmsContentId?: any;
  /**
   * This prop is used to determine the dialog width in the CMS module used.
   * Whether one item edit at once logic enabled or disabled, the width will be different.
   * @default true
   * But if the Dialog content has included other parts like Froala Editor, it should be false for the width to be correct size(900px).
   */
  isWidthSM?: boolean;
}

const EditSectionDialog: FC<EditSectionDialogProps> = function (props) {
  const {
    renderForm,
    form,
    open,
    onClose,
    updating,
    disableSelectLocale,
    hideSubmitButton,
    primary,
    sortItems,
    useLocaleTabs,
    tableSelectedLocale = Locale.ZH_TW,
    sortOpenDialog,
    cmsContentId,
    isWidthSM = true,
  } = props;
  const classes = useStyles(props);
  const theme = useTheme();
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [formIsBusy, setFormIsBusy] = useState(false);

  const [selectedLocale, setSelectedLocale] = useState(
    tableSelectedLocale ?? Locale.ZH_TW
  );

  // Close dialog and clear states
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const { handleSortItem } = useCmsContentForm({
    cmsContentId,
    selectedLocale,
  });

  const closeConfirm = useConfirmLeaveDialog({
    shouldOpen: formIsDirty,
    handleClose,
    onConfirm: handleClose,
  });

  return (
    <Dialog
      open={open}
      onClose={() => closeConfirm()}
      disableEscapeKeyDown={updating || formIsBusy}
      maxWidth={isWidthSM ? "sm" : "md"}
      fullWidth={!sortOpenDialog}
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      disableEnforceFocus
    >
      <DialogTitle onClickClose={() => closeConfirm()}>
        <div>
          <Typography variant="h3" gutterBottom>
            {primary}管理
          </Typography>
          {sortOpenDialog && (
            <Typography variant="h5">拖移圖片進行排序</Typography>
          )}
        </div>
      </DialogTitle>
      <DialogFullPageContainer>
        {!disableSelectLocale &&
          useLocaleTabs &&
          selectedLocale &&
          !sortOpenDialog && (
            <I18nTabs
              TabsProps={{
                value: selectedLocale,
                onChange: (_, v) => {
                  if (formIsDirty) {
                    closeConfirm(() => {
                      setSelectedLocale(v);
                    });
                  } else {
                    setSelectedLocale(v);
                  }
                },
              }}
              disabled={updating || formIsBusy}
            />
          )}
        {!disableSelectLocale && !useLocaleTabs && !sortOpenDialog && (
          <DialogActions>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              size="small"
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value as Locale)}
            >
              <MenuItem value="zh_TW">繁體中文</MenuItem>
              <MenuItem value="en_US">English</MenuItem>
            </Select>
          </DialogActions>
        )}
        {cloneElement(renderForm(selectedLocale), {
          setFormIsDirty,
          setFormIsBusy,
        })}
      </DialogFullPageContainer>
      <DialogActions>
        {sortOpenDialog ? (
          <>
            <Button onClick={() => closeConfirm()} variant="outlined">
              取消
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (sortItems) {
                  handleSortItem(sortItems);
                  closeConfirm();
                }
              }}
            >
              儲存
            </Button>
          </>
        ) : (
          <>
            <Box flexGrow={1} />
            <DialogCloseButton
              sx={{ marginRight: 1 }}
              onClick={() => closeConfirm()}
              disabled={updating || formIsBusy}
            />
            {!hideSubmitButton && (
              <DialogConfirmButton
                type="submit"
                form={form}
                loading={updating || formIsBusy}
                disabled={!formIsDirty}
              >
                {disableSelectLocale
                  ? "儲存"
                  : `儲存${LocaleMap[selectedLocale]}`}
              </DialogConfirmButton>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditSectionDialog;
