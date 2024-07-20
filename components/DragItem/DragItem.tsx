import { ReactElement, FC, memo, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  DragRefs,
  DragItemState,
  Item,
  OnDropItem,
  OnMoveItem,
} from "./typings";

export interface DragItemProps {
  id: string;
  onMoveItem?: OnMoveItem;
  onDropItem?: OnDropItem;
  children: (refs: DragRefs, state: DragItemState) => ReactElement | null;
  type: string;
  canDrag?: boolean;
}

const DragItem: FC<DragItemProps> = function ({
  id,
  onMoveItem,
  onDropItem,
  children,
  type,
  canDrag = true,
}) {
  const ref = useRef(null);
  const previewRef = useRef(null);

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag,
  }));

  const [{ canDrop, isOver }, drop] = useDrop<
    Item,
    void,
    {
      canDrop: boolean;
      isOver: boolean;
    }
  >(() => ({
    accept: type,
    hover: (item) => {
      if (item.id !== id && onMoveItem) {
        onMoveItem(item.id, id);
      }
    },
    drop: (item) => {
      if (onDropItem) {
        onDropItem(item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  drag(ref);
  dragPreview(previewRef);
  drop(ref);

  return children(
    {
      ref,
      previewRef,
    },
    {
      isDragging,
      canDrop,
      isOver,
    }
  );
};

export default memo(DragItem);
