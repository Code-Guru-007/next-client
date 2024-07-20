import React, { FC, useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { Avatar } from "@mui/material";
import clsx from "clsx";
import DragItem, { useDragItem } from "components/DragItem";
import Image from "next/image";

import Grid from "@eGroupAI/material/Grid";
import ButtonBase, { ButtonBaseProps } from "@eGroupAI/material/ButtonBase";
import encodedUrlWithParentheses from "@eGroupAI/utils/encodedUrlWithParentheses";
import addBg from "./add.png";
import { Item } from "./typing";
import arrowUp from "../../minimal/assets/icons/solarDoubleArrow.png";

const useStyles = makeStyles((theme) => ({
  item: {
    transition: "all 0.4s",
    opacity: 1,
    cursor: "pointer",
  },
  addBox: {
    position: "relative",
    borderRadius: 20,
    backgroundColor: "#D6D6D6",
    paddingTop: "112%",
    width: "100%",
  },
  addBtnContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
  },
  addBtn: {
    width: "100%",
    borderRadius: "50%",
    paddingTop: "100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    backgroundImage: `url(${encodedUrlWithParentheses(addBg.src)})`,
    cursor: "pointer",
  },
  dragging: {
    opacity: 0,
  },
  sortContainer: {
    marginBottom: "20px",
    background: theme.palette.mode === "dark" ? "#212b36" : "white",
    borderRadius: "16px",
    cursor: "pointer",
  },
  sortItems: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
  },
  sortItemsInner: {
    display: "flex",
    padding: "10px",
  },
}));

export interface EditableCarouselListProps {
  onItemOrderChange?: (items: Item[]) => void;
  items?: Item[];
  onItemClick?: (item: Item) => void;
  onCreateItemClick?: ButtonBaseProps["onClick"];
  onDeleteItemClick?: (item: Item) => void;
  hideCreateItem?: boolean;
  openSortModel?: boolean;
  setSortedList?: any;
}

const EditableCarouselList: FC<EditableCarouselListProps> = function (props) {
  const {
    items: itemsProp,
    onCreateItemClick,
    hideCreateItem,
    openSortModel,
    setSortedList,
  } = props;
  const classes = useStyles();
  const { items, handleMoveItem } = useDragItem("ids.primaryId", itemsProp);

  useEffect(() => {
    setSortedList(items);
  }, [items, setSortedList]);
  return (
    <Grid spacing={2}>
      {items?.map((el) => (
        <DragItem
          key={el.ids.primaryId}
          id={el.ids.primaryId as string}
          onMoveItem={handleMoveItem}
          // onDropItem={handleDropItem}
          type="IMG"
        >
          {({ ref }, { isDragging }) => (
            <Grid item xs={12} lg={12}>
              <div
                ref={ref}
                className={clsx(classes.sortContainer, {
                  [classes.dragging]: isDragging,
                })}
              >
                <div className={classes.sortItems}>
                  <div className={classes.sortItemsInner}>
                    <Avatar
                      sx={{ marginRight: 2, height: 64, width: 64 }}
                      variant="rounded"
                      alt="Remy Sharp"
                      src={el.imgSrc?.desktop || el.imgSrc?.normal}
                    />
                    <div>
                      <h4 style={{ margin: 0 }}>{el.title}</h4>
                      <div>{el.description}</div>
                    </div>
                  </div>
                  <Image alt="arrowUp" src={arrowUp} />
                </div>
              </div>
            </Grid>
          )}
        </DragItem>
      ))}
      {!hideCreateItem && !openSortModel && (
        <Grid item xs={4} lg={2}>
          <div className={classes.addBox}>
            <div className={classes.addBtnContainer}>
              <ButtonBase
                className={classes.addBtn}
                onClick={onCreateItemClick}
              />
            </div>
          </div>
        </Grid>
      )}
    </Grid>
  );
};

export default EditableCarouselList;
