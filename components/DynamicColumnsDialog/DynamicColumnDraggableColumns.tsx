import React, { useState, useEffect } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";

import { useSelector } from "react-redux";
import { OrganizationColumn } from "interfaces/entities";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

import ListItem from "@eGroupAI/material/ListItem";
import ListItemText from "@eGroupAI/material/ListItemText";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { StyledComponentProps } from "@mui/material";
import styled from "@emotion/styled";

const Container = styled.div<
  StyledComponentProps & { isDraggingOver: boolean }
>`
  padding: 8px 16px;
`;

export interface DynamicColumnDraggableColumnsProps {
  groupKey: string;
  defaultItems: OrganizationColumn[];
  onItemOrderChange?: (groupKey: string, items: OrganizationColumn[]) => void;
}

const useStyles = makeStyles(() => ({
  dragging: {
    opacity: 1,
  },
}));

export default function DynamicColumnDraggableColumns(
  props: DynamicColumnDraggableColumnsProps
) {
  const classes = useStyles();
  const wordLibrary = useSelector(getWordLibrary);
  const { groupKey, defaultItems } = props;

  const [items, setItems] = useState<OrganizationColumn[]>(defaultItems || []);

  useEffect(() => {
    if (defaultItems) setItems(defaultItems);
  }, [defaultItems]);

  return (
    <Droppable droppableId={`columns-in-${groupKey}`} type="column">
      {(provided, snapshot) => (
        <Container
          ref={provided.innerRef}
          {...provided.droppableProps}
          isDraggingOver={snapshot.isDraggingOver}
        >
          {items?.map((item, index) => (
            <Draggable
              draggableId={`${index}-${item.columnId}`}
              index={index}
              key={item.columnId}
            >
              {(provided, snapshot) => (
                <ListItem
                  ref={provided.innerRef}
                  className={clsx({
                    [classes.dragging]: snapshot.isDragging,
                  })}
                  sx={{
                    opacity: snapshot.isDragging ? 0.5 : 1,
                  }}
                  {...provided.draggableProps}
                >
                  <ListItemIcon {...provided.dragHandleProps}>
                    <DragIndicatorIcon
                      fontSize={"small"}
                      sx={{
                        opacity: snapshot.isDragging ? 0.5 : 1,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={wordLibrary?.[item.columnName] ?? item.columnName}
                    sx={{
                      opacity: snapshot.isDragging ? 0.5 : 1,
                    }}
                  />
                </ListItem>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Container>
      )}
    </Droppable>
  );
}
