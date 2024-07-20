import React, { FC, useRef, useCallback } from "react";

import { format } from "@eGroupAI/utils/dateUtils";
import NewDateRangePicker, {
  NewDateRangePickerProps,
} from "@eGroupAI/material-lab/NewDateRangePicker";
import { DateRange } from "@eGroupAI/material-lab/DateRangePicker/types";

const FilterOptionDateTimeRangePicker: FC<NewDateRangePickerProps> = (
  props
) => {
  const {
    name,
    setFilterOptionsTempValue,
    onChange: onChangeProp,
    ...others
  } = props;
  const from = useRef<HTMLInputElement>(null);
  const to = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (dateRange: DateRange) => {
      const fromDate = dateRange[0];
      const toDate = dateRange[1];
      if (typeof fromDate === "undefined") {
        if (from.current) from.current.value = "";
      }
      if (typeof toDate === "undefined") {
        if (to.current) to.current.value = "";
      }
      if (typeof fromDate === "object" && typeof toDate === "object") {
        if (others.showTime) {
          if (from.current)
            from.current.value = new Date(
              format(fromDate, "yyyy-MM-dd HH:mm") as string
            ).toISOString();
          if (to.current)
            to.current.value = new Date(
              format(toDate, "yyyy-MM-dd HH:mm") as string
            ).toISOString();
        } else {
          if (from.current)
            from.current.value = format(fromDate, "yyyy-MM-dd") as string;
          if (to.current)
            to.current.value = format(toDate, "yyyy-MM-dd") as string;
        }
      }
      if (setFilterOptionsTempValue)
        setFilterOptionsTempValue((prev) => ({
          ...prev,
          [name as string]: [
            (fromDate as Date) || null,
            (toDate as Date) || null,
          ],
        }));

      if (onChangeProp) onChangeProp(dateRange);
    },
    [onChangeProp, setFilterOptionsTempValue, others.showTime, name]
  );

  return (
    <>
      <NewDateRangePicker
        {...others}
        startDate={others.defaultStartDate}
        endDate={others.defaultEndDate}
        startTime={others.defaultStartTime}
        endTime={others.defaultEndTime}
        onChange={handleChange}
      />
      <input ref={from} name={name} style={{ display: "none" }} />
      <input ref={to} name={name} style={{ display: "none" }} />
    </>
  );
};

export default FilterOptionDateTimeRangePicker;
