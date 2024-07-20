export const DISPLAY_NAMES = {
  TODAY: { en: "Today", zh: "今天" },
  WEEK: { en: "Weekly", zh: "周" },
  DAY: { en: "Day", zh: "日" },
  MONTH: { en: "Month", zh: "月" },
  CALENDARS: { en: "Calendars", zh: "行事曆" },
  TOOGLE_CALENDAR: { en: "Calendars", zh: "行事曆" },
  CREATE_CALENDAR: { en: "New Calendar", zh: "新增行事曆" },
  CREATE: { en: "Create", zh: "新增" },
  CLOSE: { en: "Close", zh: "關閉" },
  MILESTONE: { en: "Milestone", zh: "里程碑" },
  TASK: { en: "Task", zh: "待辦事項" },
  EVENT: { en: "Event", zh: "行程" },
  ALL_DAY_EVENT: { en: "All Day", zh: "全日行程" },
  IS_ALL_DAY: { en: "All Day", zh: "全日" },
  TITLE: { en: "Title", zh: "標題" },
  LOCATION: { en: "Location", zh: "地點" },
  START_DATE: { en: "Start Date", zh: "開始日期" },
  END_DATE: { en: "End Date", zh: "結束日期" },
  SAVE: { en: "Save", zh: "儲存" },
  EDIT: { en: "Edit", zh: "編輯" },
  UPDATE: { en: "Update", zh: "更新" },
  DELETE: { en: "Delete", zh: "刪除" },
  CANCEL: { en: "Cancel", zh: "取消" },
  SUCCESS: { en: "Success", zh: "成功" },
  ERROR: { en: "Error", zh: "錯誤" },
  FREE: { en: "Available", zh: "有空" },
  BUSY: { en: "Busy", zh: "忙碌" },
};

export const DAY_NAMES = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  zh: ["日", "一", "二", "三", "四", "五", "六"],
};

export const CALENDAR_LOCALE = {
  // Core
  setText: "確定",
  cancelText: "取消",
  clearText: "刪除",
  selectedText: "{count} 選擇",
  // Datetime component
  dateFormat: "YYYY/MM/DD.",
  dateFormatLong: "YYYY. MM. D DDD",
  dayNames: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"],
  dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
  dayNamesMin: ["日", "一", "二", "三", "四", "五", "六"],
  dayText: "天",
  delimiter: ".",
  hourText: "小時",
  minuteText: "分鐘",
  monthNames: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  monthNamesShort: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  monthText: "月",
  secText: "秒",
  timeFormat: "H:mm",
  yearText: "年",
  nowText: "現在",
  pmText: "下午",
  amText: "上午",
  // Calendar component
  dateText: "日期",
  timeText: "時間",
  todayText: "今天",
  prevMonthText: "上個月",
  nextMonthText: "下個月",
  prevYearText: "去年",
  nextYearText: "明年",
  closeText: "關閉",
  eventText: "活動",
  eventsText: "活動",
  allDayText: "全天",
  noEventsText: "沒有活動",
  moreEventsText: "還有 {count} 個",
};

export const getLocalDateString = (dateVal: string) => {
  if (dateVal === "") {
    return "";
  }
  const res = new Date(dateVal);
  res.setHours(res.getHours() + 8);
  return `${res.getFullYear()}-${`${res.getMonth() + 1}`.padStart(
    2,
    "0"
  )}-${`${res.getDate()}`.padStart(2, "0")}T${`${res.getHours()}`.padStart(
    2,
    "0"
  )}:${`${res.getMinutes()}`.padStart(2, "0")}`;
};
