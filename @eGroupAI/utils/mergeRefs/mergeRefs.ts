import { LegacyRef, MutableRefObject, RefCallback } from "react";

type Ref<T> = MutableRefObject<T> | LegacyRef<T>;

/**
 * Merge Reactjs Refs.
 * @param refs
 * @returns
 */
export default function mergeRefs<T = any>(refs: Ref<T>[]): RefCallback<T> {
  return (value) => {
    refs.forEach((r) => {
      const ref = r;
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}
