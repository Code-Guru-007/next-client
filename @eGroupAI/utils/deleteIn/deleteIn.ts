/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * delete value in object
 */
export default function deleteIn(
  obj: Record<string, any> | Record<string, any>[],
  paths: (string | number)[]
) {
  let copy = obj;
  for (let i = 0; i < paths.length; i++) {
    const key = paths[i] as string;

    if (i === paths.length - 1) {
      if (key) {
        delete copy[key];
      }
    } else if (key && copy[key] != null) {
      copy = copy[key];
    } else {
      break;
    }
  }
}
