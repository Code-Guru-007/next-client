import useOnValueChange from "@eGroupAI/hooks/useOnValueChange";
import useStateRef from "@eGroupAI/hooks/useStateRef";
import findDeepValue from "@eGroupAI/utils/findDeepValue";
import { OnMoveItem } from "./typings";

function moveElement<Item>(array: Item[], index: number, offset: number) {
  let startIndex = index + offset;
  if (startIndex >= array.length) {
    startIndex = array.length - 1;
  }
  array.splice(startIndex, 0, array.splice(index, 1)[0] as Item);
  return array;
}

const useDragItem = <Item>(idPath: string, itemsProp?: Item[]) => {
  const [items, setItems, itemsRef] = useStateRef<Item[]>([]);

  useOnValueChange(itemsProp, (value) => {
    if (value) {
      setItems(value);
    }
  });

  const handleMoveItem: OnMoveItem = (sourceId, destinationId) => {
    const sourceIndex = itemsRef.current.findIndex(
      (item) => findDeepValue(item, idPath) === sourceId
    );
    const destinationIndex = itemsRef.current.findIndex(
      (item) => findDeepValue(item, idPath) === destinationId
    );

    // If source/destination is unknown, do nothing.
    if (sourceIndex === -1 || destinationIndex === -1) {
      return;
    }

    const offset = destinationIndex - sourceIndex;
    setItems(moveElement([...itemsRef.current], sourceIndex, offset));
  };

  return {
    handleMoveItem,
    items,
    setItems,
    itemsRef,
  };
};

export default useDragItem;
