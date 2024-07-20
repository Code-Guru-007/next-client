import React, { FC, useCallback, useEffect, useState } from "react";

import { FormProvider, useForm, Controller } from "react-hook-form";
import { ScheduleEventFormInput } from "interfaces/form";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import { ColumnTemplate } from "interfaces/entities";
import { ServiceModuleValue } from "interfaces/utils";

import Box from "@eGroupAI/material/Box";
import Button from "@mui/material/Button";
import Grid from "@eGroupAI/material/Grid";
import Typography from "@eGroupAI/material/Typography";
import TextField from "@eGroupAI/material/TextField";
import MenuItem from "@eGroupAI/material/MenuItem";
import FormHelperText from "@eGroupAI/material/FormHelperText";
import Menu from "@eGroupAI/material/Menu";
import Form from "components/Form";
import { Avatar, InputAdornment } from "@mui/material";

import NewDateRangePicker from "components/NewDateRangePicker";
import FroalaEditor from "components/FroalaEditor";
import Iconify from "minimal/components/iconify/iconify";
import { useBoolean } from "minimal/hooks/use-boolean";

import { toDate, format } from "@eGroupAI/utils/dateUtils";
import { useResponsive } from "minimal/hooks/use-responsive";
import { addDays, endOfDay, startOfDay } from "date-fns";

import RecurrenceContent from "./RecurrenceContent";
import Reminders from "./Reminders";

export const FORM = "EventForm";

export const defaultValues: ScheduleEventFormInput = {
  organizationEventTitle: "",
  organizationEventAddress: "",
  organizationEventStartDate: startOfDay(new Date()).toISOString(),
  organizationEventEndDate: addDays(
    endOfDay(new Date()).setMilliseconds(0),
    1
  ).toISOString(),
  organizationEventDescription: "",
  recurrence: "",
  reminders: [
    {
      method: "popup",
      minutes: 30,
      granularity: "minutes",
    },
  ],
};

export interface EventFormProps {
  onSubmit: (values: ScheduleEventFormInput) => void;
  defaultValues?: ScheduleEventFormInput;
  setFormIsDirty?: SetFormIsDirty;
  selectedTemplate?: ColumnTemplate;
  dynTemplateList?: ColumnTemplate[];
  onChangeDynamicTemplate?: (value?: string) => void;
  RenderDynamicFields?: () => JSX.Element;
}

const EventForm: FC<EventFormProps> = function (props) {
  const {
    defaultValues,
    onSubmit,
    setFormIsDirty,
    selectedTemplate,
    dynTemplateList,
    onChangeDynamicTemplate,
    RenderDynamicFields,
  } = props;
  const methods = useForm<ScheduleEventFormInput>({
    defaultValues,
  });

  const { getValues, reset, formState, control, register, watch, setValue } =
    methods;
  const { errors } = formState;
  const [recOption, setRecOption] = useState<"none" | "custom">("none");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDownmd = useResponsive("down", "md");

  const [eventTitle, setEventTitle] = useState<string>("");
  const eventTitleErr = useBoolean();
  const [eventTitleHelperTxt, setEventTitleHelperTxt] = useState<string>("");

  const [eventEndDateString, setEventEndDateString] = useState<
    string | null | undefined
  >(defaultValues?.organizationEventEndDate);

  const incrementDate = useCallback(
    (startDate) => {
      const increDay: number =
        selectedTemplate?.organizationColumnTemplateEventEndDaysInterval || 1;

      const oneDay = 1000 * 60 * 60 * 24;
      const currentDayInMilli = new Date(startDate).getTime();

      const nextDate = new Date(currentDayInMilli + oneDay * increDay);
      setEventEndDateString(nextDate.toISOString());
      return nextDate.toISOString();
    },
    [selectedTemplate?.organizationColumnTemplateEventEndDaysInterval]
  );

  const handelChangeDynamicTemplate = (e) => {
    if (onChangeDynamicTemplate) {
      onChangeDynamicTemplate(e.target.value);
    }
  };

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      if (defaultValues.recurrence) {
        setRecOption("custom");
      }
    }
  }, [defaultValues, reset]);

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  useEffect(() => {
    setEventEndDateString(
      incrementDate(defaultValues?.organizationEventStartDate)
    );
  }, [incrementDate, defaultValues?.organizationEventStartDate]);

  useEffect(() => {
    if (selectedTemplate) {
      setEventTitle(
        selectedTemplate?.organizationColumnTemplateSubstituteName || ""
      );
      reset((val) => ({
        ...val,
        organizationEventTitle:
          selectedTemplate.organizationColumnTemplateTitle || "",
        organizationEventDescription:
          selectedTemplate?.organizationColumnTemplateDescription || "",
        organizationEventEndDate: eventEndDateString as string,
      }));
    } else {
      setEventTitle("");
      reset((val) => ({
        ...val,
        organizationEventTitle: "",
        organizationEventDescription: "",
        organizationEventEndDate: eventEndDateString as string,
      }));
    }
  }, [eventEndDateString, reset, selectedTemplate]);

  return (
    <FormProvider {...methods}>
      <Grid item xs={12}>
        <TextField
          label="事件範本"
          select
          fullWidth
          onChange={handelChangeDynamicTemplate}
        >
          {dynTemplateList?.map((item) => (
            <MenuItem
              key={item.organizationColumnTemplateId}
              value={item.organizationColumnTemplateId}
            >
              {item.organizationColumnTemplateTitle}
            </MenuItem>
          ))}
          <Button
            variant="text"
            fullWidth
            sx={{ pl: 2, justifyContent: "start" }}
            focusRipple={false}
          >
            清除
          </Button>
        </TextField>
      </Grid>
      <Form
        id={FORM}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(getValues());
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationEventTitle"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="活動標題"
                  placeholder="請輸入活動標題"
                  fullWidth
                  onChange={(e) => {
                    onChange(e);
                    setEventTitle(e.target.value);
                  }}
                  value={value}
                  required
                  error={!eventTitle && eventTitleErr.value}
                  onInvalid={() => {
                    const errorMsg = "";
                    if (!eventTitle) {
                      const errorMsg = "此為必填欄位。";
                      eventTitleErr.onTrue();
                      setEventTitleHelperTxt(errorMsg);
                    } else {
                      eventTitleErr.onFalse();
                      setEventTitleHelperTxt(errorMsg);
                    }
                  }}
                  helperText={!eventTitle && eventTitleHelperTxt}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationEventStartDate"
              render={() => (
                <input
                  type="hidden"
                  {...register("organizationEventStartDate")}
                />
              )}
            />
            <Controller
              control={control}
              name="organizationEventEndDate"
              render={() => (
                <input
                  type="hidden"
                  {...register("organizationEventEndDate")}
                />
              )}
            />

            <NewDateRangePicker
              required
              showTime
              fullWidth={!!isDownmd}
              defaultStartDate={toDate(
                defaultValues?.organizationEventStartDate
              )}
              defaultStartTime={format(
                defaultValues?.organizationEventStartDate,
                "HH:mm"
              )}
              endDate={toDate(eventEndDateString)}
              defaultEndDate={toDate(eventEndDateString)}
              defaultEndTime={format(eventEndDateString, "HH:mm")}
              onChange={(dateRange) => {
                if (dateRange[0]) {
                  setValue(
                    "organizationEventStartDate",
                    dateRange[0].toISOString()
                  );
                }
                if (dateRange[1]) {
                  setValue(
                    "organizationEventEndDate",
                    dateRange[1].toISOString()
                  );
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="organizationEventAddress"
              render={({ field: { onChange, value } }) => (
                <TextField
                  label="活動地點"
                  placeholder="請輸入活動地點"
                  fullWidth
                  onChange={onChange}
                  value={value}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Avatar
                          src="/events/map.png"
                          style={{ width: "2rem", height: "2rem" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption">活動內容</Typography>
            <input
              type="hidden"
              {...register("organizationEventDescription")}
            />
            <FroalaEditor
              filePathType={ServiceModuleValue.EVENT}
              model={watch("organizationEventDescription")}
              onModelChange={(model: string) => {
                setValue("organizationEventDescription", model);
              }}
              config={{
                heightMin: 300,
                placeholderText: "請填寫活動內容",
                quickInsertEnabled: false,
                imageOutputSize: false,
              }}
            />
            {!!errors.organizationEventDescription && (
              <FormHelperText error>
                {errors.organizationEventDescription.message}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Reminders />
          </Grid>
          <Grid item xs={12} sx={{ paddingBottom: 1 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ paddingBottom: 1 }}
            >
              <Typography variant="caption">是否為重複活動?</Typography>
              <div>
                <Button
                  variant="text"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  endIcon={<Iconify icon="mingcute:down-line" />}
                >
                  {recOption === "none" ? "否" : "是"}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setRecOption("none");
                      setValue("recurrence", "");
                      setAnchorEl(null);
                    }}
                  >
                    否
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setRecOption("custom");
                      setValue("recurrence", "RRULE:FREQ=DAILY;INTERVAL=1");
                      setAnchorEl(null);
                    }}
                  >
                    是
                  </MenuItem>
                </Menu>
              </div>
            </Box>

            <input type="hidden" {...register("recurrence")} />
            {recOption === "custom" && (
              <RecurrenceContent
                defaultValue={defaultValues?.recurrence}
                onChange={(rrule) => {
                  setValue("recurrence", rrule);
                }}
              />
            )}
          </Grid>
        </Grid>
      </Form>
      {dynTemplateList &&
        dynTemplateList?.length > 0 &&
        RenderDynamicFields &&
        RenderDynamicFields()}
    </FormProvider>
  );
};

export default EventForm;
