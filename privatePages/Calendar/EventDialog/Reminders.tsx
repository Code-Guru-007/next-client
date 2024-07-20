import React from "react";

import { makeStyles } from "@mui/styles";
import { ScheduleEventFormInput } from "interfaces/form";
import { useFieldArray, Controller, useFormContext } from "react-hook-form";

import IconButton from "@mui/material/IconButton";
import TextField from "@eGroupAI/material/TextField";
import MenuItem from "@eGroupAI/material/MenuItem";
import Button from "@eGroupAI/material/Button";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import Iconify from "minimal/components/iconify/iconify";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  select: {
    "& .MuiSelect-select": {
      padding: "8px 16px 9px 16px",
    },
  },
}));

const Reminders = () => {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const { control } = useFormContext<ScheduleEventFormInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "reminders",
  });

  const handleAppendItem = () => {
    append({
      method: "popup",
      minutes: 30,
      granularity: "minutes",
    });
  };

  return (
    <div className={classes.root}>
      {fields.map((el, index) => (
        <div key={el.id} className={classes.row}>
          <div>
            <Controller
              control={control}
              name={`reminders.${index}.method`}
              render={({ field: { onChange, value } }) => (
                <TextField
                  className={classes.select}
                  size="small"
                  value={value}
                  onChange={onChange}
                  select
                >
                  <MenuItem value="popup">
                    {wordLibrary?.notification ?? "通知"}
                  </MenuItem>
                  <MenuItem value="email">
                    {wordLibrary?.["send email"] ?? "發送Email"}
                  </MenuItem>
                </TextField>
              )}
            />
          </div>
          <div>
            <Controller
              control={control}
              name={`reminders.${index}.minutes`}
              render={({ field: { onChange, value } }) => (
                <TextField
                  size="small"
                  type="number"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </div>
          <div>
            <Controller
              control={control}
              name={`reminders.${index}.granularity`}
              render={({ field: { onChange, value } }) => (
                <TextField
                  className={classes.select}
                  size="small"
                  value={value}
                  onChange={onChange}
                  select
                >
                  <MenuItem value="minutes">
                    {wordLibrary?.minutes ?? "分鐘"}
                  </MenuItem>
                  {/* <MenuItem value="hours">小時</MenuItem>
                  <MenuItem value="days">天</MenuItem>
                  <MenuItem value="weeks">週</MenuItem> */}
                </TextField>
              )}
            />
          </div>
          <div>
            <IconButton
              onClick={() => {
                remove(index);
              }}
            >
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </div>
        </div>
      ))}
      <div>
        <Button variant="contained" color="primary" onClick={handleAppendItem}>
          {wordLibrary?.["add notification"] ?? "新增通知"}
        </Button>
      </div>
    </div>
  );
};

export default Reminders;
