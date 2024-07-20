import React, { FC, useEffect } from "react";
import moment from "moment-timezone";

import { FormProvider, useForm, Controller } from "react-hook-form";
import { CreateOrgCalendarFormInput } from "interfaces/form";
import { useSelector } from "react-redux";

import Grid from "@eGroupAI/material/Grid";
import MenuItem from "@eGroupAI/material/MenuItem";
import TextField from "@eGroupAI/material/TextField";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Form from "components/Form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { OrganizationColumn } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

export const FORM = "CalendarForm";

export interface CalendarFormProps {
  onSubmit: (values: CreateOrgCalendarFormInput) => void;
  column?: OrganizationColumn;
  defaultValues?: CreateOrgCalendarFormInput;
  setFormIsDirty?: SetFormIsDirty;
}

const CalendarForm: FC<CalendarFormProps> = function (props) {
  const { defaultValues, onSubmit, setFormIsDirty } = props;
  const wordLibrary = useSelector(getWordLibrary);
  const methods = useForm<CreateOrgCalendarFormInput>({
    defaultValues: {
      organizationCalendarName: "",
      organizationCalendarBackgroundColor: "#000000",
      organizationCalendarTimeZone: moment.tz.guess(),
      organizationCalendarServiceModuleValue: ServiceModuleValue.EVENT,
      organizationCalendarStartDateColumnType: "CREATE",
      organizationCalendarEndDateColumnType: "CREATE",
    },
  });
  const options: string[] = moment.tz.names();
  const { handleSubmit, reset, formState, control } = methods;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  return (
    <FormProvider {...methods}>
      <Form id={FORM} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationCalendarName"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="日曆名稱"
                  fullWidth
                  onChange={onChange}
                  value={value}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationCalendarBackgroundColor"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="日曆顏色"
                  fullWidth
                  onChange={onChange}
                  value={value}
                  inputProps={{
                    type: "color",
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationCalendarTimeZone"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="時區"
                  fullWidth
                  onChange={onChange}
                  value={value}
                  select
                >
                  {options?.map((timezone) => (
                    <MenuItem key={timezone} value={timezone}>
                      {timezone}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationCalendarServiceModuleValue"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label={wordLibrary?.type ?? "類型"}
                  fullWidth
                  onChange={onChange}
                  value={value}
                  select
                >
                  <MenuItem value={ServiceModuleValue.EVENT}>事件</MenuItem>
                  <MenuItem value={ServiceModuleValue.BULLETIN}>
                    佈告欄
                  </MenuItem>
                  <MenuItem value={ServiceModuleValue.ARTICLE}>文章</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationCalendarStartDateColumnType"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="設定於日曆活動的開始時間"
                  fullWidth
                  onChange={onChange}
                  value={value}
                  select
                >
                  <MenuItem value="CREATE">
                    {wordLibrary?.["creation time"] ?? "建立時間"}
                  </MenuItem>
                  <MenuItem value="UPDATE">
                    {wordLibrary?.["update time"] ?? "更新時間"}
                  </MenuItem>
                  <MenuItem value="START">開始時間</MenuItem>
                  <MenuItem value="END">結束時間</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller
              control={control}
              name="organizationCalendarEndDateColumnType"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="設定於日曆活動的結束時間"
                  fullWidth
                  onChange={onChange}
                  value={value}
                  select
                >
                  <MenuItem value="CREATE">
                    {wordLibrary?.["creation time"] ?? "建立時間"}
                  </MenuItem>
                  <MenuItem value="UPDATE">更新時間</MenuItem>
                  <MenuItem value="START">開始時間</MenuItem>
                  <MenuItem value="END">結束時間</MenuItem>
                </TextField>
              )}
            />
          </Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default CalendarForm;
