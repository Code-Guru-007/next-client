import React, { FC } from "react";
import DatePicker from "components/DatePicker";

export interface ShareEditDatePickerProps {
  name?: string;
  label: string;
  value: string | null;
  handleChange: (dateString: string) => void;
}

const ShareEditDatePicker: FC<ShareEditDatePickerProps> = (props) => {
  const { label, value, handleChange } = props;

  return (
    <DatePicker
      isTime
      label={label}
      value={value ? new Date(value) : null}
      onChange={(date) => {
        if (date) {
          handleChange(date.toISOString());
        }
      }}
      required
      minDate={new Date(new Date().setHours(0, 0, 0, 0))}
    />
  );
};

export default React.memo(ShareEditDatePicker, (prev, next) => {
  if (prev.value === next.value) return true;
  return false;
});
