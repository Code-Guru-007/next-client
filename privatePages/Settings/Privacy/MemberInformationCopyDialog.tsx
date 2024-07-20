import React, { FC, useEffect, useState } from "react";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import { useTheme } from "@mui/material";

import clsx from "clsx";
import { makeStyles } from "@mui/styles";

import {
  Box,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@eGroupAI/material";
import MenuItem from "components/MenuItem";

import Dialog from "@eGroupAI/material/Dialog";
import DialogTitle from "@eGroupAI/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@eGroupAI/material/DialogContent";
import DialogConfirmButton from "components/DialogConfirmButton";

import LocalActivityIcon from "@mui/icons-material/LocalActivityRounded";
import PushPinIcon from "@mui/icons-material/PushPinRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthRounded";
import DatePicker from "components/DatePicker";

export interface MemberInformationCopyDialogProps {
  primary?: string;
  description?: string;
  onConfirm?: (
    copyFormat: string,
    copyDate: Date | null,
    copyData: string | undefined
  ) => void | Promise<void | string>;
  isLoading?: boolean;
}

export const DIALOG = "MemberInformationCopyDialog";

const copyFormatSelectList = ["HTML", "JSON"];
const copyDataSelectList = [
  {
    icon: <LocalActivityIcon />,
    value: "Activity",
  },
  {
    icon: <PushPinIcon />,
    value: "Bulletin",
  },
  {
    icon: <CalendarMonthIcon />,
    value: "Calendar",
  },
];

const useStyles = makeStyles(() => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
    },
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  datePicker: {},
  mb1: {
    marginBottom: "10px",
  },
  mb2: {
    marginBottom: "16px",
  },
  textFieldCopyData: {
    "&.MuiEgTextField-root .MuiListItemIcon-root": {
      display: "none",
    },
    "& .MuiListItemText-root": {
      margin: 0,
    },
  },
  menuItem: {
    "&.Mui-selected .MuiSvgIcon-root": {
      height: "24px",
      width: "24px",
    },
    "& .MuiSvgIcon-root": {
      height: "15px",
      width: "15px",
    },
  },
  listItemText: {
    margin: 0,
  },
}));

const MemberInformationCopyDialog: FC<MemberInformationCopyDialogProps> = (
  props
) => {
  const theme = useTheme();
  const classes = useStyles(props);
  const { primary, description, onConfirm, isLoading = false } = props;
  const { isOpen, closeDialog } = useReduxDialog(DIALOG);

  const [selectedCopyFormat, setSelectedCopyFormat] = useState<string>("JSON");
  const [copyDate, setCopyDate] = useState<Date | null>(new Date());
  const [selectedCopyData, setSelectedCopyData] = useState<string | undefined>(
    undefined
  );

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCopyData) setIsValid(true);
    else setIsValid(false);
  }, [selectedCopyData]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm(selectedCopyFormat, copyDate, selectedCopyData);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      className={classes.dialogPaper}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
    >
      <DialogTitle onClickClose={closeDialog}>
        <Typography variant="h3" color="text" marginBottom={2}>
          {primary}
        </Typography>
        <Box flexGrow={1} />
        <Typography variant="body1" marginBottom={3}>
          {description}
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box>
          <Typography variant="h5" color="text" marginLeft={3} gutterBottom>
            建立副本格式
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            select
            value={selectedCopyFormat}
            onChange={(e) => {
              setSelectedCopyFormat(e.target.value);
            }}
            className={classes.mb1}
          >
            {copyFormatSelectList.map((format) => (
              <MenuItem
                key={format}
                value={format}
                disabled={format === "HTML"}
              >
                {format}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box>
          <DatePicker
            value={copyDate}
            label="副本時間"
            labelPadding="medium"
            labelColor={theme.palette.grey[100]}
            showBorder
            fullWidth
            onChange={(date) => {
              setCopyDate(date);
            }}
            maxDate={new Date()}
            className={clsx(classes.datePicker, classes.mb2)}
          />
        </Box>
        <Box>
          <Typography variant="h5" color="text" marginLeft={3} gutterBottom>
            建立副本格式
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            select
            placeholder="請選擇資料"
            value={selectedCopyData}
            onChange={(e) => {
              setSelectedCopyData(e.target.value);
            }}
            className={clsx(classes.textFieldCopyData, classes.mb1)}
          >
            {copyDataSelectList.map((d) => (
              <MenuItem
                key={d.value}
                value={d.value}
                className={classes.menuItem}
              >
                <ListItemIcon>{d.icon}</ListItemIcon>
                <ListItemText>{d.value}</ListItemText>
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <DialogConfirmButton
          fullWidth
          onClick={handleConfirm}
          color="primary"
          loading={isLoading}
          disabled={isLoading || !isValid}
        >
          建立副本
        </DialogConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default MemberInformationCopyDialog;
