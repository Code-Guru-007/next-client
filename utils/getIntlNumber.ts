export default function getIntlNumber(value: number | bigint) {
  return Intl.NumberFormat("zh-tw").format(value);
}
