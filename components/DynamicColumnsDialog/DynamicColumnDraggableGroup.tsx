import React, { useState, useEffect } from "react";
import { Draggable } from "react-beautiful-dnd";

import { OrganizationColumn } from "interfaces/entities";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Box, Card, CardHeader, Stack } from "@mui/material";
import DynamicColumnDraggableColumns from "./DynamicColumnDraggableColumns";

export interface DynamicColumnDraggableGroupProps {
  groupKey: string;
  index: number;
  initialGroupInfo?: {
    groupKey: string;
    groupName: string;
  };
  defaultItems: OrganizationColumn[];
  onItemOrderChange?: (groupKey: string, items: OrganizationColumn[]) => void;
  isDraggingGroup?: boolean;
}

export default function DynamicColumnDraggableGroup(
  props: DynamicColumnDraggableGroupProps
) {
  const { groupKey, index, initialGroupInfo, defaultItems = [] } = props;

  const [items, setItems] = useState<OrganizationColumn[]>(defaultItems || []);

  useEffect(() => {
    if (defaultItems) setItems(defaultItems);
  }, [defaultItems]);

  return (
    <Draggable
      draggableId={groupKey}
      index={index}
      isDragDisabled={groupKey === "none"}
    >
      {(provided, snapshot) => (
        <Card
          sx={{
            width: "100%",
            my: 2,
            transition: "height 2s ease",
            opacity: snapshot.isDragging ? 0.5 : 1,
            zIndex: "unset",
          }}
          key={groupKey}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {groupKey !== "none" && (
            <Stack direction="row">
              <Box
                {...provided.dragHandleProps}
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <DragIndicatorIcon fontSize="large" sx={{ ml: 1.5 }} />
              </Box>
              <CardHeader title={initialGroupInfo?.groupName} />
            </Stack>
          )}
          {groupKey === "none" && (
            <Stack direction="row">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <DragIndicatorIcon
                  fontSize="large"
                  sx={{ ml: 1.5, visibility: "hidden" }}
                />
              </Box>
              <CardHeader title={initialGroupInfo?.groupName} />
            </Stack>
          )}
          <DynamicColumnDraggableColumns
            defaultItems={items}
            groupKey={groupKey}
          />
        </Card>
      )}
    </Draggable>
  );
}
