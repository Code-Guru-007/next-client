import React, { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import clsx from "clsx";
import { makeStyles } from "@mui/styles";

import {
  Controller,
  useForm,
  useFieldArray,
  FieldArrayWithId,
} from "react-hook-form";
import { FinanceFormInput } from "interfaces/form";
import { OrganizationFinanceType, ServiceModuleValue } from "interfaces/utils";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";
import useOrgTagGroups from "utils/useOrgTagGroups";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Tab from "@eGroupAI/material/Tab";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@mui/material/TextField";
import Form from "components/Form";
import Tabs from "components/Tabs";
import DatePicker from "components/DatePicker";
import TagAutocomplete from "components/TagAutocomplete";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

export const FORM = "FinanceForm";

const useStyles = makeStyles((theme) => ({
  tabError: {
    "& .MuiButtonBase-root": {
      color: theme.palette.error.main,
    },
    "& .MuiTabs-indicator": {
      backgroundColor: theme.palette.error.main,
    },
  },
}));

export interface FinanceFormProps {
  onSubmit: (values: FinanceFormInput) => void | Promise<void>;
  defaultValues?: FinanceFormInput;
  onDelete?: (
    el: FieldArrayWithId<
      FinanceFormInput,
      "organizationFinanceColumnList",
      "id"
    >
  ) => void;
  tabValue: OrganizationFinanceType;
  setFormIsDirty?: SetFormIsDirty;
}

const FinanceForm: FC<FinanceFormProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const { onSubmit, defaultValues, tabValue, setFormIsDirty } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const { data } = useOrgTagGroups(
    {
      organizationId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.FINANCE_TEMPLATE,
    }
  );
  const tags = useOrgTagsByGroups(data?.source);
  const { control, handleSubmit, register, reset, formState } =
    useForm<FinanceFormInput>({
      defaultValues: {
        organizationFinanceColumnList: [],
      },
    });
  const { fields } = useFieldArray({
    control,
    name: "organizationFinanceColumnList",
  });

  const hasError = Object.keys(formState.errors).length > 0;

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
    <Form
      id={FORM}
      onSubmit={handleSubmit((values) => {
        onSubmit(values);
      })}
    >
      <Tabs
        value={tabValue}
        centered
        className={clsx(hasError && classes.tabError)}
        sx={{ mt: 2, mb: 3, boxShadow: "none" }}
      >
        {tabValue === OrganizationFinanceType.INCOME && (
          <Tab
            label={wordLibrary?.income ?? "收入"}
            value={OrganizationFinanceType.INCOME}
            id="finance-income-tab"
            data-tid="finance-income-tab"
          />
        )}
        {tabValue === OrganizationFinanceType.EXPENDITURE && (
          <Tab
            label={wordLibrary?.expenditure ?? "支出"}
            value={OrganizationFinanceType.EXPENDITURE}
            id="finance-expenditure-tab"
            data-tid="finance-expenditure-tab"
          />
        )}
        {tabValue === OrganizationFinanceType.ASSET && (
          <Tab
            label={wordLibrary?.assets ?? "資產"}
            value={OrganizationFinanceType.ASSET}
            id="finance-assets-tab"
            data-tid="finance-assets-tab"
          />
        )}
        {tabValue === OrganizationFinanceType.DEBT && (
          <Tab
            label={wordLibrary?.liabilities ?? "負債"}
            value={OrganizationFinanceType.DEBT}
            id="finance-liabilities-tab"
            data-tid="finance-liabilities-tab"
          />
        )}
      </Tabs>
      <Grid container spacing={2}>
        {hasError && (
          <Grid item xs={12}>
            <Typography color="error" align="center" variant="body2">
              {wordLibrary?.["both income and expense fields are required"] ??
                "收入支出欄位皆為必填"}
            </Typography>
          </Grid>
        )}
        {fields.map((el, index) => (
          <Grid
            item
            xs={12}
            key={el.id}
            sx={{
              display:
                el.organizationFinanceType !== tabValue ? "none" : "block",
            }}
          >
            <Grid container spacing={2}>
              <input
                type="hidden"
                {...register(
                  `organizationFinanceColumnList.${index}.organizationFinanceColumnId`
                )}
              />
              <input
                type="hidden"
                {...register(
                  `organizationFinanceColumnList.${index}.organizationFinanceType`
                )}
              />
              <input
                type="hidden"
                {...register(
                  `organizationFinanceColumnList.${index}.organizationFinanceTarget.organizationFinanceTargetId`
                )}
              />
              <input
                type="hidden"
                {...register(
                  `organizationFinanceColumnList.${index}.organizationFinanceTemplate.organizationFinanceTemplateId`
                )}
              />
              <Grid item xs={12}>
                <Box alignItems="stretch">
                  <Controller
                    control={control}
                    name={`organizationFinanceColumnList.${index}.organizationFinanceColumnName`}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <>
                        <Typography align="left" variant="body2">
                          {wordLibrary?.["field name"] ?? "欄位名稱"}
                        </Typography>
                        <TextField
                          id="finance-field-name-input"
                          data-tid="finance-field-name-input"
                          fullWidth
                          multiline
                          sx={{
                            flex: 1,
                          }}
                          disabled={
                            !!el?.organizationFinanceTemplate
                              ?.organizationFinanceTemplateId
                          }
                          {...field}
                        />
                      </>
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box alignItems="center">
                  <Controller
                    control={control}
                    name={`organizationFinanceColumnList.${index}.organizationFinanceTarget.organizationFinanceTargetInsertDate`}
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Typography align="left" variant="body2">
                          {wordLibrary?.date ?? "日期"}
                        </Typography>
                        <DatePicker
                          fullWidth
                          hiddenLabel
                          onChange={(date) => {
                            if (date) onChange(date?.toISOString());
                            else onChange("");
                          }}
                          value={value ? new Date(value) : null}
                          sx={{ flex: 1 }}
                        />
                      </>
                    )}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name={`organizationFinanceColumnList.${index}.organizationFinanceTarget.organizationFinanceTargetAmount`}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, ...field } }) => (
                    <>
                      <Typography align="left" variant="body2">
                        {wordLibrary?.amount ?? "金額"}
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        inputProps={{
                          min: 0,
                          onClick: (e) => {
                            (e.target as HTMLInputElement).select();
                          },
                        }}
                        sx={{ flex: 1 }}
                        value={value}
                        onChange={(e) => {
                          // Magic: avoid first 0 & avoid negative
                          onChange(Math.abs(Number(e.target.value)).toString());
                        }}
                        id="finance-field-amount-input"
                        data-tid="finance-field-amount-input"
                        {...field}
                      />
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name={`organizationFinanceColumnList.${index}.organizationFinanceTarget.organizationTagList`}
                  rules={{ required: false }}
                  render={({ field: { onChange, ...field } }) => (
                    <>
                      <Typography align="left" variant="body2">
                        {wordLibrary?.["add tag"] ?? "新增標籤"}
                      </Typography>
                      <TagAutocomplete
                        value={tags?.filter(
                          (tag) =>
                            field.value.findIndex(
                              (el) => el.tagId === tag.tagId
                            ) !== -1
                        )}
                        serviceModuleValue={ServiceModuleValue.FINANCE_TEMPLATE}
                        onChange={(e, value) => {
                          const list = value.map((el) => ({
                            tagId: el.tagId,
                          }));
                          onChange(list);
                        }}
                        id="finance-field-tag-input"
                        data-tid="finance-field-tag-input"
                      />
                    </>
                  )}
                />
              </Grid>
            </Grid>
            <Tabs centered sx={{ mt: 2, mb: 3, boxShadow: "none" }} />
          </Grid>
        ))}
      </Grid>
    </Form>
  );
};

export default FinanceForm;
