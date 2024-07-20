export default function getArrayRemovedItems(
  source?: string[],
  compare?: string[]
) {
  return source?.filter((el) => compare?.indexOf(el) === -1);
}
