import React, { FC } from "react";

import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import { ColumnTable } from "interfaces/utils";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import DragItem, { OnDropItem, useDragItem } from "components/DragItem";

import List from "@eGroupAI/material/List";
import ListItem from "@eGroupAI/material/ListItem";
import ListItemText from "@eGroupAI/material/ListItemText";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { OrganizationColumn } from "interfaces/entities";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const useStyles = makeStyles(() => ({
  dragging: {
    opacity: 0,
  },
}));

export interface EditableDynamicColumnListProps {
  columnTable: ColumnTable;
  onItemOrderChange?: (items: OrganizationColumn[]) => void;
}

const EditableDynamicColumnList: FC<EditableDynamicColumnListProps> = function (
  props
) {
  const wordLibrary = useSelector(getWordLibrary);
  const { columnTable, onItemOrderChange } = props;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const { data } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable,
    }
  );
  const { items, itemsRef, handleMoveItem } = useDragItem(
    "columnId",
    data?.source
  );

  const handleDropItem: OnDropItem = () => {
    if (onItemOrderChange) {
      onItemOrderChange(itemsRef.current);
    }
  };

  return (
    <List>
      {items?.map((el) => (
        <DragItem
          key={el.columnId}
          id={el.columnId}
          onMoveItem={handleMoveItem}
          onDropItem={handleDropItem}
          type="column"
        >
          {({ ref }, { isDragging }) => (
            <ListItem
              ref={ref}
              className={clsx({
                [classes.dragging]: isDragging,
              })}
            >
              <ListItemIcon sx={{ cursor: "pointer" }}>
                <DragIndicatorIcon />
              </ListItemIcon>
              <ListItemText
                primary={wordLibrary?.[el.columnName] ?? el.columnName}
              />
            </ListItem>
          )}
        </DragItem>
      ))}
    </List>
  );
};

export default EditableDynamicColumnList;
