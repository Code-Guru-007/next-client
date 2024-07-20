export default function getLocalStorageItemsWithPrefix(prefix: string) {
  const localStorageKeys = Object.keys(localStorage);
  const keysWithPrefix = localStorageKeys.filter((key) =>
    key.startsWith(prefix)
  );
  const items = keysWithPrefix.map((key) => ({
    key,
    value: localStorage.getItem(key),
  }));
  return items;
}
