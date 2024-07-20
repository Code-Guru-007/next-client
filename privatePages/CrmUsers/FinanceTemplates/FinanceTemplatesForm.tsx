import React, { FC, useEffect, useRef } from "react";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import useTab from "@eGroupAI/hooks/useTab";
import { useSelector } from "react-redux";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { FinanceTemplatesFormInput } from "interfaces/form";
import { OrganizationFinanceType } from "interfaces/utils";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
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

export const FORM = "FinanceTemplatesForm";

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

export interface FinanceTemplatesFormProps {
  onSubmit: (values: FinanceTemplatesFormInput) => void;
  defaultValues?: Partial<FinanceTemplatesFormInput>;
  organizationFinanceTemplateId?: string;
  setFormIsDirty?: SetFormIsDirty;
  editable?: boolean;
}

const FinanceTemplatesForm: FC<FinanceTemplatesFormProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    defaultValues,
    onSubmit,
    organizationFinanceTemplateId,
    setFormIsDirty,
    editable,
  } = props;
  const classes = useStyles();
  const organizationId = useSelector(getSelectedOrgId);
  const { value: tabValue, handleChange } = useTab(
    "FinanceTemplatesDialog",
    OrganizationFinanceType.INCOME
  );
  const { control, handleSubmit, register, reset, formState } =
    useForm<FinanceTemplatesFormInput>({
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
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.ASSET,
          },
          {
            organizationFinanceColumnName: "",
            organizationFinanceType: OrganizationFinanceType.DEBT,
          },
        ],
      },
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizationFinanceColumnList",
  });
  const { excute: deleteOrgFinanceTemplateColumn } = useAxiosApiWrapper(
    apis.org.deleteOrgFinanceTemplateColumn
  );
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
  const order = ["INCOME", "EXPENDITURE", "ASSET", "DEBT"]; // Define the order

  fields.sort(
    (a, b) =>
      order.indexOf(a.organizationFinanceType) -
      order.indexOf(b.organizationFinanceType)
  );

  return (
    <Form id={FORM} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="organizationFinanceTemplateName"
            render={({ field }) => (
              <TextField
                {...field}
                label={wordLibrary?.["template name"] ?? "範本名稱"}
                fullWidth
                disabled={!editable}
                id="finance-template-name-input"
                data-tid="finance-template-name-input"
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
                {...field}
                label={wordLibrary?.["template description"] ?? "範本描述"}
                fullWidth
                multiline
                minRows={4}
                disabled={!editable}
                id="finance-template-description-input"
                data-tid="finance-template-description-input"
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
            <Tab
              label={wordLibrary?.income ?? "收入"}
              value={OrganizationFinanceType.INCOME}
              id="finance-template-tab-income"
              data-tid="finance-template-tab-income"
            />
            <Tab
              label={wordLibrary?.expenditure ?? "支出"}
              value={OrganizationFinanceType.EXPENDITURE}
              id="finance-template-tab-expenditure"
              data-tid="finance-template-tab-expenditure"
            />
            <Tab
              label={wordLibrary?.assets ?? "資產"}
              value={OrganizationFinanceType.ASSET}
              id="finance-template-tab-assets"
              data-tid="finance-template-tab-assets"
            />
            <Tab
              label={wordLibrary?.liabilities ?? "負債"}
              value={OrganizationFinanceType.DEBT}
              id="finance-template-tab-liabilities"
              data-tid="finance-template-tab-liabilities"
            />
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
                        {...field}
                        label={wordLibrary?.["field name"] ?? "欄位名稱"}
                        fullWidth
                        error={hasError}
                        disabled={!editable}
                        id={`finance-template-field-name-input-${index}`}
                        data-tid={`finance-template-field-name-input-${index}`}
                      />
                    )}
                  />
                </Stack>
                {editable && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={async () => {
                      if (
                        el.organizationFinanceColumnId &&
                        organizationFinanceTemplateId
                      ) {
                        try {
                          await deleteOrgFinanceTemplateColumn({
                            organizationId,
                            organizationFinanceTemplateId,
                            organizationFinanceColumnId:
                              el.organizationFinanceColumnId,
                          });
                          remove(index);
                        } catch (error) {
                          apis.tools.createLog({
                            function: "deleteOrgFinanceTemplateColumn: error",
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
                    id={`finance-template-field-remove-button-${index}`}
                    data-tid={`finance-template-field-remove-button-${index}`}
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
          <Stack spacing={3} direction={{ md: "row" }}>
            {editable && (
              <Button
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
                id="finance-template-field-add-button"
                data-tid="finance-template-field-add-button"
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

export default FinanceTemplatesForm;
