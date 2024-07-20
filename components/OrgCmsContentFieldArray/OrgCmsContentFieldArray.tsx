import React, { FC } from "react";

import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import makeStyles from "@mui/styles/makeStyles";
import { useFormContext } from "react-hook-form";
import {
  CmsContentsFormInput,
  OrganizationCmsContentField,
  OrganizationMediaField,
} from "interfaces/form";

import Grid from "@eGroupAI/material/Grid";
import { ButtonProps } from "@eGroupAI/material/Button";
import encodedUrlWithParentheses from "@eGroupAI/utils/encodedUrlWithParentheses";
import DragItem, { OnDropItem, useDragItem } from "components/DragItem";

import addBg from "../CarouselManagement/add.png";
import OrgCmsContentFieldItem from "./OrgCmsContentFieldItem";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.mode === "dark" ? "#2f3944" : "#F4F6F8",
    padding: "20px",
    borderRadius: "16px",
  },
  item: {
    transition: "all 0.4s",
    opacity: 1,
    width: "100%",
  },
  addBox: {
    position: "relative",
    borderRadius: 20,
    // backgroundColor: "#D6D6D6",
    width: "100%",
    height: "auto",
    padding: 1,
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
  main: {
    position: "relative",
    overflow: "hidden",
    width: "fit-content",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "8px",
  },

  mask: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    display: "none",
  },
  maskShow: {
    display: "flex",
  },
}));
export interface OrgCmsContentFieldArrayProps {
  targetId?: string;
  maxFields?: number;
  onDeleteItemClick?: (
    item: OrganizationMediaField,
    remove: () => void
  ) => void;
  onItemOrderChange?: (items: OrganizationCmsContentField[]) => void;
  onStartSortClick?: ButtonProps["onClick"];
  onEndSortClick?: ButtonProps["onClick"];
  useOneItemAtOnce?: boolean;
  isItemsSortable?: boolean;
}

const OrgCmsContentFieldArray: FC<OrgCmsContentFieldArrayProps> = function (
  props
) {
  const classes = useStyles(props);
  const { isItemsSortable = true } = props;
  const { watch, setValue } = useFormContext<CmsContentsFormInput>();

  const cmsContentList = watch("organizationCmsContentList");

  const { items, itemsRef, handleMoveItem } = useDragItem(
    "organizationCmsContentId",
    cmsContentList
  );
  // const [enableSort, setEnableSort] = useState(true);

  const handleDropItem: OnDropItem = () => {
    setValue("organizationCmsContentList", itemsRef.current);
  };

  // if (enableSort) {
  return (
    <div className={classes.root}>
      <DndProvider backend={HTML5Backend}>
        <Grid container spacing={3}>
          {items?.map((el, index) => (
            <DragItem
              key={String(el.organizationCmsContentId)}
              id={String(el.organizationCmsContentId)}
              onMoveItem={handleMoveItem}
              onDropItem={handleDropItem}
              type="IMG"
              canDrag={isItemsSortable}
            >
              {({ ref }) => (
                <OrgCmsContentFieldItem
                  ref={ref}
                  index={index}
                  item={itemsRef.current[index]}
                />
              )}
            </DragItem>
          ))}
        </Grid>
      </DndProvider>
    </div>
  );
};

export default OrgCmsContentFieldArray;
