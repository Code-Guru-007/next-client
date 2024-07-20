export type GroupByReturnedValue<TItem> = {
  [key in string | number]: TItem[];
};

/**
 * Group array to object by key.
 * @param xs
 * @param key
 * @returns
 */
export default function groupBy<TItem>(
  xs: TItem[],
  key: string | ((item: TItem) => string | number)
): GroupByReturnedValue<TItem> {
  return xs.reduce((rv, x) => {
    const v = key instanceof Function ? key(x) : x[key];
    // Not use copy for better performance
    const value = { ...rv };
    (value[v] = value[v] || []).push(x);
    return value;
  }, {});
}
