import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import { OrganizationColumn } from "interfaces/entities";
import { ColumnTable } from "interfaces/utils";

import clsx from "clsx";
import styled from "@emotion/styled";
import { makeStyles } from "@mui/styles";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import { Box, CircularProgress, StyledComponentProps } from "@mui/material";
import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";

import { SNACKBAR } from "components/App";
import { DIALOG as CONFIRM_DIALOG } from "components/ConfirmDialog";

import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";

import DynamicColumnDraggableGroup from "./DynamicColumnDraggableGroup";

const Container = styled.div<
  StyledComponentProps & { isDraggingOver: boolean }
>`
  padding: 8px 16px;
  poistion: relative;
`;

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  showLoader: {
    display: "flex",
  },
}));

export interface DynamicColumnDragDropProps {
  defaultItems: OrganizationColumn[];
  organizationId: string;
  columnTable: ColumnTable;
  onItemOrderChange?: (items: OrganizationColumn[]) => void;
  dialogIsOpen: boolean;
}

function moveArrayElement<T>(
  arr: T[],
  sourceIndex: number,
  destinationIndex: number
): T[] {
  const result = [...arr]; // Make a copy of the array to avoid mutating the original
  const [removed] = result.splice(sourceIndex, 1); // Remove the element from the source index
  result.splice(destinationIndex, 0, removed as T); // Insert the element at the destination index
  return result;
}

export default function DynamicColumnDragDrop(
  props: DynamicColumnDragDropProps
) {
  const {
    defaultItems,
    organizationId,
    columnTable,
    onItemOrderChange,
    dialogIsOpen,
  } = props;
  const classes = useStyles();

  const { openSnackbar } = useReduxSnackbar<SnackbarProps>(SNACKBAR);
  const { openDialog: openConfirmDialog, closeDialog: closeConfirmDialog } =
    useReduxDialog(CONFIRM_DIALOG);
  const { excute: updateOrgDynamicColumn, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgDynamicColumn);

  const [isDraggingGroup, setIsDraggingGroup] = useState<boolean>(false);
  const [initialGroupByGroup, setInitialGroupByGroup] = useState({});

  useEffect(() => {
    setInitialGroupByGroup(getOrgColumnGroupByGroup(defaultItems));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogIsOpen]);

  const [initialGroupInfo, setInitialGroupInfo] = useState<{
    [key: string]: { groupKey: string; groupName: string };
  }>({});
  const [allItems, setAllItems] = useState<OrganizationColumn[]>(
    defaultItems || []
  );
  const [orderedItems, setorderedItems] = useState<OrganizationColumn[]>(
    defaultItems || []
  );

  useEffect(() => {
    if (defaultItems) {
      setAllItems(defaultItems);
    }
  }, [defaultItems]);

  useEffect(() => {
    setInitialGroupInfo(
      Object.keys(initialGroupByGroup).reduce((a, key) => {
        if (key === "none")
          return { ...a, none: { groupKey: key, groupName: "無群組欄位" } };

        return {
          ...a,
          [key]: {
            groupKey: key,
            groupName:
              initialGroupByGroup[key][0].organizationColumnGroup
                ?.columnGroupName,
          },
        };
      }, {})
    );
  }, [initialGroupByGroup]);

  const columnsGroupByGroup = useMemo(
    () => getOrgColumnGroupByGroup(allItems),
    [allItems]
  );

  const [groupOrder, setGroupOrder] = useState<string[]>(
    Object.keys(columnsGroupByGroup)
  );

  const [orderedColumnsGroupByGroup] = useState(columnsGroupByGroup);

  const hasNoneGroup = useMemo(() => groupOrder.includes("none"), [groupOrder]);

  function handleDropItem(result) {
    setIsDraggingGroup(false);
    const { type, destination, source } = result;
    let destinationIndex = destination.index;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Group movement to over the none group
    if (type === "group" && hasNoneGroup && destination.index === 0) {
      destinationIndex = 1;
      openSnackbar({
        message:
          "Can't move the group to above the first none group, so it moved to second, thanks.",
        severity: "warning",
      });
    }
    // Group movement exchange
    else if (type === "group") {
      const newGroupOrder = moveArrayElement(
        groupOrder,
        source.index,
        destinationIndex
      );
      setGroupOrder(newGroupOrder);
    }
    // Column movement within same group
    else if (
      type === "column" &&
      destination.droppableId === source.droppableId
    ) {
      const destinationGroupKeyArr = destination.droppableId.split("-");
      const groupKey =
        destinationGroupKeyArr[destinationGroupKeyArr.length - 1];

      const [movedItem] = orderedColumnsGroupByGroup[groupKey].splice(
        result.source.index,
        1
      );
      orderedColumnsGroupByGroup[groupKey].splice(
        result.destination.index,
        0,
        movedItem
      );
      handleUpdateAllColumnList();
    }
    // Column movement between groups
    else if (
      type === "column" &&
      destination.droppableId !== source.droppableId
    ) {
      // temporary movement
      const sourceGroupKeyArr = source.droppableId.split("-");
      const src_groupKey = sourceGroupKeyArr[sourceGroupKeyArr.length - 1];
      const srcGroupInfo = orderedColumnsGroupByGroup[src_groupKey][0];
      const [movedItem] = orderedColumnsGroupByGroup[src_groupKey].splice(
        result.source.index,
        1
      );

      const destinationGroupKeyArr = destination.droppableId.split("-");
      const dest_groupKey =
        destinationGroupKeyArr[destinationGroupKeyArr.length - 1];
      const destGroupInfo = orderedColumnsGroupByGroup[dest_groupKey][0];
      orderedColumnsGroupByGroup[dest_groupKey].splice(
        result.destination.index,
        0,
        {
          ...movedItem,
          organizationColumnGroup:
            dest_groupKey === "none"
              ? undefined
              : {
                  columnGroupId: destGroupInfo
                    ? destGroupInfo.organizationColumnGroup?.columnGroupId
                    : initialGroupInfo[dest_groupKey]?.groupKey,
                  columnGroupName: destGroupInfo
                    ? destGroupInfo.organizationColumnGroup.columnGroupName
                    : initialGroupInfo[dest_groupKey]?.groupName,
                },
        }
      );
      // temporary movement

      openConfirmDialog({
        primary: `Do you want to move the column from "${
          srcGroupInfo.organizationColumnGroup?.columnGroupName || "無群組欄位"
        }" to "${
          destGroupInfo
            ? destGroupInfo.organizationColumnGroup?.columnGroupName ||
              "無群組欄位"
            : initialGroupInfo[dest_groupKey]?.groupName
        }"?`,
        onConfirm: async () => {
          closeConfirmDialog();
          try {
            updateOrgDynamicColumn({
              organizationId,
              columnTable,
              organizationColumnList: [
                {
                  ...movedItem,
                  organizationColumnGroup:
                    dest_groupKey === "none"
                      ? undefined
                      : {
                          columnGroupId: destGroupInfo
                            ? destGroupInfo.organizationColumnGroup
                                .columnGroupId
                            : initialGroupInfo[dest_groupKey]?.groupKey,
                          columnGroupName: destGroupInfo
                            ? destGroupInfo.organizationColumnGroup
                                .columnGroupName
                            : initialGroupInfo[dest_groupKey]?.groupName,
                        },
                },
              ],
            })
              .then(() => {
                handleUpdateAllColumnList();
              })
              .catch(() => {
                // backup movement
                const [backedItem] = orderedColumnsGroupByGroup[
                  dest_groupKey
                ].splice(result.destination.index, 1);
                orderedColumnsGroupByGroup[src_groupKey].splice(
                  result.source.index,
                  0,
                  {
                    ...backedItem,
                    organizationColumnGroup:
                      src_groupKey === "none"
                        ? undefined
                        : {
                            columnGroupId:
                              srcGroupInfo.organizationColumnGroup
                                .columnGroupId,
                            columnGroupName:
                              srcGroupInfo.organizationColumnGroup
                                .columnGroupName,
                          },
                  }
                );
              });
          } catch (e) {
            // backup movement
            const [backedItem] = orderedColumnsGroupByGroup[
              dest_groupKey
            ].splice(result.destination.index, 1);
            orderedColumnsGroupByGroup[src_groupKey].splice(
              result.source.index,
              0,
              {
                ...backedItem,
                organizationColumnGroup:
                  src_groupKey === "none"
                    ? undefined
                    : {
                        columnGroupId:
                          srcGroupInfo.organizationColumnGroup.columnGroupId,
                        columnGroupName:
                          srcGroupInfo.organizationColumnGroup.columnGroupName,
                      },
              }
            );
            apis.tools.createLog({
              function: "Dynamic Column Update",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: e,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        },
        onCancel: () => {
          // backup movement
          const [backedItem] = orderedColumnsGroupByGroup[dest_groupKey].splice(
            result.destination.index,
            1
          );
          orderedColumnsGroupByGroup[src_groupKey].splice(
            result.source.index,
            0,
            {
              ...backedItem,
              organizationColumnGroup:
                src_groupKey === "none"
                  ? undefined
                  : {
                      columnGroupId:
                        srcGroupInfo.organizationColumnGroup.columnGroupId,
                      columnGroupName:
                        srcGroupInfo.organizationColumnGroup.columnGroupName,
                    },
            }
          );
        },
      });
    }
  }

  const handleUpdateAllColumnList = useCallback(() => {
    const newAllItems = groupOrder.reduce<OrganizationColumn[]>(
      (a, b) => [...a, ...orderedColumnsGroupByGroup[b]],
      []
    );
    setorderedItems(newAllItems);
  }, [groupOrder, orderedColumnsGroupByGroup]);

  useEffect(() => {
    handleUpdateAllColumnList();
  }, [groupOrder, handleUpdateAllColumnList]);

  useEffect(() => {
    if (onItemOrderChange) onItemOrderChange(orderedItems);
  }, [onItemOrderChange, orderedItems]);

  return (
    <DragDropContext
      onDragStart={() => {
        setIsDraggingGroup(true);
      }}
      // eslint-disable-next-line react/jsx-no-bind
      onDragEnd={handleDropItem}
    >
      <Droppable droppableId="groups-all" type="group">
        {(provided, snapshot) => (
          <Container
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            <Box
              className={clsx(classes.loader, isUpdating && classes.showLoader)}
            >
              <CircularProgress />
            </Box>
            {groupOrder.map((groupKey, index) => (
              <DynamicColumnDraggableGroup
                key={groupKey}
                groupKey={groupKey}
                index={index}
                initialGroupInfo={initialGroupInfo[groupKey]}
                onItemOrderChange={handleUpdateAllColumnList}
                defaultItems={orderedColumnsGroupByGroup[groupKey]}
                isDraggingGroup={isDraggingGroup}
              />
            ))}
            {provided.placeholder}
          </Container>
        )}
      </Droppable>
    </DragDropContext>
  );
}
