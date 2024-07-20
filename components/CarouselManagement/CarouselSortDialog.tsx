import React, { FC, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import { Button, DialogActions } from "@mui/material";

import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import Dialog, { DialogProps } from "@eGroupAI/material/Dialog";
import Typography from "@eGroupAI/material/Typography";
import DialogFullPageContainer from "components/DialogFullPageContainer/DialogFullPageContainer";
import DialogTitle from "@eGroupAI/material/DialogTitle";

import { Item } from "./typing";
import EditableCarouselList, {
  EditableCarouselListProps,
} from "./EditableCarouselList";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
      [theme.breakpoints.up("md")]: {
        minWidth: "600px",
      },
    },
  },
  sortDialog: {
    background: theme.palette.mode === "dark" ? "#2f3944" : "#F4F6F8",
    padding: "20px",
    borderRadius: "16px",
  },
}));

export interface CarouselSortDialogProps {
  open: DialogProps["open"];
  onClose?: () => void;
  title?: string;
  items?: Item[];
  onItemClick?: EditableCarouselListProps["onItemClick"];
  onItemOrderChange?: EditableCarouselListProps["onItemOrderChange"];
  onCreateItemClick?: EditableCarouselListProps["onCreateItemClick"];
  onDeleteItemClick?: EditableCarouselListProps["onDeleteItemClick"];
  hideCreateItem?: boolean;
  openSortModel?: boolean;
}

const CarouselSortDialog: FC<CarouselSortDialogProps> = function (props) {
  const {
    open,
    onClose,
    title,
    items,
    onItemClick,
    onItemOrderChange,
    onCreateItemClick,
    onDeleteItemClick,
    hideCreateItem,
    openSortModel,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [sortedList, setSortedList] = useState([]);

  const handleDropItem = () => {
    if (onItemOrderChange) {
      onItemOrderChange(sortedList);
      if (onClose) onClose();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          <Typography variant="h5">拖移圖片進行排序</Typography>
        </div>
      </DialogTitle>
      <DialogFullPageContainer>
        <div className={classes.sortDialog}>
          <DndProvider backend={HTML5Backend}>
            <EditableCarouselList
              openSortModel={openSortModel}
              items={items}
              setSortedList={setSortedList}
              onItemClick={onItemClick}
              onItemOrderChange={onItemOrderChange}
              onCreateItemClick={onCreateItemClick}
              onDeleteItemClick={onDeleteItemClick}
              hideCreateItem={hideCreateItem}
            />
          </DndProvider>
        </div>
      </DialogFullPageContainer>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          取消
        </Button>
        <Button variant="contained" onClick={handleDropItem}>
          儲存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CarouselSortDialog;
