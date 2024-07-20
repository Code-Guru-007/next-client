import React, { FC, useEffect, useRef } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useTab from "@eGroupAI/hooks/useTab";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { SalaryTemplatesFormInput } from "interfaces/form";
import { OrganizationFinanceType } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Stack from "@mui/material/Stack";
import Button from "@eGroupAI/material/Button";
import Divider from "@mui/material/Divider";
import Tabs from "@eGroupAI/material/Tabs";
import Tab from "@eGroupAI/material/Tab";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import TextField from "@mui/material/TextField";
import Form from "components/Form";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import useSetFormIsDirty, { SetFormIsDirty } from "utils/useSetFormIsDirty";

import Iconify from "minimal/components/iconify";

export const FORM = "SalaryTemplatesForm";

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

export interface SalaryTemplatesFormProps {
  onSubmit: (values: SalaryTemplatesFormInput) => void;
  defaultValues?: Partial<SalaryTemplatesFormInput>;
  organizationFinanceTemplateId?: string;
  setFormIsDirty?: SetFormIsDirty;
  editable?: boolean;
}

const SalaryTemplatesForm: FC<SalaryTemplatesFormProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    defaultValues,
    onSubmit,
    organizationFinanceTemplateId,
    setFormIsDirty,
    editable,
  } = props;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const { value: tabValue, handleChange } = useTab(
    "SalaryTemplateDialog",
    OrganizationFinanceType.INCOME
  );
  const { control, handleSubmit, register, reset, formState } =
    useForm<SalaryTemplatesFormInput>({
      defaultValues: {
        organizationFinanceTemplateName: "",
        organizationFinanceTemplateDescription: "",
        organizationFinanceColumnList: [
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.INCOME,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.EXPENDITURE,
          },
        ],
      },
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizationFinanceColumnList",
  });
  const { excute: deleteOrgSalaryTemplateColumn, isLoading } =
    useAxiosApiWrapper(apis.org.deleteOrgSalaryTemplateColumn);
  const hasError = Object.keys(formState.errors).length > 0;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    buttonRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fields]);

  useSetFormIsDirty({
    isDirty: formState.isDirty,
    setFormIsDirty,
  });

  return (
    <Form id={FORM} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="organizationFinanceTemplateName"
            render={({ field }) => (
              <TextField
                id="template-form-name-input"
                data-tid="template-form-name-input"
                {...field}
                label={wordLibrary?.["template name"] ?? "範本名稱"}
                fullWidth
                disabled={!editable}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="organizationFinanceTemplateDescription"
            render={({ field }) => (
              <TextField
                id="template-form-description-input"
                data-tid="template-form-description-input"
                {...field}
                label={wordLibrary?.["template description"] ?? "範本描述"}
                fullWidth
                multiline
                minRows={4}
                disabled={!editable}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => handleChange(v)}
            centered
            className={clsx(hasError && classes.tabError)}
          >
            <Tab id="salary-income-button" data-tid="salary-income-button" label="收入" value={OrganizationFinanceType.INCOME} />
            <Tab id="salary-expenditure-button" data-tid="salary-expenditure-button" label="支出" value={OrganizationFinanceType.EXPENDITURE} />
          </Tabs>
        </Grid>
        {hasError && (
          <Grid item xs={12}>
            <Typography color="error" align="center" variant="body2">
              {wordLibrary?.["both income and expense fields are required"] ??
                "收入支出欄位皆為必填"}
            </Typography>
          </Grid>
        )}
        <Stack sx={{ mt: 2, width: "100%" }}>
          {fields.map((el, index) => (
            <>
              <Stack
                key={el.id}
                alignItems="flex-end"
                spacing={1.5}
                sx={{
                  display:
                    el.organizationFinanceType !== tabValue ? "none" : "flex",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ width: 1 }}
                >
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
                    value={el.organizationFinanceType}
                  />
                  <Controller
                    control={control}
                    name={`organizationFinanceColumnList.${index}.organizationFinanceColumnName`}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        id="template-form-fieldname-input"
                        data-tid="template-form-fieldname-input"
                        {...field}
                        label={wordLibrary?.["field name"] ?? "欄位名稱"}
                        fullWidth
                        error={hasError}
                        disabled={!editable}
                      />
                    )}
                  />
                </Stack>
                {editable && (
                  <Button
                    id="template-form-delete-org-button"
                    data-tid="template-form-delete-org-button"
                    size="small"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    loading={isLoading}
                    onClick={async () => {
                      if (
                        el.organizationFinanceColumnId &&
                        organizationFinanceTemplateId
                      ) {
                        try {
                          await deleteOrgSalaryTemplateColumn({
                            organizationId,
                            organizationFinanceTemplateId,
                            organizationFinanceColumnId:
                              el.organizationFinanceColumnId,
                          });
                          remove(index);
                        } catch (error) {
                          apis.tools.createLog({
                            function: "deleteOrgSalaryTemplateColumn: error",
                            browserDescription: window.navigator.userAgent,
                            jsonData: {
                              data: error,
                              deviceInfo: getDeviceInfo(),
                            },
                            level: "ERROR",
                          });
                        }
                      } else {
                        remove(index);
                      }
                    }}
                    disabled={!editable}
                  >
                    {wordLibrary?.remove ?? "移除"}
                  </Button>
                )}
              </Stack>
              <Divider
                sx={{
                  borderStyle: "dashed",
                  ml: 2,
                  mt: 0.5,
                  mb: 2,
                  borderTop: "none",
                  display:
                    el.organizationFinanceType !== tabValue ? "none" : "block",
                }}
              />
            </>
          ))}
        </Stack>
        <Grid item xs={12}>
          <Stack
            spacing={3}
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-end", md: "center" }}
          >
            {editable && (
              <Button
                id="template-form-add-org-button"
                data-tid="template-form-add-org-button"
                size="small"
                color="primary"
                ref={buttonRef}
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => {
                  append({
                    organizationFinanceColumnName: "",
                    organizationFinanceType: tabValue,
                  });
                }}
                sx={{ flexShrink: 0 }}
              >
                {wordLibrary?.["add field"] ?? "新增欄位"}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Form>
  );
};

export default SalaryTemplatesForm;
