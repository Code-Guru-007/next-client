import React, { FC, useEffect } from "react";

import clsx from "clsx";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";
import {
  Controller,
  useForm,
  useFieldArray,
  FieldArrayWithId,
} from "react-hook-form";
import { FinanceFormInput } from "interfaces/form";
import { OrganizationFinanceType } from "interfaces/utils";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";

import Tab from "@eGroupAI/material/Tab";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Button from "@eGroupAI/material/Button";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@mui/material/TextField";
import Form from "components/Form";
import Tabs from "components/Tabs";
import DatePicker from "components/DatePicker";
import IconButton from "components/IconButton/StyledIconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Hidden } from "@eGroupAI/material";
import { getWordLibrary } from "redux/wordLibrary/selectors";

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
  onSubmit: (values: FinanceFormInput) => void;
  defaultValues?: FinanceFormInput;
  onDelete?: (
    el: FieldArrayWithId<
      FinanceFormInput,
      "organizationFinanceColumnList",
      "id"
    >
  ) => void;
  tabValue: OrganizationFinanceType;
  handleTabChange: (newValue: OrganizationFinanceType) => void;
  setFormIsDirty?: SetFormIsDirty;
}

const FinanceForm: FC<FinanceFormProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const { onSubmit, defaultValues, tabValue, handleTabChange, setFormIsDirty } =
    props;
  const { control, handleSubmit, register, reset, formState } =
    useForm<FinanceFormInput>({
      defaultValues: {
        organizationFinanceColumnList: [],
      },
    });
  const { fields, append, remove } = useFieldArray({
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
        if (tabValue === OrganizationFinanceType.INCOME) {
          handleTabChange(OrganizationFinanceType.EXPENDITURE);
        } else if (tabValue === OrganizationFinanceType.EXPENDITURE) {
          handleTabChange(OrganizationFinanceType.ASSET);
        } else if (tabValue === OrganizationFinanceType.ASSET) {
          handleTabChange(OrganizationFinanceType.DEBT);
        } else if (onSubmit && tabValue === OrganizationFinanceType.DEBT) {
          onSubmit(values);
        }
      })}
    >
      <Tabs
        value={tabValue}
        onChange={(_, v) => handleTabChange(v)}
        centered
        className={clsx(hasError && classes.tabError)}
        sx={{ mt: 2, mb: 3, boxShadow: "none" }}
      >
        <Tab
          label={wordLibrary?.income ?? "收入"}
          value={OrganizationFinanceType.INCOME}
        />
        <Tab
          label={wordLibrary?.expenditure ?? "支出"}
          value={OrganizationFinanceType.EXPENDITURE}
        />
        <Tab
          label={wordLibrary?.assets ?? "資產"}
          value={OrganizationFinanceType.ASSET}
        />
        <Tab
          label={wordLibrary?.liabilities ?? "負債"}
          value={OrganizationFinanceType.DEBT}
        />
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
            <Grid container>
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
              <Grid item xs={12}>
                <Box alignItems="stretch">
                  <Box style={{ float: "right" }}>
                    <Hidden>
                      <IconButton
                        onClick={() => {
                          remove(index);
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Hidden>
                  </Box>
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
                          fullWidth
                          multiline
                          sx={{
                            flex: 1,
                          }}
                          inputProps={{
                            disabled: !!el.organizationFinanceColumnId,
                          }}
                          {...field}
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
                        {...field}
                      />
                    </>
                  )}
                />
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
                            onChange(date?.toISOString());
                          }}
                          value={value ? new Date(value) : null}
                          sx={{ flex: 1 }}
                        />
                      </>
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
            <Tabs centered sx={{ mt: 2, mb: 3, boxShadow: "none" }} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => {
              append({
                organizationFinanceColumnName: "",
                organizationFinanceType: tabValue,
                organizationFinanceTemplate: {
                  organizationFinanceTemplateId: "",
                },
                organizationFinanceTarget: {
                  organizationFinanceTargetAmount: 0,
                  organizationFinanceTargetInsertDate: new Date().toISOString(),
                  organizationTagList: [
                    {
                      tagId: "",
                    },
                  ],
                },
              });
            }}
          >
            {wordLibrary?.["add field"] ?? "新增欄位"}
          </Button>
        </Grid>
      </Grid>
    </Form>
  );
};

export default FinanceForm;
