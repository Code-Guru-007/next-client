// eslint-disable-next-line import/no-duplicates
import zhCN from "date-fns/locale/zh-CN";
// eslint-disable-next-line import/no-duplicates
import { format, getTime, formatDistanceToNow } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || "dd MMM yyyy";

  return date ? format(new Date(date), fm) : "";
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || "dd MMM yyyy p";

  return date ? format(new Date(date), fm) : "";
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : "";
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : "";
}

export function fZonedDateTime(date: InputValue) {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  return date
    ? format(zonedTimeToUtc(new Date(date), timeZone), "PP pp", {
        locale: zhCN,
      })
    : "";
}
