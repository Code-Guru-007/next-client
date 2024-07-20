import { MutableRefObject } from "react";

export type OnMoveItem = (sourceId: string, destinationId: string) => void;

export type OnDropItem = (item: Item) => void;

export type DragRefs = {
  ref: MutableRefObject<null>;
  previewRef: MutableRefObject<null>;
};
export type DragItemState = {
  isDragging: boolean;
  isOver: boolean;
  canDrop: boolean;
};

export type Item = {
  id: string;
};
