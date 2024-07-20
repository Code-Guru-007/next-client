export default function spliceIntoArrays<T>(arr: T[], deleteCount: number) {
  const tmp = [...arr];
  const result: T[][] = [];
  while (tmp.length) {
    result.push(tmp.splice(0, deleteCount));
  }
  return result;
}
